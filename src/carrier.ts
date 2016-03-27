import {IMyCreep} from "creep";
import {MyCreep} from "creep";

export interface IMyCarrier extends IMyCreep {
    runRoutine(spawn:Spawn):number;
}


export class MyCarrier extends MyCreep implements IMyCarrier {
    private energyDestinations:Structure[];
    //------ Constructors ----------------------------------------------------------------------------------------------
    public constructor(private creep:Creep, energy) {
        this.energyDestinations = energy.energyDestinations;
        super(creep, energy.energySources);
    }

    //------ Public Methods --------------------------------------------------------------------------------------------
    public runRoutine():number {
        if (this.creep.carry.energy === 0) {
            this.routine = [
                this.pickUpResources,
                this.getEnergyFromClosestSource
            ];
        }
        else {
            this.routine = [
                this.transferEnergyToClosestDest
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
    private transferEnergyToClosestDest() {
        let closestEnergyDest:Structure = this.creep.pos.findClosestByRange(this.energyDestinations);
        return this.transferEnergyTo(closestEnergyDest);
    }

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
            return this.transferEnergyTo(storage);
        }
        return ERR_INVALID_TARGET;
    }

    private transferEnergyToTerminal() {
        let room = this.creep.room;
        let terminal = room.terminal;
        if (!terminal || !room.storage) {
            return ERR_INVALID_TARGET;
        }
        if (room.storage.store.energy > room.storage.storeCapacity * 0.7) {
            return this.transferEnergyTo(terminal);
        }
        return ERR_NOT_ENOUGH_ENERGY;
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
