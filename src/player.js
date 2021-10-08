const INVENTORY_SIZE = 28;
const EQUIPMENT_SIZE = 14;

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

const EQUIPMENT =
{
    HEAD: 0,
    CAPE: 1,
    AMULET: 2,
    WEAPON: 3,
    BODY: 4,
    SHIELD: 5,
    LEGS: 7,
    GLOVES: 9,
    BOOTS: 10,
    RING: 12,
    AMMO: 13,

    MAX: EQUIPMENT_SIZE,
}

const ACCOUNT_TYPE =
{
    NORMAL: 0,
    IRONMAN: 1,
    ULTIMATE_IRONMAN: 2,
    HARDCORE_IRONMAN: 3,
    GROUP_IRONMAN: 4,
    HARDCORE_GROUP_IRONMAN: 5
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
    constructor(size)
    {
        this.items = new Array(size);
        for(var i = 0; i < size; i++)
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
        this.world = -1;
        this.position = {x:0, y:0, plane:0};
        this.inventory = new Inventory(INVENTORY_SIZE);
        this.skills = new Skills();
        this.equipment = new Inventory(EQUIPMENT_SIZE);

        this.accountType = 0;
        this.health = 10;
        this.prayer = 1;
        this.energy = 100;
    }
}

module.exports = 
{
    Player,
    Inventory,
    Item,

    INVENTORY_SIZE,
    EQUIPMENT_SIZE,
    SKILLS
}