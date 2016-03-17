import {CreepAssembler} from "creep-assembler";
import {Queue} from "misc";
import {CreepTypes} from "creep-assembler";
import {Builder} from "builder";
import {MyCarrier} from "carrier";
import {Fighter} from "fighter";
import {FlagMiner} from "flag-miner";
import {Config} from "config";
import {MyFlag} from "flag";
import {ControllerUpgrader} from "builder";
import {LinkTransfer} from "link";
import {MyCreep} from "creep";
import {MyClaimer} from "claimer";
import {MyTower} from "tower";
import {MySettler} from "settler";

export class MyRoom {
    //------ Private data ----------------------------------------------------------------------------------------------
    private spawns:Spawn[] = [];
    private extensions:Extension[] = [];
    private creeps:Creep[] = [];
    private sources:Source[] = [];
    private towers:Tower[] = [];
    private links:Link[] = [];

    private sourceFlags:MyFlag[] = [];
    private claimFlags:MyFlag[] = [];

    private room:Room;
    private roomMemory:RoomMemory;

    private roomStorage:Storage;
    private roomConfig:Config;

    private economy:number;
    //------ Constructors ----------------------------------------------------------------------------------------------
    public constructor(private roomName:string) {
        this.room = Game.rooms[roomName];
        this.roomStorage = this.room.storage || {};
        if (!this.room) {
            throw `Room ${roomName} not found.`;
        }
        this.roomConfig = Config.rooms[roomName];
        if (!this.roomConfig) {
            throw `${roomName} doesn't have a config.`;
        }
        // parse the room object from memory;
        if (!Memory.rooms[roomName]) {
            //if (true) {
            console.log('Creating new room data');
            this.roomMemory = this.constructEmptyRoom();
            this.findObjectsInRoom(true);
            this.roomMemory.active = this.findRoomCreeps();
        }
        else {
            this.roomMemory = Memory.rooms[roomName];
            this.findObjectsInRoom(false);
        }
        this.getDataFromMemory();
        this.economy = this.assessEconomy();
        //console.log(this.economy);
    }

    //------ Public Methods --------------------------------------------------------------------------------------------
    public runRoutine() {
        try {
            this.checkBuildingCreeps();

            // rebuild creeps if necessary
            _.each(this.roomConfig['creeps'], (creepCount, creepName) => {
                if (this.needsRebuilding(CreepTypes[creepName])) {
                    this.enqueueCreep(CreepTypes[creepName]);
                }
            });
        }
        catch (err) {
            console.log('encountered error while checking up on creeps');
            console.log(err);
        }

        let linkTransfer = new LinkTransfer(this.room.name);
        linkTransfer.transfer();

        let status = this.buildFromPriorityQueue(this.spawns[0]);
        if (status === ERR_NOT_FOUND) {
            this.buildFromQueue(this.spawns[0]);
        }
        this.runTowersRoutine();
        this.creepManagement();

        if (!Memory.rooms) {
            Memory.rooms = {};
        }
        this.saveActiveCreepMemory();
        Memory.rooms[this.roomName] = this.roomMemory;//this.toSerial();
    }

    public setRoomFlags(flags) {
        this.sourceFlags = _.filter(flags, (flag:MyFlag) => {
            return flag.isSourceFlag();
        });

        this.claimFlags = _.filter(flags, (flag:MyFlag) => {
            return flag.isClaimFlag();
        });
    }

    public  toSerial() {
        return <RoomMemory>JSON.stringify(this.roomMemory);
    }

    public fromSerial() {

    }

    //------ Private methods -------------------------------------------------------------------------------------------
    private creepManagement() {
        // order creeps around
        // find all full extensions
        let energySources:Structure[] = [];
        //this.spawns[0].room.find<Extension>(FIND_MY_STRUCTURES, {
        //    filter: (object:Structure) => {
        //        return object.structureType === STRUCTURE_EXTENSION &&
        //            (<Extension>object).energy === (<Extension>object).energyCapacity;
        //    }
        //});

        // find all extensions that need energy
        let energyDestinations:Structure[] = [];
        //    this.spawns[0].room.find<Extension>(FIND_MY_STRUCTURES, {
        //    filter: (object:Structure) => {
        //        return object.structureType === STRUCTURE_EXTENSION &&
        //            (<Extension>object).energy < (<Extension>object).energyCapacity;
        //    }
        //});

        _.each(this.spawns, (spawn:Spawn) => {
            if (spawn.energy < spawn.energyCapacity) {
                energyDestinations.push(spawn)
            }
            if (spawn.energy > 50) {
                energySources.push(spawn);
            }
        });

        //_.each(this.towers, (tower:Tower) => {
        //    if (tower && tower.energy < tower.energyCapacity) {
        //        energyDestinations.push(tower);
        //    }
        //});

        _.each(this.links, (link:Link) => {
            if (link) {
                if (link.energy > 99) {
                    energySources.push(link);
                }
                if (link.energy < link.energyCapacity) {
                    energyDestinations.push(link);
                }
            }
        });

        if (this.room.storage) {
            energySources.push(this.room.storage);
            // TODO: change this when implementing minerals
            if (this.room.storage.store.energy < this.room.storage.storeCapacity) {
                energyDestinations.push(this.room.storage);
            }
        }
        else {
            let extensions = this.spawns[0].room.find<Extension>(FIND_MY_STRUCTURES, {
                filter: (object:Structure) => {
                    return object.structureType === STRUCTURE_EXTENSION &&
                        (<Extension>object).energy < (<Extension>object).energyCapacity;
                }
            });
            energyDestinations = energyDestinations.concat(extensions);
        }

        for (let idx in this.creeps) {
            let creep:Creep = this.creeps[idx];
            try {
                switch (creep.memory['role']) {
                    case CreepTypes.upgrader:
                    case CreepTypes.linkUpgrader:
                        let upgSoures = this.spawns.concat(this.links);
                        let upgrader = new ControllerUpgrader(creep, energySources);
                        upgrader.runRoutine();
                        break;
                    case CreepTypes.builder:
                        let builder = new Builder(creep, energySources);
                        builder.runRoutine();
                        break;
                    case CreepTypes.carrier:
                        let carrier = new MyCarrier(creep, [this.room.storage]);
                        carrier.runRoutine();
                        break;
                    case CreepTypes.zealot:
                        let zealot = new Fighter(creep);
                        //console.log(`I'm a ${CreepAssembler.getCreepStringName(creep.memory['role'])}`);
                        zealot.runRoutine();
                        //heal(creep, spawnObject, 1400);
                        break;
                    case CreepTypes.flagMiner:
                        //console.log(`I'm a ${CreepAssembler.getCreepStringName(creep.memory['role'])}`);
                        let miner = new FlagMiner((<FlagMinerCreep>creep), energyDestinations);
                        miner.mine(this.sourceFlags);
                        break;
                    case CreepTypes.claimer:
                        let claimer = new MyClaimer(creep, this.claimFlags);
                        claimer.runRoutine();
                        break;
                    case CreepTypes.settler:
                        let settler = new MySettler(creep, this.claimFlags);
                        settler.runRoutine();
                    default:
                        break;
                }
            }
            catch (e) {
                console.log(`creep ${JSON.stringify(creep.name)} errored out. Error: ${JSON.stringify(e)}`);
            }
        }
    }

    /**
     * Creates an empty instance of room memory
     * @returns {RoomMemory}
     */
    private constructEmptyRoom():RoomMemory {
        return {
            active: [],
            building: [],
            queue: [],
            priorityQueue: [],
            links: [],
            sources: [],
            extensions: [],
            spawns: [],
            towers: []
        };
    }

// TODO: use memory to get the structures
    private findObjectsInRoom(save:boolean) {
        //// spawns
        //for (let idx in this.roomMemory.spawns) {
        //    let spawn = <Spawn>Game.getObjectById(this.roomMemory.spawns[idx]);
        //    this.spawns.push(spawn);
        //}
        //
        //// sources
        //for (let idx in this.roomMemory.sources) {
        //    let source = <Source>Game.getObjectById(this.roomMemory.sources[idx]);
        //    this.sources.push(source);
        //}
        //
        //// towers
        //for (let idx in this.roomMemory.towers) {
        //    let tower = <Tower>Game.getObjectById(this.roomMemory.towers[idx]);
        //    this.towers.push(tower);
        //    // TODO: if tower that's supposed to be there doesn't exist, rebuild it
        //}
        this.spawns = this.room.find(FIND_MY_SPAWNS);
        this.extensions = this.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_EXTENSION}});
        this.towers = this.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        this.links = this.room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_LINK}});
        this.sources = this.room.find(FIND_SOURCES);


        if (save) {
            this.roomMemory.spawns = _.pluck(this.spawns, 'id');
            this.roomMemory.extensions = _.pluck(this.extensions, 'id');
            this.roomMemory.towers = _.pluck(this.towers, 'id');
            this.roomMemory.links = _.pluck(this.links, 'id');
        }
    }

    private findRoomCreeps():CreepMemory[] {
        return _.filter<CreepMemory>(Memory.creeps, (creepMemory:CreepMemory) => {
            return creepMemory.parentRoom === this.room.name;
        });
    }

    /**
     * Deserialize data from memory
     */
    private getDataFromMemory() {
        // creeps: if the creep that's supposed to be there doesn't exist, add it to construction queued
        for (let idx in this.roomMemory.active) {
            let creep = <Creep>Game.getObjectById(this.roomMemory.active[idx].id);
            if (!creep) {
                // remove the creep from active
                delete Memory.creeps[this.roomMemory.active[idx].name];
                this.roomMemory.active.splice(idx, 1);
            }
            else {
                this.creeps.push(creep);
            }
        }
    }

    /**
     * Checks if spawn can construct a creep on top of the queued. If it can, construct it and return status.
     *
     * return {number} Status of construction.
     */
    private canCreateCreep(spawn:Spawn, creepMemory:CreepMemory):number {
        if (creepMemory && spawn) {
            return spawn.canCreateCreep(CreepAssembler.getBodyParts(creepMemory.role, this.economy));
        }
        return ERR_INVALID_ARGS;
    }

    private checkBuildingCreeps() {
        for (let idx in this.roomMemory.building) {
            let creepMemory = this.roomMemory.building[idx];
            if (!creepMemory.id) {
                let id = Game.creeps[creepMemory.name].id;
                console.log(`creep ${creepMemory.name} is missing an id. Creep's new id is: ${id}.`);
                creepMemory.id = id;
            }
            let creep:Creep = Game.getObjectById(creepMemory.id);
            if (creep && !creep.spawning) {
                // time for baby creep to leave the nest
                this.roomMemory.building.splice(idx, 1);
                this.roomMemory.active.push(creepMemory);
                Memory.creeps[creep.name] = creepMemory;
            }
        }
    }

    private buildFromPriorityQueue(spawn:Spawn):number {
        return this.build(spawn, 'priorityQueue');
    }

    private buildFromQueue(spawn:Spawn):number {
        return this.build(spawn, 'queue');
    }

    private build(spawn:Spawn, buildQueueName:string):number {
        let creepToConstruct = this.roomMemory[buildQueueName][0] || null;
        if (!creepToConstruct || !spawn) {
            return ERR_NOT_FOUND;
        }
        let canConstruct = this.canCreateCreep(spawn, creepToConstruct);
        if (canConstruct !== OK) {
            return canConstruct;
        }

        let creepName = CreepAssembler.findLegalCreepName(creepToConstruct.role);
        let creepMemory:CreepMemory = {
            id: null,
            name: creepName,
            parentSpawn: spawn.name,
            parentRoom: spawn.room.name,
            role: creepToConstruct.role
        };
        let status = spawn.createCreep(CreepAssembler.getBodyParts(creepToConstruct.role, this.economy), creepName, creepMemory);

        // if creep is created, the return is it's name
        if (_.isString(status)) {
            // remove the creep from the queued
            this.roomMemory[buildQueueName] = this.roomMemory[buildQueueName].slice(1);

            // insert the creep into building memory
            this.roomMemory.building.push(creepMemory);
        }
        return status;
    }

    private enqueueCreep(type:CreepTypes) {
        let newCreepMemory:CreepMemory = {
            id: null,
            name: null,
            parentSpawn: null,
            parentRoom: null,
            role: type
        };

        // if creep is a priority creep, put it in the priority queue
        if (this.roomConfig['creeps']['priorityList'] && this.roomConfig['creeps']['priorityList'].indexOf(type) !== -1) {
            this.roomMemory.priorityQueue.push(newCreepMemory);
        }
        else {
            this.roomMemory.queue.push(newCreepMemory);
        }
    }

    private getBuildingCreepsCount(type:CreepTypes) {
        let creepTypes = _.filter(this.roomMemory.building, {role: type});
        return creepTypes.length || 0;
    }

    private getActiveCreepsCount(type:CreepTypes) {
        let creepTypes = _.filter(this.roomMemory.active, {role: type});
        return creepTypes.length || 0;
    }

    private getQueuedCreepsCount(type:CreepTypes) {
        let normalCreepTypes = _.filter(this.roomMemory.queue, {role: type}) || [];
        let priorityCreepTypes = _.filter(this.roomMemory.priorityQueue, {role: type}) || [];
        return (normalCreepTypes.length + priorityCreepTypes.length);
    }

    private needsRebuilding(type:CreepTypes) {
        let totalCreeps = this.getBuildingCreepsCount(type) +
            this.getActiveCreepsCount(type) +
            this.getQueuedCreepsCount(type);
        return totalCreeps < this.roomConfig['creeps'][CreepAssembler.getCreepStringName(type)];
    }

    /**
     * Add data from creep's memory to the room's memory
     */
    private saveActiveCreepMemory() {
        for (let idx in this.roomMemory.active) {
            let creep = <Creep>Game.getObjectById(this.roomMemory.active[idx].id);
            if (creep) {
                _.defaults(this.roomMemory.active[idx], creep.memory);
            }
        }
    }

    private runTowersRoutine() {
        _.each(this.towers, (tower:Tower) => {
            if (tower) {
                let myTower = new MyTower(tower, this.roomConfig['towers']);
                myTower.runRoutine();
            }
        });
    }

    private assessEconomy() {
        let extensionCount = this.extensions.length;
        // Controller level 0-1
        if (extensionCount < 5) {
            return 1;
        }
        // Controller level 2
        if (extensionCount < 10) {
            return 2;
        }
        // Controller level 3
        if (extensionCount < 20) {
            return 3;
        }
        // Controller level 4
        if (extensionCount < 30) {
            return 4;
        }
        // Controller level 5
        if (extensionCount < 40) {
            return 5;
        }
        // Controller level 0-1
        if (extensionCount < 50) {
            return 6;
        }
        // Controller level 0-1
        if (extensionCount < 60) {
            return 7;
        }
        return 8;
    }
}