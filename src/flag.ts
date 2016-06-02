import {CreepTypes} from "./creep-assembler";
enum FlagTypes {
    unknown = 1,
    source, // src-$roomName-$mineToRoomName-$workerCap-$index
    link,   //
    claim   // $parentRoomName-$index
}

interface SourceFlagMemory extends FlagMemory {
    parentRoom: string;
    roomName: string;
    workerCap: number;
};

interface ClaimFlagMemory extends FlagMemory {
    parentRoom: string;
}

export class MyFlag {
    //------ Private data ----------------------------------------------------------------------------------------------
    protected flagType:FlagTypes;

    //------ Public Data  ----------------------------------------------------------------------------------------------
    order:number;
    //------ Constructors ----------------------------------------------------------------------------------------------
    constructor(private flag:Flag) {
        if (!this.flag) {
            throw 'flag doesn\'t exist';
        }

        // flags have memory by default. check if it was filled by me
        if (!this.flag.memory || !this.flag.memory.flagType) {
            this.parseName();
            this.order = this.flag.memory.order;
        }
        this.flagType = this.flag.memory.flagType;
    }

    //------ Private methods -------------------------------------------------------------------------------------------
    /**
     * Source flag structure: src-$roomName-$mineToRoomName-$workerCap-$index
     */
    private parseName() {
        if (!this.flag.name) {
            this.flag.memory = {
                flagType: FlagTypes.unknown,
                order: Number.MAX_VALUE
            };
            return;
        }
        let flagNameTokens = this.flag.name.split('-');
        switch (this.flag.color) {
            case COLOR_BROWN:
                this.flagType = FlagTypes.source;
                let source = <Source>this.flag.pos.lookFor('source')[0];
                let sourceFlagMemory:SourceFlagMemory = {
                    flagType: FlagTypes.source,
                    order: parseInt(flagNameTokens[4]) || Number.MAX_VALUE,
                    parentRoom: flagNameTokens[2],
                    roomName: flagNameTokens[1],
                    //sourceID: <string>(_.isObject(source) ? source.id : undefined),
                    workerCap: parseInt(flagNameTokens[3]) || 0
                };
                this.flag.memory = sourceFlagMemory;
                break;
            case COLOR_YELLOW:
                let linkFlagMemory = {
                    flagType: FlagTypes.link,
                    order: parseInt(flagNameTokens[1]) || 0
                };
                this.flag.memory = linkFlagMemory;
                break;
            case COLOR_PURPLE:
                let claimFlagMemory:ClaimFlagMemory = {
                    flagType: FlagTypes.claim,
                    parentRoom: flagNameTokens[0] || null,
                    order: parseInt(flagNameTokens[1]) || Number.MAX_VALUE
                };
                this.flag.memory = claimFlagMemory;
                break;
            default:
                this.flag.memory = {
                    flagType: FlagTypes.unknown,
                    order: Number.MAX_VALUE
                };
        }
    }

    //------ Public methods --------------------------------------------------------------------------------------------
    public getFlag():Flag {
        return this.flag;
    }

    public isSourceFlag() {
        return this.flagType == FlagTypes.source;
    }

    public isLinkFlag() {
        return this.flagType == FlagTypes.link;
    }

    public isClaimFlag() {
        return this.flagType == FlagTypes.claim;
    }

    public getParentRoomName():string {
        return (<SourceFlagMemory>this.flag.memory).parentRoom || '';
    }

    public needMoreWorkers():boolean {
        if (!this.isSourceFlag()) {
            return false;
        }
        let roomMemory = Memory.rooms[(<SourceFlagMemory>this.flag.memory).parentRoom];

        if (!roomMemory || !roomMemory.active) {
            return false;
        }
        let flagMiners = _.filter<CreepMemory>(roomMemory.active, (creepMemory:CreepMemory) => {
            if (!(creepMemory.role === CreepTypes.flagMiner)) {
                return false;
            }
            return (<FlagMinerMemory>creepMemory).flagName === this.flag.name;
        });
        return flagMiners.length < (<SourceFlagMemory>this.flag.memory).workerCap;
    }
}
