import {MyCreep} from "creep";
import {MyFlag} from "flag";
export class MyClaimer extends MyCreep {
    constructor(creep:Creep,
                private claimFlags:MyFlag[]) {
        super(creep);
    }

    public runRoutine() {
        let destFlag = this.claimFlags[0].getFlag();
        console.log('dest ' + JSON.stringify(destFlag));
        if (!destFlag) {
            return;
        }
        if (this.creep.room.name === destFlag.roomName) {
            this.doOrMoveTo(this.creep.claimController, this.creep.room.controller);
        }
        else {
            console.log(this.creep.moveTo(destFlag.pos));
        }
        //let target = this.claimFlags[0].getFlag().room.controller;
        //
    }
}