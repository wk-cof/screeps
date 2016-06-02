import {IBodyPartsObject} from "./creep-assembler";
export interface IMyCreep {
    //getEnergyFromSpawn:(spawn:Spawn) => boolean;
    //getEnergy:(source:Storage|Spawn|Link|Tower|Creep) => number;
    //doOrMoveTo:(action:Function, target:Structure|Creep|ConstructionSite) => number;
    //findClosestByRange:(structureType:number, filterFunction?:Function) => Structure;
    //findAllInTheRoom:(findConstant:number) => any[];
    //transferToClosestAvailableExtension:() => number;

}

export class MyCreep implements IMyCreep {
    protected buildThreshold = 199;
    protected creepMemory:CreepMemory;
    protected routine:Function[];
    protected energyDestinations:Structure[];

    public constructor(protected creep:Creep, protected energySources?:Structure[]) {
        if (energySources) {
            this.energySources = energySources;
        }
        if (_.isObject(creep)) {
            this.creepMemory = creep.memory;
        }
    }

    //------ Private methods -------------------------------------------------------------------------------------------
    protected getEnergyFromClosestSource():number {
        let closestEnergySrc:Structure = this.creep.pos.findClosestByRange(this.energySources);

        if (closestEnergySrc) {
            return this.getEnergy(closestEnergySrc);
        }
        return ERR_NOT_FOUND;
    }

    protected getEnergy(source:Structure|Creep) {
        if (this.creep.pos.isNearTo(source) === false) {
            this.creep.moveTo(source);
        }
        if ( (<Structure>source).structureType === STRUCTURE_STORAGE || (<Structure>source).structureType === STRUCTURE_TERMINAL) {
            return (<any>source).transfer(this.creep, RESOURCE_ENERGY);
        } else {
            return (<any>source).transferEnergy(this.creep);
        }
    }

    protected storeEnergy(dest:Structure|Creep){
        if (this.creep.pos.isNearTo(dest) === false) {
            return this.creep.moveTo(dest);
        }
        return this.creep.transfer(dest, RESOURCE_ENERGY);
    }

    /**
     *
     * @param action Action to perform
     * @param target Target on which to perform action
     * @param distance Optional parameter to specify the distance at which to start performing action. Default is 1
     */
    protected doOrMoveTo(action:Function, target:Structure|Creep|ConstructionSite|Source, distance?:number):number {
        if (!distance) {
            distance = 1;
        }
        let rangeToTarget = this.creep.pos.getRangeTo(target);

        if (rangeToTarget <= distance) {
            return action.call(this.creep, target);
        }
        return this.creep.moveTo(target);
    }

    protected findClosestByRange<T>(findConstant:number, filterFunction?:Function):T {
        if (filterFunction) {
            return this.creep.pos.findClosestByRange<T>(findConstant, {
                filter: filterFunction
            });
        }
        return this.creep.pos.findClosestByRange<T>(findConstant);
    }

    // cast it to the correct type when finding something in particular.
    protected findAllInTheRoom<T>(findConstant:number, filterFunction?:Function):T[] {
        if (filterFunction) {
            return this.creep.room.find<T>(findConstant, {
                filter: filterFunction
            });
        }
        //return this.creep.pos.findClosestByRange(findConstant);
        return this.creep.room.find<T>(findConstant);
    }
}
