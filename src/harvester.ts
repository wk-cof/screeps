/// <reference path="../typings/tsd.d.ts" />


class Miner {
    private sources:Source[];
    constructor(private creep:Creep) {
    }

    private getSources():Source[]{
        return this.creep.room.find<Source>(FIND_SOURCES);
    }

    public moveToSource(source:Source):number {
        return this.creep.moveTo(source);
    }

    // navigate towards the closest resource
    public moveToClosestSource() {
        if (!this.sources){
            this.sources = this.getSources();
        }

        this.creep.moveTo(this.sources[0]);
    }

    public mine():number {
        if (!this.sources){
            this.sources = this.getSources();
        }
        return this.creep.harvest(this.sources[0]);
    }
}

//class Carrier

// calculate distances to each source and store them in the local memory
function getDistancesToSources(spawn:Spawn) {
    let roomName = spawn.room.name;
    console.log('room name' + roomName);
}

// transfer energy
//Game.creeps.builder42.transferEnergy(Game.creeps.builder42.room.find(FIND_MY_STRUCTURES)[2])
let transferToClosestAvailableExtension = (creep:Creep) => {
    //var extension = creep.room.find(FIND_MY_STRUCTURES, {
    //    filter: (object:Extension) => {
    //        return object.structureType === STRUCTURE_EXTENSION && (object.energy < object.energyCapacity);
    //    }
    //});
    var extension:Extension = <Extension>creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
        filter: (object:Extension) => {
            return object.structureType === STRUCTURE_EXTENSION && (object.energy < object.energyCapacity);
        }
    });

    if (extension && creep.transferEnergy(extension) === ERR_NOT_IN_RANGE) {
        creep.moveTo(extension);
    }
};

function getExtensions(spawn:Spawn):Extension[] {
    var extensions:Extension[];
    console.log(spawn.room.name)
    return extensions;
}

var mine = function (creep:Creep, spawn:Spawn) {
    //getExtensions(spawn);
    if (creep.carry.energy < creep.carryCapacity) {
        var sources = creep.room.find<Source>(FIND_SOURCES);
        // navigate towards the closest resource
        if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(sources[0]);
        }
    }
    else {
        // check if the spawn is full. If it is, transfer to the closest empty extension.
        if (spawn.energy === spawn.energyCapacity) {
            transferToClosestAvailableExtension(creep);
        }
        else if (creep.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(spawn);
        }
    }
};

module.exports = mine;