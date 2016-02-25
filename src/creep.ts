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
    public constructor(private creep:Creep) {
        if (_.isObject(creep)){
            this.creepMemory = creep.memory;
        }
    }

    public getEnergyFromSpawn(source:Spawn|Link) {
        if (this.creep.pos.isNearTo(source) === false) {
            this.creep.moveTo(source);
        }
        else if (source.energy > this.buildThreshold) {
            source.transferEnergy(this.creep)
        }
    }

    public getEnergy(source:Structure|Creep) {
        if (this.creep.pos.isNearTo(source) === false) {
            this.creep.moveTo(source);
        }
        return (<any>source).transferEnergy(this.creep);
    }

    public transferToClosestAvailableExtension():number {
        //console.log('transferring energy to extension');
        let extension:Extension = this.findClosestByRange(FIND_MY_STRUCTURES,
            (object:Extension) => object.structureType === STRUCTURE_EXTENSION && (object.energy < object.energyCapacity));

        if (extension) {
            return this.doOrMoveTo(this.creep.transferEnergy, extension);
        }
        return ERR_NOT_FOUND;
    }

    public doOrMoveTo(action:Function, target:Structure|Creep|ConstructionSite|Source):number {
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

    public findClosestByRange<T>(findConstant:number, filterFunction?:Function):T {
        if (filterFunction) {
            return this.creep.pos.findClosestByRange(findConstant, {
                filter: filterFunction
            });
        }
        return this.creep.pos.findClosestByRange(findConstant);
    }

    // cast it to the correct type when finding something in particular.
    public findAllInTheRoom<T>(findConstant:number, filterFunction?:Function):T {
        if (filterFunction) {
            return this.creep.room.find<T>(findConstant, {
                filter: filterFunction
            });
        }
        //return this.creep.pos.findClosestByRange(findConstant);
        return this.creep.room.find<T>(findConstant);
    }
}
