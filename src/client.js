const {INVENTORY_SIZE, EQUIPMENT_SIZE, SKILLS} = require('./player')

class Client
{
    constructor(socket, player, worldserver)
    {
        this.socket = socket;
        this.player = player;
        this.worldserver = worldserver;
        
        socket.clientData = this;
    }

    parsePacket(packet)
    {
        this.previousPacket = packet;

        console.log(packet);

        if(packet.name != null)
            this.player.name = packet.name;
        
        if(packet.health != null)
            this.player.health = packet.health;

        if(packet.prayer != null)
            this.player.prayer = packet.prayer;

        if(packet.energy != null)
            this.player.energy = packet.energy;
            
        if(packet.world != null)
        {
            var oldWorld = this.player.world;
            var newWorld = packet.world;

            this.player.world = newWorld;

            // check if player hopped
            if(oldWorld != -1 && newWorld != -1 && oldWorld != newWorld)
                this.hop(newWorld);
        }

        if(packet.accountType != null)
            this.player.accountType = packet.accountType;

        if(packet.pos != null)
            this.player.position = packet.pos;

        if(packet.inventory != null)
        {
            for(var i = 0; i < INVENTORY_SIZE; i++)
            {
                
                if(packet.inventory[`${i}`] != null)
                {
                    var item = this.player.inventory.getSlot(i);
                    item.id = packet.inventory[`${i}`].id;
                    item.quantity = packet.inventory[`${i}`].quantity;
                }
            }
        }

        if(packet.skills != null)
        {
            for(var i = 0; i < SKILLS.TOTAL; i++)
            {
                if(packet.skills[`${i}`] != null)
                {
                    var item = this.player.skills.getSkill(i);
                    item.id = packet.skills[`${i}`].id;
                    item.experience = packet.skills[`${i}`].experience;
                }
            }
        }

        if(packet.equipment != null)
        {
            for(var i = 0; i < EQUIPMENT_SIZE; i++)
            {
                if(packet.equipment[`${i}`] != null)
                {
                    var item = this.player.equipment.getSlot(i);
                    item.id = packet.equipment[`${i}`].id;
                    item.quantity = packet.equipment[`${i}`].quantity;
                }
            }
        }
    }

    // should only be used on frontend connect event really
    // so we dont send full updates every time a frontend requests it
    createFullPacket()
    {
        var packet = {};

        packet.health = this.player.health;
        packet.prayer = this.player.prayer;
        packet.energy = this.player.energy;
        packet.name = this.player.name;
        packet.world = this.player.world;
        packet.pos = this.player.position;
        packet.accountType = this.player.accountType;

        var inventory = {};
        for(var i = 0; i < INVENTORY_SIZE; i++)
            inventory[`${i}`] = this.player.inventory.getSlot(i);

        var skills = {};
        for(var i = 0; i < SKILLS.TOTAL; i++)
            skills[`${i}`] = this.player.skills.getSkill(i);

        var equipment = {};
        for(var i = 0; i < EQUIPMENT_SIZE; i++)
            equipment[`${i}`] = this.player.equipment.getSlot(i);

        packet.inventory = inventory;
        packet.skills = skills;
        packet.equipment = equipment;

        return packet;
    }

    hop(worldId)
    {
        var world = this.worldserver;
        var worldManager = world.manager;

        var worldTo = worldManager.getWorld(worldId);
        if(worldTo == null)
        {
            console.log(`Error: Attempted to hop to invalid world id '${worldId}'`);
            return false;
        }

        console.log(`Player '${this.player.name}' hopped`);
        world.removeClient(this);
        worldTo.addClient(this);
        return true;
    }
}

module.exports = 
{
    Client
}