export enum CreepTypes{
    builder,
    worker,
    upgrader,
    flagMiner,
    linkUpgrader,
    carrier,
    zealot,
    marine,
    zergling
}

interface IBodyPartsObject {
    move: number,
    work?: number,
    carry?: number,
    attack?: number,
    ranged_attack?: number,
    tough?: number,
    heal?: number;
}

export class CreepAssembler {

    public constructor() {

    }

    private static isLegalCreepName = (name) => {
        return _.isUndefined(Memory.creeps[name]);
    };

    private static isCreepAlive = (creepName:string) => {
        return _.isObject(Game.creeps[creepName]);
    };

    /**
     * Calculates energy required to make a creep
     * @param body Array of body parts
     * @returns {number} total creep price
     */
    private CalcPrice(body:string[]) {
        let price = 0;
        for (let i in body) {
            switch (body[i]) {
                case WORK:
                    price += 100;
                    break;
                case CARRY:
                    price += 50;
                    break;
                case MOVE:
                    price += 50;
                    break;
                case ATTACK:
                    price += 80;
                    break;
                case RANGED_ATTACK:
                    price += 150;
                    break;
                case HEAL:
                    price += 250;
                    break;
                case TOUGH:
                    price += 10;
                    break;
                default:
                    break;
            }
        }
        return price;
    }

    public static buildCreepInterface = (bodyParts:string[], spawnName:string, name:string, memory:Object) => {

        var canCreateCreep = Game.spawns[spawnName].canCreateCreep(bodyParts, name);
        console.log('cancreatecreep return: ' + canCreateCreep);
        if (canCreateCreep === OK) {
            return Game.spawns[spawnName].createCreep(bodyParts, name, memory);
        }
        return canCreateCreep;
    };

    /**
     * converts object like: {carry: 1, move: 2} into a list of body parts like ['carry', 'move', 'move']
     * @param bodyPartsObject
     * @returns {string[]} Body Part array.
     */
    private static getBodyParts(bodyPartsObject:IBodyPartsObject) {
        return _.reduce(bodyPartsObject, (result, value, key) => {
            while (value > 0) {
                result.push(key);
                value--;
            }
            return result;
        }, []);
    }

    public static buildCreep = (name:string, type:CreepTypes, spawnName:string) => {
        console.log('Attempting to build a creep: ' + name + '; type: ' + type);
        // assign body parts based on type
        let bodyParts;

        switch (type) {
            case CreepTypes.builder:
                bodyParts = CreepAssembler.getBodyParts({work: 2, carry: 8, move: 4});
                break;
            case CreepTypes.worker:
                bodyParts = CreepAssembler.getBodyParts({work: 6, carry: 2, move: 1});
                break;
            case CreepTypes.upgrader:
                bodyParts = CreepAssembler.getBodyParts({work: 10, carry: 2, move: 4});
                break;
            case CreepTypes.flagMiner:
                bodyParts = CreepAssembler.getBodyParts({work: 3, carry: 4, move: 6});
                break;
            case CreepTypes.linkUpgrader:
                bodyParts = CreepAssembler.getBodyParts({work: 5, carry: 1, move: 1});
                break;
            case CreepTypes.carrier:
                bodyParts = CreepAssembler.getBodyParts({carry: 3, move: 2});
                break;
            case CreepTypes.zealot:
                bodyParts = CreepAssembler.getBodyParts({tough: 10,  move: 6, attack: 5});
                //bodyParts = CreepAssembler.getBodyParts({attack: 1, move: 1});
                console.log('My Life for Aur!');
                break;
            case CreepTypes.zergling:
                bodyParts = CreepAssembler.getBodyParts({tough: 1,  move: 2, attack: 1});
                //bodyParts = CreepAssembler.getBodyParts({attack: 1, move: 1});
                console.log('My Life for Aur!');
                break;
            case CreepTypes.marine:
                bodyParts = CreepAssembler.getBodyParts({ranged_attack: 3, move: 2});
                break;
            default:
                bodyParts = CreepAssembler.getBodyParts({work: 1, carry: 1, move: 1});
        }

        if (_.isObject(CreepAssembler.buildCreepInterface(bodyParts, spawnName, name, {role: type}))) {
            console.log('Successfully Created a new creep: ' + name + ' with body parts: ' + bodyParts.toString());
            return true;
        }
        return false;
    };

    public static buildCreepAutoName = (type:CreepTypes, spawnName:string) => {
        let templateName:string;
        switch (type) {
            case CreepTypes.builder:
                templateName = 'builder';
                break;
            case CreepTypes.worker:
                templateName = 'worker';
                break;
            case CreepTypes.upgrader:
                templateName = 'upgrader';
                break;
            case CreepTypes.flagMiner:
                templateName = 'flagMiner';
                break;
            case CreepTypes.linkUpgrader:
                templateName = 'linkUpgrader';
                break;
            case CreepTypes.carrier:
                templateName = 'carrier';
                break;
            case CreepTypes.zealot:
                templateName = 'zealot';
                break;
            case CreepTypes.zergling:
                templateName = 'zergling';
                break;            default:
                templateName = 'default';
        }
        let index = 1;
        while (!CreepAssembler.isLegalCreepName(templateName + index)) {
            index++;
        }
        let newName = templateName + index;
        return CreepAssembler.buildCreep(newName, type, spawnName);
    };

    public static maintainCreeps = (spawn:string) => {
        //var creepNames:string[] = _.keys(Memory.creeps);
        //_.each(creepNames, (creep) => {
        //    if (!CreepAssembler.isCreepAlive(creep)) {
        //        console.log(creep + ' is ded');
        //        CreepAssembler.buildCreep(creep, Memory.creeps[creep], spawn);
        //    }
        //});
    }
}
