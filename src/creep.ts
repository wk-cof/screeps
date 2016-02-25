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
    protected energySourceIds:string[];

    public constructor(private creep:Creep, energySourceIds?:string[]) {
        if (energySourceIds) {
            this.energySourceIds = energySourceIds;
        }
        if (_.isObject(creep)){
            this.creepMemory = creep.memory;
        }
    }

    //------ Private methods -------------------------------------------------------------------------------------------
    protected getEnergyFromSources():number {
        for (let idx in this.energySourceIds) {
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
