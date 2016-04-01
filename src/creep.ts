import {IBodyPartsObject} from "creep-assembler";
export interface IMyCreep {
    getEnergyFromSpawn:(spawn:Spawn) => boolean;
    getEnergy:(source:Storage|Spawn|Link|Tower|Creep) => number;
    doOrMoveTo:(action:Function, target:Structure|Creep|ConstructionSite) => number;
    findClosestByRange:(structureType:number, filterFunction?:Function) => Structure;
    findAllInTheRoom:(findConstant:number) => any[];
    transferToClosestAvailableExtension:() => number;

}

export class MyCreep implements IMyCreep {
    protected buildThreshold = 199;
    protected creepMemory:CreepMemory;
    protected routine:Function[];
    protected energySources:Structure[];
    protected energyDestinations:Structure[];

    public constructor(protected creep:Creep, energySources?:Structure[]) {
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

    protected getEnergyFromSpawn(source:Spawn|Link) {
        if (this.creep.pos.isNearTo(source) === false) {
            this.creep.moveTo(source);
        }
        else if (source.energy > this.buildThreshold) {
            source.transferEnergy(this.creep)
        }
    }

    protected getEnergy(source:Structure|Creep) {
        if (this.creep.pos.isNearTo(source) === false) {
            this.creep.moveTo(source);
        }
        return (<any>source).transferEnergy(this.creep);
    }

    protected transferToClosestAvailableExtension():number {
        //console.log('transferring energy to extension');
        let extension:Extension = this.findClosestByRange(FIND_MY_STRUCTURES,
            (object:Extension) => object.structureType === STRUCTURE_EXTENSION && (object.energy < object.energyCapacity));

        if (extension) {
            return this.doOrMoveTo(this.creep.transferEnergy, extension);
        }
        return ERR_NOT_FOUND;
    }

    protected transferToClosestAvailableLink():number {
        //console.log('transferring energy to extension');
        let link:Link = this.findClosestByRange(FIND_MY_STRUCTURES,
            (object:Link) => object.structureType === STRUCTURE_LINK && (object.energy < object.energyCapacity * 0.5));

        if (link) {
            return this.doOrMoveTo(this.creep.transferEnergy, link);
        }
        return ERR_NOT_FOUND;
    }

    protected doOrMoveTo(action:Function, target:Structure|Creep|ConstructionSite|Source):number {
        //if (this.creep.pos.isNearTo(target) === false) {
        //    this.creep.moveTo(target);
        //}
        //return action.call(this.creep, target);
        if (this.creep.pos.isNearTo(target)) {
            return action.call(this.creep, target);
        }
        else {
            return this.creep.moveTo(target);
        }
    }

    /**
     * Updated version of doOrMoveTo that allows to move and do an action at the same time.
     * @param action Action to perform
     * @param target Target on which to perform action
     * @param distance Optional parameter to specify the distance at which to start performing action. Default is 1
     */
    protected doOrMoveTo2(action:Function, target:Structure|Creep|ConstructionSite|Source, distance?:number):number {
        if (!distance) {
            distance = 1;
        }
        let rangeToTarget = this.creep.pos.getRangeTo(target);
        if (rangeToTarget <= distance) {
            return action.call(this.creep, target);
        }
        if (rangeToTarget <= (distance+1)) {
            this.creep.moveTo(target);
            return action.call(this.creep, target);
        }
        return this.creep.moveTo(target);
    }

    protected findClosestByRange<T>(findConstant:number, filterFunction?:Function):T {
        if (filterFunction) {
            return this.creep.pos.findClosestByRange(findConstant, {
                filter: filterFunction
            });
        }
        return this.creep.pos.findClosestByRange(findConstant);
    }

    // cast it to the correct type when finding something in particular.
    protected findAllInTheRoom<T>(findConstant:number, filterFunction?:Function):T {
        if (filterFunction) {
            return this.creep.room.find<T>(findConstant, {
                filter: filterFunction
            });
        }
        //return this.creep.pos.findClosestByRange(findConstant);
        return this.creep.room.find<T>(findConstant);
    }
}
