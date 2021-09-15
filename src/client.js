const {INVENTORY_SIZE} = require('./player')

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
        {
            inventory[`${i}`] = this.player.inventory.getSlot(i);
        }

        packet.inventory = inventory;
        return packet;
    }
}

module.exports = 
{
    Client
}