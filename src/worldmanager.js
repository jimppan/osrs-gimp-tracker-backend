const { WorldServer } = require('./worldserver');

const STARTING_WORLD = 301;
const MAX_WORLDS = 600;

class WorldManager
{
    constructor()
    {
        this.worlds = new Array(MAX_WORLDS); // fuck it :D worlds start at 301, lets just create some extra data
        for(var i = STARTING_WORLD; i < MAX_WORLDS; i++)
            this.worlds[i] = new WorldServer(this);
    }
    
    getWorld(id)
    {
        return this.worlds[id];
    }

    // gets a list of every single client on all worlds
    getClients()
    {
        var clients = [];
        for(var i = STARTING_WORLD; i < MAX_WORLDS; i++)
        {
            var serverClients = this.getWorld(i).getClients();
            for(var [key, value] of serverClients)
                clients.push(value);
        }
        return clients;
    }
}

module.exports =
{
    WorldManager,
}