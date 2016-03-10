import {MyCreep} from "creep";
import {MyFlag} from "flag";
import {Builder} from "builder";
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
        if (this.creep.room.name === destFlag.roomName) {
                //if (this.creep.carry.energy === 0) {
                if (this.creep.carry.energy < this.creep.carryCapacity) {
                    this.routine = [
                        this.mine
                    ];
                }
                else {
                    this.routine = [
                        this.buildOnNearestConstructionSite
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

    private upgradeController() {
        this.doOrMoveTo(this.creep.upgradeController, this.creep.room.controller);
    }

}