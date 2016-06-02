import {IMyCreep} from "./creep";
import {MyCreep} from "./creep";

export interface IMyCarrier extends IMyCreep {
    runRoutine(spawn:Spawn):number;
}


export class MyCarrier extends MyCreep implements IMyCarrier {
    //------ Constructors ----------------------------------------------------------------------------------------------
    public constructor(creep:Creep, energy:any) {
        super(creep, energy.energySources);
        this.energyDestinations = energy.energyDestinations;
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
        let closestEnergyDest:Structure = this.creep.pos.findClosestByRange<Structure>(this.energyDestinations);
        return this.transferEnergyTo(closestEnergyDest);
    }

    private transferEnergyTo(target:Structure|Creep):number {
        return this.doOrMoveTo(_.curryRight(this.creep.transfer)(undefined)(RESOURCE_ENERGY), target);
    }

    private pickUpResources():number {
        let resources = <any>this.creep.pos.findInRange(FIND_DROPPED_RESOURCES, 10);
        if (resources.length && resources[0].amount > 10) {
            return this.doOrMoveTo(this.creep.pickup, resources[0]);
        }
        return ERR_NOT_FOUND;
    }
}
