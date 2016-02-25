import {IMyCreep} from "creep";
import {MyCreep} from "creep";

export interface IMyCarrier extends IMyCreep {
    runRoutine(spawn:Spawn):number;
}


export class MyCarrier extends MyCreep implements IMyCarrier {
    //------ Constructors ----------------------------------------------------------------------------------------------
    /**
     *
     * @param creep
     * @param {string}energySourceIds ID of a structure or a creep
     */
    public constructor(private creep:Creep, energySourceIds:string[]) {
        super(creep, energySourceIds);
        this.buildThreshold = 220;
    }

    //------ Public Methods --------------------------------------------------------------------------------------------
    public runRoutine():number {
        if (this.creep.carry.energy === 0) {
            this.routine = [
                this.pickUpResources,
                this.getEnergyFromSources
            ];
        }
        else {
            this.routine = [
                this.transferEnergyToSpawns,
                this.transferToClosestAvailableExtension,
                this.transferEnergyToTowers,
                this.transferEnergyToStorage
            ];
        }
        let actionResult = ERR_NOT_FOUND;
        let actionIndex = 0;
        while (!(actionResult === OK) && actionIndex < this.routine.length) {
            actionResult = this.routine[actionIndex].call(this);
            actionIndex++;
        }
        return actionResult;
    }

    //------ Private methods -------------------------------------------------------------------------------------------
    private transferEnergyTo(target:Structure|Creep):number {
        return this.doOrMoveTo(this.creep.transferEnergy, target);
    }

    private transferEnergyToTowers():number {
        //console.log('transferring energy to tower');
        let closestTower = this.findClosestByRange<Tower>(FIND_MY_STRUCTURES, (structure:Structure) => {
            return structure.structureType === STRUCTURE_TOWER &&
                (<Tower>structure).energy < (<Tower>structure).energyCapacity;
        });
        if (closestTower) {
            return this.doOrMoveTo(this.creep.transferEnergy, closestTower);
        }
        return ERR_INVALID_TARGET;
    }

    private transferEnergyToStorage() {
        let storage = this.creep.room.storage;
        if (storage) {
            this.transferEnergyTo(storage);
        }
    }

    private transferEnergyToSpawns() {
        let closestSpawn = this.findClosestByRange<Spawn>(FIND_MY_SPAWNS, (spawn:Spawn) => {
            return spawn.energy < spawn.energyCapacity;
        });
        if (closestSpawn) {
            return this.transferEnergyTo(closestSpawn);
        }
        return ERR_NOT_FOUND;
    }

    private pickUpResources():number {
        let resources = <any>this.creep.pos.findInRange(FIND_DROPPED_RESOURCES, 10);
        if (resources.length && resources[0].amount > 10) {
            return this.doOrMoveTo(this.creep.pickup, resources[0]);
        }
        return ERR_NOT_FOUND;
    }
}
