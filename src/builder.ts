import {MyCreep} from "./creep";
import {IMyCreep} from "./creep";
import {Config} from "./config";

export class Builder extends MyCreep {

    private wallMaxLife: number;

    constructor(creep:Creep, energySources:Structure[]) {
        super(creep, energySources);
    }
    //------ Public Methods --------------------------------------------------------------------------------------------
    public runRoutine():number {
        if (this.creep.carry.energy === 0) {
            this.routine = [
                this.getEnergyFromClosestSource
            ];
        }
        else {
            this.routine = [
                this.buildOnNearestConstructionSite,
                this.maintainRoads,
                this.reinforceRamparts,
                this.reinforceWalls,
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
    protected buildOnNearestConstructionSite():number {
        let closestTarget = this.findClosestByRange<ConstructionSite>(FIND_CONSTRUCTION_SITES);
        if (closestTarget) {
            return this.doOrMoveTo(this.creep.build, closestTarget, 3);
        }
        return ERR_NOT_FOUND;
    }

    private maintainRoads(spawn:Spawn):number {
        let closestRoad = <Road>this.findClosestByRange(FIND_STRUCTURES,
            (object:Structure) => (object.structureType === STRUCTURE_ROAD && (object.hits < object.hitsMax / 3)));

        if (closestRoad) {
            return this.doOrMoveTo(this.creep.repair, closestRoad, 3);
        }
        return ERR_NOT_FOUND;
    }

    private reinforce(structureType:string, maxHp:number):number {
        var target = this.findClosestByRange<Structure>(FIND_STRUCTURES, (object) => {
            return object.structureType == structureType && object.hits < maxHp;
        });
        if (target) {
            return this.doOrMoveTo(this.creep.repair, target, 3);
        }
        return ERR_NOT_FOUND;
    }

    private reinforceWalls():number {
        return this.reinforce(STRUCTURE_WALL, Config.rooms[this.creep.room.name]['towers']['wallHpMax']);
    }

    private reinforceRamparts():number {
        return this.reinforce(STRUCTURE_RAMPART, Config.rooms[this.creep.room.name]['towers']['rampartHpMax']);
    }
}

export class ControllerUpgrader extends MyCreep {
    constructor(creep:Creep, energySources:Structure[]) {
        super(creep, energySources);
    }

    private upgradeController():number {
        let target = this.creep.room.controller;
        if (target) {
            return this.doOrMoveTo(this.creep.upgradeController, target, 3);
        }
        return ERR_NOT_FOUND;
    }

    public runRoutine() {
        if (this.creep.carry.energy === 0) {
            this.routine = [
                this.getEnergyFromClosestSource
            ];
        }
        else {
            this.routine = [
                this.upgradeController
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
}

// super upgrader will get the energy from the link and upgrade on the same tick.
export class SuperControllerUpgrader extends MyCreep {
    constructor(creep:Creep, energySources:Structure[]) {
        super(creep, energySources);
    }

    public runRoutine():number {
        // always go to the controller first
        if (!this.creep.pos.isNearTo(this.creep.room.controller)) {
            return this.creep.moveTo(this.creep.room.controller);
        }
        let status;
        status = this.creep.upgradeController(this.creep.room.controller);
        if (this.creep.carry.energy <= this.creep.getActiveBodyparts('work')) {
            status = this.getEnergyFromClosestSource();
        }

        return status;
    }
}