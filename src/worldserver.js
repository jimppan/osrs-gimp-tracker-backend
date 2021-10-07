const Api = require('./api')
const { Client } = require("./client");
const { Player } = require("./player");

const INVALID_WORLD = -1;

// as of 19/09/2021 theres 11211 world NPCs
const MAX_NPC = 12000 

class WorldServer
{
    constructor(manager)
    {
        this.id = INVALID_WORLD;
        this.actors = new Array(MAX_NPC);
        this.clients = new Map();
        this.manager = manager;
    }

    addClient(client)
    {
        if(client.worldserver != null)
            client.worldserver.removeClient(client);
            
        client.worldserver = this;
        this.clients.set(client.socket, client);
    }

    removeClient(client)
    {
        this.clients.delete(client.socket);
    }

    connectClient(socket, packet)
    {
        var player = new Player();
        var client = new Client(socket, player, this);

        client.parsePacket(packet);

        this.addClient(client);

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

    disconnectClient(socket)
    {
        var client = this.getClient(socket);
        if(client == null)
            return;

        socket.clientData = null;
        Api.GetSocket().to('frontend').emit('BEND_CLIENT_DISCONNECT', {name:client.player.name});
        console.log(`Player '${client.player.name}' disconnected`);
        client.socket.disconnect();
        this.removeClient(client);
    }
    
    getClient(socket)
    {
        return this.clients.get(socket);
    }

    getClients()
    {
        return this.clients;
    }
}

module.exports = 
{
    WorldServer,
}