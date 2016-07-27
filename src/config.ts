import {CreepTypes} from "creep-assembler";
export class Config {
    public static rooms = {
        E22N11: {
            creeps: {
                worker: 0,
                builder: 0,
                linkUpgrader: 1,
                carrier: 2,
                zealot: 0,
                flagMiner: 6,
                claimer: 0,
                settler: 2,
                priorityList: [CreepTypes.carrier]
            },
            towers: {
                rampartHpMax: 2000000,
                wallHpMax: 2000000
            }
        },
        E25N11: {
            creeps: {
                worker: 0,
                builder: 1,
                linkUpgrader: 1,
                carrier: 2,
                zealot: 0,
                flagMiner: 6,
                claimer: 0,
                settler: 0,
                priorityList: [CreepTypes.carrier]
            },
            towers: {
                rampartHpMax: 1500000,
                wallHpMax: 1500000
            }
        },
        E25N13: {
            creeps: {
                worker: 0,
                builder: 0,
                linkUpgrader: 1,
                carrier: 1,
                zealot: 0,
                flagMiner: 6,
                claimer: 0,
                settler: 0,
                scout: 0,
                priorityList: [CreepTypes.carrier]
            },
            towers: {
                rampartHpMax: 70000,
                wallHpMax: 70000
            }
        },
        E23N14: {
            creeps: {
                worker: 0,
                builder: 1,
                upgrader: 0,
                carrier: 0,
                zealot: 0,
                flagMiner: 3,
                claimer: 0,
                settler: 0,
                priorityList: [CreepTypes.flagMiner]
            },
            towers: {
                rampartHpMax: 10,
                wallHpMax: 10
            }
        },
        sim: {
            creeps: {
                worker: 0,
                builder: 0,
                upgrader: 0,
                carrier: 0,
                zealot: 0,
                flagMiner: 1,
                scout: 0,
                claimer: 0,
                priorityList: [CreepTypes.carrier]
            },
            towers: {
                rampartHpMax: 10,
                wallHpMax: 10
            }
        },
    };
    public static healThreshold = 500;
};
