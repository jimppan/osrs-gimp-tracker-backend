const Api = require('./api')
const {Client} = require('./client')
const {Player} = require('./player')

var CLIENTS = new Map();

function ConnectClient(socket, packet)
{
    var player = new Player();
    var client = new Client(socket, player);

    client.parsePacket(packet);
    CLIENTS.set(socket, client);

    if(client.player.name == null)
    {
        // name was not passed, bad packet
        // TODO: better packet validation later
        return false;
    }

    // emit every connected frontend that a client connected
    
    var fullPacket = client.createFullPacket();
    Api.GetSocket().to('frontend').emit('BEND_CLIENT_JOIN', fullPacket);
    
    console.log(`Player '${player.name}' connected`);
    return client;
}

function GetClient(socket)
{
    return CLIENTS.get(socket);
}

function DisconnectClient(socket)
{
    var client = CLIENTS.get(socket);
    if(client == null)
        return;

    Api.GetSocket().to('frontend').emit('BEND_CLIENT_DISCONNECT', {name:client.player.name});
    console.log(`Player '${client.player.name}' disconnected`);
    client.socket.disconnect();
    CLIENTS.delete(socket);
}

Api.OnApiInitialized(() =>
{
    Api.GetSocket().use((socket, next) =>
    {
        var system = socket.request._query.system;
        if(system != 'runelite' && system != 'frontend')
        {
            console.log(socket.request._query);
            console.log(`Invalid client attempted to connect '${system}'`);
            socket.disconnect();
        }

        // _query.system = frontend or runelite
        next();
    })

    Api.GetSocket().on('connection', (socket, data) =>
    {
        var system = socket.request._query.system;
        // send existing clients to new frontend connections
        if(system == 'frontend')
        {
            socket.join(system);
            console.log("frontend connection!");
            for(var [key, value] of CLIENTS)
            {
                // TODO: send an array instead of calling multiple emits
                socket.emit('BEND_CLIENT_JOIN', value.createFullPacket());
            }
        }
        else if(system == 'runelite')
        {
            console.log("backend connection!");
            // if the client claims to connect from runelite, check authorization
            if(!Api.IsAuthorized(socket))
            {
                console.log(`Authorization failed, incorrect password: ${socket.handshake.auth.token}`);
                socket.disconnect();
                return;
            }

            socket.emit('authorize', 'success');
            socket.join(system);
            // runelite client connected, can now expect data from the client

            // called once a client connects, send its initial state
            socket.on('RL_CONNECT_STATE', (data) =>
            {
                var parsedJson = JSON.parse(data);

                if(GetClient(socket) == null)
                {
                    if(!ConnectClient(socket, parsedJson))
                        socket.disconnect();
                }
            });

            // called everytime a player moves, does an action, gains exp... etc..
            socket.on('RL_UPDATE_STATE', (data) =>
            {
                var parsedJson = JSON.parse(data);
                var client = GetClient(socket)
                if(client == null)
                {
                    // if the client somehow dont exist here, disconnect him and force him to reconnect
                    socket.disconnect();
                    //client = ConnectClient(socket, new Player(parsedJson.name, parsedJson.pos));
                }
                else
                {
                    // update state
                    client.parsePacket(parsedJson);

                    //var fullPacket = client.createFullPacket();

                    // add identifier to the packet, so front end clients can identify the packet
                    parsedJson.name = client.player.name;
                    console.log(parsedJson);

                    // volatile for updating, no need to resend old packets
                    Api.GetSocket().to('frontend').volatile.emit('BEND_CLIENT_UPDATE', parsedJson); 
                }
            });

            socket.on('disconnect', () =>
            {
                DisconnectClient(socket);
            });
        }
    });
});