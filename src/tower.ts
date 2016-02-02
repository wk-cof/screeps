module TowerModule {

    export interface IMyTower {
        defendRoom():boolean;
        repairRoads():boolean;
    }



    export class MyTower implements IMyTower{
        public constructor(private tower:Tower) {
        }
        private creepHealThreshold = 0.1;
        private roadRepairThreshold = 0.3;

        public defendRoom() {
            let hostiles:Creep[] = this.tower.room.find(FIND_HOSTILE_CREEPS);
            if (hostiles.length > 0) {
                var username = hostiles[0].owner.username;
                Game.notify('User ' + username + ' spotted in room ' + this.tower.room.name, 1);
                this.tower.attack(hostiles[0]);
                return true;
            }
        }

        public repairRoads() {
            let bumpyRoads:Road[] = this.tower.room.find(FIND_STRUCTURES, {filter:
                (o:Structure) => (o.structureType == STRUCTURE_ROAD && o.hits/o.hitsMax < 0.3)});

            if(bumpyRoads.length > 0) {
                this.tower.repair(bumpyRoads[0]);
                return true;
            }
            return false;
        }

    }
}

module.exports = TowerModule;