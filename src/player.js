const INVENTORY_SIZE = 28;

const SKILLS =
{
    ATTACK: 0,
    DEFENCE: 1,
    STRENGTH: 2,
    HITPOINTS: 3,
    RANGED: 4,
    PRAYER: 5,
    MAGIC: 6,
    COOKING: 7,
    WOODCUTTING: 8,
    FLETCHING: 9,
    FISHING: 10,
    FIREMAKING: 11,
    CRAFTING: 12,
    SMITHING: 13,
    MINING: 14,
    HERBLORE: 15,
    AGILITY: 16,
    THIEVING: 17,
    SLAYER: 18,
    FARMING: 19,
    RUNECRAFT: 20,
    HUNTER: 21,
    CONSTRUCTION: 22,

    TOTAL: 23,
}

class Item 
{
    constructor(id, quantity)
    {
        this.id = id;
        this.quantity = quantity;
    }
}

class Skill 
{
    constructor(id, experience)
    {
        this.id = id;
        this.experience = experience;
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

class Skills
{
    constructor()
    {
        this.skills = new Array(SKILLS.TOTAL);
        for(var i = 0; i < SKILLS.TOTAL; i++)
            this.skills[i] = new Skill(-1, 0);
    }
    
    getSkill(id)
    {
        return this.skills[id];
    }
}

class Player
{
    constructor()
    {
        this.name = null;
        this.position = {x:0, y:0};
        this.inventory = new Inventory();
        this.skills = new Skills();
    }
}

module.exports = 
{
    Player,
    Inventory,
    Item,

    INVENTORY_SIZE,
    SKILLS
}