import {MyCreep} from "creep";
import {MyFlag} from "flag";
import {Builder} from "builder";
import {IBodyPartsObject} from "creep-assembler";
export class MySettler extends Builder {
    constructor(creep:Creep,
                private claimFlags:MyFlag[]) {
        super(creep, []);
    }

    public runRoutine() {
        let destFlag = this.claimFlags[0].getFlag();
        if (!destFlag) {
            return;
        }
        if (this.creep.room.name === destFlag.room.name) {
            // heal
            //if (this.creep.ticksToLive < 200) {
            //    let closestSpawn = this.findClosestByRange(FIND_MY_SPAWNS);
            //    if (closestSpawn) {
            //        if(this.creep.pos.isNearTo(closestSpawn)) {
            //            return (closestSpawn.renewCreep(this.creep));
            //        }
            //        else {
            //            return this.creep.moveTo(closestSpawn);
            //        }
            //    }
            //}
            if (this.creep.carry.energy === this.creep.carryCapacity) {
                this.routine = [
                    this.buildOnNearestConstructionSite,
                    this.upgradeController
                ];
            }
            else if (this.creep.carry.energy < this.creep.carryCapacity && this.creep.carry.energy > 0) {
                let sources = this.findClosestByRange(FIND_SOURCES);
                // if near the source, then mine
                if (this.creep.pos.isNearTo(sources)) {
                    this.routine = [
                        this.mine
                    ];
                }
                else {
                    this.routine = [
                        this.buildOnNearestConstructionSite,
                        this.upgradeController
                    ];
                }
            }
            else {

                this.routine = [
                    this.pickUpResources,
                    this.mine
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
        else {
            this.creep.moveTo(destFlag.pos);
        }
        //let target = this.claimFlags[0].getFlag().room.controller;
        //
    }

    private mine() {
        let target = this.findClosestByRange(FIND_SOURCES);
        this.doOrMoveTo(this.creep.harvest, target);
    }

    private pickUpResources():number {
        let resources = <any>this.creep.pos.findInRange(FIND_DROPPED_RESOURCES, 20);
        if (resources.length && resources[0].amount > 10) {
            return this.doOrMoveTo(this.creep.pickup, resources[0]);
        }
        return ERR_NOT_FOUND;
    }

    private upgradeController() {
        this.doOrMoveTo(this.creep.upgradeController, this.creep.room.controller);
    }

}