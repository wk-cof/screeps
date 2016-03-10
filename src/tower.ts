export interface IMyTower {
    defendRoom():boolean;
    repairRoads():boolean;
    healCreeps():boolean;
    runRoutine():boolean;
}


export class MyTower implements IMyTower {
    public constructor(private tower:Tower) {
    }

    private maxHealRange = 15;

    private roadRepairThreshold = 0.5;
    private maxRepairRange = 15;

    public runRoutine() {
        // De Morgan law ftw :)
        return !(!this.defendRoom() &&
            !this.healCreeps() &&
            !this.repairRoads() &&
            !this.reinforce(STRUCTURE_WALL));
    }

    public defendRoom() {
        let hostiles:Creep[] = this.tower.room.find<Creep>(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            var username = hostiles[0].owner.username;
            Game.notify('User ' + username + ' spotted in room ' + this.tower.room.name, 1);
            this.tower.attack(hostiles[0]);
            return true;
        }
        return false;
    }

    /**
     * Tower can only heal damaged creeps, not renew the ones that run out of ticks to live
     * @returns {boolean} true if action was taken, false otherwise
     */
    public healCreeps() {
        let dedCreeps = this.tower.pos.findInRange<Creep>(FIND_MY_CREEPS,
            this.maxHealRange, {
                filter: (c:Creep) => c.hits < c.hitsMax
            });
        if (dedCreeps && dedCreeps.length > 0) {
            this.tower.heal(dedCreeps[0]);
            return true;
        }
        return false;
    }

    public repairRoads() {
        let bumpyRoads:Road[] = this.tower.pos.findInRange<Road>(FIND_STRUCTURES,
            this.maxRepairRange, {
            filter: (o:Structure) => {
                return o.structureType == STRUCTURE_ROAD && o.hits / o.hitsMax < this.roadRepairThreshold;
            }
        });

        if (bumpyRoads.length > 0) {
            this.tower.repair(bumpyRoads[0]);
            return true;
        }
        return false;
    }

    public reinforce(structureType:string) {
        var target = this.tower.room.find(FIND_STRUCTURES, {
            filter: (object) => {
                return object.structureType == structureType && object.hits < 1000;
            }
        });
        if (target.length) {
            if (this.tower.repair(target[0]) === OK) {
                return true
            }
        }
        return false;
    }
}
