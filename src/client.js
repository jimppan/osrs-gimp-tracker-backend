const {INVENTORY_SIZE, EQUIPMENT_SIZE, SKILLS} = require('./player')

class Client
{
    constructor(socket, player)
    {
        this.socket = socket;
        this.player = player;
    }

    parsePacket(packet)
    {
        this.previousPacket = packet;

        console.log(packet);

        if(packet.name != null)
            this.player.name = packet.name;

        if(packet.pos != null)
        {
            this.player.position = packet.pos;
        }

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

        packet.name = this.player.name;
        packet.pos = this.player.position;

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
}

module.exports = 
{
    Client
}