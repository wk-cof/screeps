import {Builder} from "./builder";
import {ControllerUpgrader} from "./builder";
import {SuperControllerUpgrader} from "./builder";
import {MyCarrier} from "./carrier";
import {MyClaimer} from "./claimer";
import {Config} from "./config";
import {MyCreep} from "./creep";
import {CreepAssembler} from "./creep-assembler";
import {CreepTypes} from "./creep-assembler";
import {Fighter} from "./fighter";
import {MyFlag} from "./flag";
import {FlagMiner} from "./flag-miner";
import {LinkTransfer} from "./link";
import {Queue} from "./misc";
import {MySettler} from "./settler";
import {MyTower} from "./tower";

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

    private roomConfig:Config;

    private economy:number;
    //------ Constructors ----------------------------------------------------------------------------------------------
    public constructor(private roomName:string) {
        this.room = Game.rooms[roomName];
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

        // this patch specifically address the situation where the room can't build a new carrier creep because it costs more than the
        // available energy in the room.
        if (this.economy > 6 && this.roomMemory.active.length === 0 && this.room.energyAvailable === 300) {
            this.economy = 6;
        }
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

        for (let idx in this.spawns) {
            let status = this.buildFromPriorityQueue(this.spawns[idx]);
            if (status === ERR_NOT_FOUND) {
                this.buildFromQueue(this.spawns[idx]);
            }
        }
        this.runTowersRoutine();
        this.creepManagement();

        if (!Memory.rooms) {
            Memory.rooms = {};
        }
        this.saveActiveCreepMemory();
        Memory.rooms[this.roomName] = this.roomMemory;
    }

    public setRoomFlags(flags) {
        this.sourceFlags = _.filter(flags, (flag:MyFlag) => {
            return flag.isSourceFlag();
        });

        this.claimFlags = _.filter(flags, (flag:MyFlag) => {
            return flag.isClaimFlag();
        });
    }

    //------ Private methods -------------------------------------------------------------------------------------------
    /**
     * This function figures out which objects in the room serve as sources vs destinations
     */
    private roomEnergy() {
        // All creeps will use same sources and destinations except for carriers.
        // Carriers need to redistribute the energy, hence they need special rules.
        let nrgSrc:Structure[] = [];
        let nrgDest:Structure[] = [];

        let carrierSrc:Structure[] = [];
        let carrierDest:Structure[] = [];

        if (this.room.storage) {
            let totalReources = _.sum(<any>this.room.storage.store);
            let storageEnergy = this.room.storage.store.energy;
            // if there's a non-empty storage, add it as a source
            if (storageEnergy > 50) {
                nrgSrc.push(this.room.storage);
                carrierSrc.push(this.room.storage);
            }
            if( totalReources < this.room.storage.storeCapacity) {
                nrgDest.push(this.room.storage);
            }

            // spawns
            _.each(this.spawns, (spawn:Spawn) => {
                if (spawn.energy < spawn.energyCapacity - 50) {
                    nrgDest.push(spawn);
                    carrierDest.push(spawn);
                }
            });

            // links
            _.each(this.links, (link:Link) => {
                if (link) {
                    if (link.energy > 99) {
                        nrgSrc.push(link);
                    }
                    if (link.energy < link.energyCapacity) {
                        nrgDest.push(link);
                    }

                    if (link.energy < link.energyCapacity/2) {
                        carrierDest.push(link);
                    }
                }
            });

            // terminals
            if (this.room.terminal) {
                if (storageEnergy > this.room.storage.storeCapacity * 0.7) {
                    if (this.room.terminal.store.energy < this.room.terminal.storeCapacity) {
                        nrgDest.push(this.room.terminal);
                        carrierDest.push(this.room.terminal);
                    }
                }
                else if (this.room.terminal.store.energy > 0) {
                    nrgSrc.push(this.room.terminal);
                    carrierSrc = [this.room.terminal];
                }
            }

            // extensions
            _.each(this.extensions, (extension:Extension) => {
                if (extension.energy < extension.energyCapacity) {
                    carrierDest.push(extension);
                }
            });
        }
        else {
            // spawns
            _.each(this.spawns, (spawn:Spawn) => {
                if (spawn.energy < spawn.energyCapacity) {
                    nrgDest.push(spawn);
                }
                if (spawn.energy > 50) {
                    nrgSrc.push(spawn);
                }

                if (spawn. energy < 100) {
                    carrierDest.push(spawn);
                }
                else if (spawn.energy > 199) {
                    carrierSrc.push(spawn);
                }
            });

            // extensions
            _.each(this.extensions, (extension:Extension) => {
                if (extension.energy < extension.energyCapacity) {
                    carrierDest.push(extension);
                    nrgDest.push(extension);
                }
                else {
                    nrgSrc.push(extension);
                }
            });
        }

        // towers
        _.each(this.towers, (tower:Tower) => {
            if (tower.energy < (tower.energyCapacity - 100)) {
                carrierDest.push(tower);
            }
        });

        if (carrierDest.length === 0 && this.room.storage) {
            carrierDest.push(this.room.storage);
        }

        return {
            creeps: {
                energySources: nrgSrc,
                energyDestinations: nrgDest
            },
            carriers: {
                energySources: carrierSrc,
                energyDestinations: carrierDest
            }
        }
    }

    private creepManagement() {
        let energy = this.roomEnergy();
        for (let idx in this.creeps) {
            let creep:Creep = this.creeps[idx];
            try {
                switch (creep.memory['role']) {
                    case CreepTypes.upgrader:
                    case CreepTypes.linkUpgrader:
                        let upgrader = new ControllerUpgrader(creep, energy.creeps.energySources);
                        upgrader.runRoutine();
                        break;
                    case CreepTypes.superLinkUpgrader:
                        let superUpgrader = new SuperControllerUpgrader(creep, this.links);
                        superUpgrader.runRoutine();
                        break;
                    case CreepTypes.builder:
                        let builder = new Builder(creep, energy.creeps.energySources);
                        builder.runRoutine();
                        break;
                    case CreepTypes.carrier:
                        let carrier = new MyCarrier(creep, energy.carriers);
                        carrier.runRoutine();
                        break;
                    case CreepTypes.zealot:
                        let zealot = new Fighter(creep);
                        zealot.runRoutine();
                        break;
                    case CreepTypes.flagMiner:
                        let miner = new FlagMiner((<FlagMinerCreep>creep), energy.creeps.energyDestinations);
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
        this.spawns = this.room.find<Spawn>(FIND_MY_SPAWNS);
        this.extensions = this.room.find<Extension>(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_EXTENSION}});
        this.towers = this.room.find<Tower>(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
        this.links = this.room.find<Link>(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_LINK}});
        this.sources = this.room.find<Source>(FIND_SOURCES);


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
            if (!creepMemory.id && Game.creeps[creepMemory.name]) {
                let id = Game.creeps[creepMemory.name].id;
                console.log(`creep ${creepMemory.name} is missing an id. Creep's new id is: ${id}.`);
                creepMemory.id = id;
            }
            let creep:Creep = Game.getObjectById<Creep>(creepMemory.id);
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
        // Controller level 6
        if (extensionCount < 50) {
            return 6;
        }
        // Controller level 7
        if (extensionCount < 60) {
            return 7;
        }
        // Controller level 8
        return 8;
    }
}