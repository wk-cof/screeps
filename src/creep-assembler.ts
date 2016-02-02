module Build {

    export enum CreepTypes{
        builder,
        worker,
        upgrader,
        linkMiner,
        carrier
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

        public static buildCreepInterface = (bodyParts:string[], spawnName:string, name:string, memory:Object) => {

            var canCreateCreep = Game.spawns[spawnName].canCreateCreep(bodyParts, name);
            console.log('cancreatecreep return: ' + canCreateCreep);
            if (canCreateCreep === OK) {
                return Game.spawns[spawnName].createCreep(bodyParts, name, memory);
            }
            return canCreateCreep;
        };

        public static buildCreep = (name:string, type:CreepTypes, spawnName:string) => {
            console.log('Attempting to build a creep: ' + name + '; type: ' + type);
            // assign body parts based on type
            let bodyParts;

            switch (type) {
                case CreepTypes.builder:
                    bodyParts = [WORK, WORK, CARRY, MOVE];
                    break;
                case CreepTypes.worker:
                    bodyParts = [WORK, WORK, CARRY, CARRY, MOVE];
                    break;
                case CreepTypes.upgrader:
                    bodyParts = [WORK, WORK, CARRY, CARRY, MOVE];
                    break;
                case CreepTypes.linkMiner:
                    bodyParts = [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE];
                    break;
                case CreepTypes.carrier:
                    bodyParts = [CARRY, MOVE, CARRY, CARRY, MOVE];
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