export enum CreepTypes{
    builder,
    worker,
    upgrader,
    flagMiner,
    linkUpgrader,
    carrier,
    zealot,
    marine,
    scout,
    claimer,
    settler
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
        let existingCreepNames = _.keys(Game.creeps);
        return existingCreepNames.indexOf(name) === -1;
    };

    public static findLegalCreepName(type:CreepTypes):string {
        let namePrefix = CreepAssembler.getCreepStringName(type);
        let index = 1;
        while (!CreepAssembler.isLegalCreepName(namePrefix + index)) {
            index++;
        }
        return namePrefix + index;
    }

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
     * Creates a body parts like ['carry', 'move', 'move'] from creepType
     * @param creepType Type of the creep in the list
     * @returns {string[]} Body Part array.
     */
    public static getBodyParts(creepType:CreepTypes) {
        let bodyPartsObject = CreepAssembler.getBodyPartsObject(creepType) || [];
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

        let bodyParts = CreepAssembler.getBodyParts(type);
        if (_.isObject(CreepAssembler.buildCreepInterface(bodyParts, spawnName, name, {role: type}))) {
            console.log('Successfully Created a new creep: ' + name + ' with body parts: ' + bodyParts.toString());
            return true;
        }
        return false;
    };

    public static buildCreepAutoName = (type:CreepTypes, spawnName:string) => {
        let templateName = CreepAssembler.getCreepStringName(type);

        let newName = CreepAssembler.findLegalCreepName(type);
        return CreepAssembler.buildCreep(newName, type, spawnName);
    };

    public static getCreepStringName(type:CreepTypes):string {
        return CreepTypes[type];
    }

    private static getBodyPartsObject(type:CreepTypes):IBodyPartsObject {
        switch (type) {
            case CreepTypes.scout:
                return {
                    move: 1
                }
            case CreepTypes.builder:
                return {
                    work: 2,
                    carry: 2,
                    move: 4
                };
            case CreepTypes.worker:
                return {
                    work: 1,
                    carry: 2,
                    move: 2
                };
            case CreepTypes.upgrader:
                return {
                    work: 3,
                    carry: 3,
                    move: 6
                };
            case CreepTypes.flagMiner:
                return {
                    work: 1,
                    carry: 1,
                    move: 2
                };
            case CreepTypes.linkUpgrader:
                return {
                    work: 5,
                    carry: 1,
                    move: 1
                };
            case CreepTypes.carrier:
                return {
                    carry: 3,
                    move: 2
                };
            case CreepTypes.zealot:
                return {
                    tough: 5,
                    attack: 5,
                    move: 3
                };
            case CreepTypes.marine:
                return {
                    move: 2,
                    ranged_attack: 3
                };
            case CreepTypes.claimer:
                return {
                    move: 1,
                    claim: 1
                };
            case CreepTypes.settler:
                return {
                    move: 4,
                    carry: 2,
                    work: 2
                };
            default:
                return {
                    work: 1,
                    carry: 1,
                    move: 1
                };
        }
    }
}
