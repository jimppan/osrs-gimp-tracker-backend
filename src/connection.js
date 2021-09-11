const Api = require('./api')

var CLIENTS = new Map();

class Player
{
    constructor(name, position)
    {
        this.name = name;
        this.position = position;
    }
}

class Client
{
    constructor(socket, player)
    {
        this.socket = socket;
        this.player = player;
    }
}

function ConnectClient(socket, player)
{
    var client = new Client(socket, player);
    CLIENTS.set(socket, client);

    // emit every connected frontend that a client connected
    Api.GetSocket().to('frontend').emit('BEND_CLIENT_JOIN', {name:player.name, pos:player.position});

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
            for(var [key, value] of CLIENTS)
            {
                // TODO: send an array instead of calling multiple emits
                socket.emit('BEND_CLIENT_JOIN', {name:value.player.name, pos:value.player.position});
            }
        }
        else if(system == 'runelite')
        {
            socket.join(system);
            // runelite client connected, can now expect data from the client

            // called once a client connects, send its initial state
            socket.on('RL_CONNECT_STATE', (data) =>
            {
                var parsedJson = JSON.parse(data);

                if(GetClient(socket) == null)
                    ConnectClient(socket, new Player(parsedJson.name, parsedJson.pos));
            });

            // called everytime a player moves, does an action, gains exp... etc..
            socket.on('RL_UPDATE_STATE', (data) =>
            {
                console.log(data);

                var parsedJson = JSON.parse(data);
                var client = GetClient(socket)
                if(client == null)
                {
                    client = ConnectClient(socket, new Player(parsedJson.name, parsedJson.pos));
                }
                else
                {
                    // update state
                    client.player.position = parsedJson.pos;

                    // if player is connected, move him
                    Api.GetSocket().to('frontend').emit('BEND_CLIENT_UPDATE', {name:client.player.name, pos:client.player.position});
                }
            });

            socket.on('disconnect', () =>
            {
                DisconnectClient(socket);
            });
        }
    });
});

module.exports = 
{
    Client,
    Player,

    ConnectClient,
    GetClient,
    DisconnectClient,
}