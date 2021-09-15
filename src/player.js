const INVENTORY_SIZE = 28;

class Item 
{
    constructor(id, quantity)
    {
        this.id = id;
        this.quantity = quantity;
    }
}

class Inventory
{
    constructor()
    {
        this.items = new Array(INVENTORY_SIZE);
        for(var i = 0; i < INVENTORY_SIZE; i++)
            this.items[i] = new Item(-1, 0);
    }
    
    getSlot(slot)
    {
        return this.items[slot];
    }

    setSlot(slot, item)
    {
        this.items[slot] = item;
    }
}

class Player
{
    constructor()
    {
        this.name = null;
        this.position = {x:0, y:0};
        this.inventory = new Inventory();
    }
}

module.exports = 
{
    Player,
    Inventory,
    Item,

    INVENTORY_SIZE
}