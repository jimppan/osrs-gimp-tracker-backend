const Api = require('./api');
const { WorldManager } = require('./worldmanager');


var worldManager = new WorldManager();

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
            
            var clients = worldManager.getClients();
            for(var i = 0; i < clients.length; i++)
            {
                // TODO: send an array instead of calling multiple emits
                socket.emit('BEND_CLIENT_JOIN', clients[i].createFullPacket());
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

                if(socket.clientData == null)
                {
                    var world = worldManager.getWorld(parsedJson.world);
                    if(world == null || !world.connectClient(socket, parsedJson))
                        socket.disconnect();
                }
            });

            // called everytime a player moves, does an action, gains exp... etc..
            socket.on('RL_UPDATE_STATE', (data) =>
            {
                var parsedJson = JSON.parse(data);
                if(socket.clientData == null)
                {
                    // if the client somehow dont exist here, disconnect him and force him to reconnect
                    socket.disconnect();
                }
                else
                {
                    // update state
                    socket.clientData.parsePacket(parsedJson);

                    // add identifier to the packet, so front end clients can identify the packet
                    parsedJson.name = socket.clientData.player.name;
                    console.log(parsedJson);

                    // volatile for updating, no need to resend old packets
                    Api.GetSocket().to('frontend').volatile.emit('BEND_CLIENT_UPDATE', parsedJson); 
                }
            });

            socket.on('disconnect', () =>
            {
                var client = socket.clientData;
                if(client == null)
                    return;

                var world = worldManager.getWorld(client.player.world);
                if(world == null)
                    return;

                world.disconnectClient(socket);
            });
        }
    });
});