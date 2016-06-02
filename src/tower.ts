import {Config} from "./config";
export interface IMyTower {
    runRoutine():number;
}


export class MyTower implements IMyTower {
    private routine: Function[];
    private rampartHpMax: number;
    private wallHpMax: number;
    private roadRepairThreshold = 0.5;
    private maxRange = 25;

    public constructor(private tower:Tower, maxValues: any) {
        this.rampartHpMax = maxValues.rampartHpMax;
        this.wallHpMax = maxValues.wallHpMax;
        this.routine = [
            this.defendRoom,
            //this.healCreeps,
            this.repairRoads,
            this.reinforceRamparts,
            this.reinforceWalls
        ];
    }


    public runRoutine() {
        let actionResult = ERR_NOT_FOUND;
        let actionIndex = 0;
        while (!(actionResult === OK) && actionIndex < this.routine.length) {
            actionResult = this.routine[actionIndex].call(this);
            actionIndex++;
        }
        return actionResult;
    }

    private defendRoom() {
        let whitelist = Config.whitelist;
        let hostiles:Creep[] = this.tower.room.find<Creep>(FIND_HOSTILE_CREEPS, {
            filter: (creep:Creep) => {
                return Config.whitelist.indexOf(creep.owner.username) === -1;
            }
        });
        if (hostiles.length > 0) {
            var username = hostiles[0].owner.username;
            if (username !== 'Invader') {
                Game.notify('User ' + username + ' spotted in room ' + this.tower.room.name, 1);
            }
            return this.tower.attack(hostiles[0]);
        }
        return ERR_NOT_FOUND;
    }

    ///**
    // * Tower can only heal damaged creeps, not renew the ones that run out of ticks to live
    // * @returns {boolean} true if action was taken, false otherwise
    // */
    //public healCreeps() {
    //    let dedCreeps = this.tower.pos.findInRange<Creep>(FIND_MY_CREEPS,
    //        this.maxHealRange, {
    //            filter: (c:Creep) => c.hits < c.hitsMax
    //        });
    //    if (dedCreeps && dedCreeps.length > 0) {
    //        this.tower.heal(dedCreeps[0]);
    //        return true;
    //    }
    //    return false;
    //}

    private repairRoads() {
        let bumpyRoads:Road[] = this.tower.pos.findInRange<Road>(FIND_STRUCTURES,
            this.maxRange, {
            filter: (o:Structure) => {
                return o.structureType == STRUCTURE_ROAD && o.hits / o.hitsMax < this.roadRepairThreshold;
            }
        });

        if (bumpyRoads.length > 0) {
            return this.tower.repair(bumpyRoads[0]);
        }
        return ERR_NOT_FOUND;
    }

    private reinforce(structureType:string, maxHP: number) {
        let target = this.tower.room.find<Structure>(FIND_STRUCTURES, {
            filter: (object) => {
                return object.structureType == structureType && object.hits < maxHP;
            }
        });
        if (target.length) {
            if (this.tower.repair(target[0]) === OK) {
                return true
            }
        }
        return false;
    }
    private reinforceRamparts() {
        return this.reinforce(STRUCTURE_RAMPART, this.rampartHpMax);
    }

    private reinforceWalls() {
        return this.reinforce(STRUCTURE_WALL, this.wallHpMax);
    }
}
