import {MyCreep} from "./creep";
import {MyFlag} from "./flag";
export class MyClaimer extends MyCreep {
    constructor(creep:Creep,
                private claimFlags:MyFlag[]) {
        super(creep);
    }

    public runRoutine() {
        if (!this.claimFlags || !this.claimFlags.length) {
            return ERR_INVALID_TARGET;
        }
        let destFlag = this.claimFlags[0].getFlag();
        if (!destFlag) {
            return ERR_INVALID_TARGET;
        }
        if (this.creep.room.name === destFlag.room.name) {
            return this.doOrMoveTo(this.creep.claimController, this.creep.room.controller);
        }

        return this.creep.moveTo(destFlag.pos);
    }
}