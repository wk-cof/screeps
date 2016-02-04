module Build {

    export enum CreepTypes{
        builder,
        worker,
        upgrader,
        linkMiner,
        carrier
    }

    interface IBodyPartsObject{
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
        private static getBodyParts(bodyPartsObject: IBodyPartsObject){
            return _.reduce(bodyPartsObject, (result, value, key) => {
                while(value > 0) {
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
                    bodyParts = [WORK, WORK, CARRY, MOVE, MOVE];
                    break;
                case CreepTypes.worker:
                    bodyParts = [WORK, CARRY, MOVE, WORK, CARRY, WORK, CARRY, MOVE];
                    break;
                case CreepTypes.upgrader:
                    bodyParts = [WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE];
                    break;
                case CreepTypes.linkMiner:
                    bodyParts = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE];
                    break;
                case CreepTypes.carrier:
                    bodyParts = [CARRY,CARRY, CARRY,  MOVE, MOVE];
                    break;
                default:
                    bodyParts = [WORK, WORK, CARRY, MOVE];
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
                case CreepTypes.linkMiner:
                    templateName = 'linkMiner';
                    break;
                case CreepTypes.carrier:
                    templateName = 'carrier';
                    break;
                default:
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


}

module.exports = Build;