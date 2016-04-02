import {MyCreep} from "creep";
import {IMyCreep} from "creep";
import {Config} from "config";

export interface IBuilder extends IMyCreep {
    //buildOnNearestConstructionSite(spawn:Spawn): void;
    //upgradeController(spawn:Spawn): void;
    //maintainRoads(spawn:Spawn): void;
    //reinforce(energySource:Spawn|Link|Storage, structureType:string): boolean;
    runRoutine();
}

export class Builder extends MyCreep implements IBuilder {

    private wallMaxLife: number;

    constructor(private creep:Creep, energySources:Structure[]) {
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
    /**
     * building is different from the rest of the actions since it can be performed from several tiles away.
     * TODO: Find a better way to estimate the distance in order to avoid unnecessary build calls
     */
    protected buildOrMoveTo(buildTarget:ConstructionSite):number {
        let buildStatus = this.creep.build(buildTarget);
        if (buildStatus === ERR_NOT_IN_RANGE) {
            return this.creep.moveTo(buildTarget);
        }
        return buildStatus;
    }

    protected repairOrMoveTo(buildTarget:Structure):number {
        let buildStatus = this.creep.repair(buildTarget);
        if (buildStatus === ERR_NOT_IN_RANGE) {
            return this.creep.moveTo(buildTarget);
        }
        return buildStatus;
    }


    protected buildOnNearestConstructionSite():number {
        let closestTarget = this.findClosestByRange<ConstructionSite>(FIND_CONSTRUCTION_SITES);
        if (closestTarget) {
            return this.buildOrMoveTo(closestTarget);
        }
        return ERR_NOT_FOUND;
    }

    private maintainRoads(spawn:Spawn):number {
        let closestRoad = <Road>this.findClosestByRange(FIND_STRUCTURES,
            (object:Structure) => (object.structureType === STRUCTURE_ROAD && (object.hits < object.hitsMax / 3)));

        if (closestRoad) {
            return this.doOrMoveTo(this.creep.repair, closestRoad);
        }
        return ERR_NOT_FOUND;
    }

    private reinforce(structureType:string, maxHp:number):number {
        var target = this.findClosestByRange(FIND_STRUCTURES, (object) => {
            return object.structureType == structureType && object.hits < maxHp;
        });
        if (target) {
            return this.repairOrMoveTo(target);
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
    constructor(private creep:Creep, energySources:Structure[]) {
        super(creep, energySources);
    }

    private upgradeController():number {
        let target = this.creep.room.controller;
        if (target) {
            return this.doOrMoveTo(this.creep.upgradeController, target);
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
    constructor(private creep:Creep, energySources:Structure[]) {
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