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
    public constructor(private creep:Creep, private energySourceIds: string[] ) {
        super(creep);
        this.buildThreshold = 220;
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

    private getEnergyFromSources():number {
        for(let idx in this.energySourceIds) {
            let structure = Game.getObjectById<Structure>(this.energySourceIds[idx]);
            if (structure) {
                let getEnergy = false;
                switch (structure.structureType) {
                    case STRUCTURE_STORAGE:
                        getEnergy = (<Storage>structure).store.energy < (<Storage>structure).storeCapacity;
                        break;
                    case STRUCTURE_LINK:
                        getEnergy = (<Link>structure).energy < (<Link>structure).energyCapacity * 0.5;
                        break;
                    case STRUCTURE_EXTENSION:
                        getEnergy = (<Extension>structure).energy < (<Extension>structure).energyCapacity;
                        break;
                    case STRUCTURE_SPAWN:
                        getEnergy = (<Spawn>structure).energy < (<Spawn>structure).energyCapacity;
                        break;
                    case STRUCTURE_TOWER:
                        getEnergy = (<Tower>structure).energy < (<Tower>structure).energyCapacity;
                        break;
                    case undefined:
                        //probably a creep
                        // TODO: Handle creeps
                        break;
                    default:
                        break;
                }
                if (getEnergy) {
                    return this.getEnergy(structure);
                }
            }

        }
        return ERR_NOT_FOUND;
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

    //------ Public Methods --------------------------------------------------------------------------------------------

    public runRoutine():number {
        let routine:Function[];
        if (this.creep.carry.energy === 0) {
            routine = [
                this.pickUpResources,
                this.getEnergyFromSources
            ];
                //this.getEnergy;
        }
        else {
            routine = [
                this.transferEnergyToSpawns,
                this.transferToClosestAvailableExtension,
                this.transferEnergyToTowers,
                this.transferEnergyToStorage
            ];
        }
            let actionResult = ERR_NOT_FOUND;
            let actionIndex = 0;
            while (!(actionResult === OK) && actionIndex < routine.length) {
                actionResult = routine[actionIndex].call(this);
                actionIndex++;
            }
            return actionResult;
    }

}
