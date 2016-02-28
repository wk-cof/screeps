import {CreepTypes} from "creep-assembler";
enum FlagTypes {
    unknown = 1,
    source,
    link
}

export class MyFlag {
    //------ Private data ----------------------------------------------------------------------------------------------
    protected flagType:FlagTypes;

    //------ Constructors ----------------------------------------------------------------------------------------------
    constructor(private flag:Flag) {
        if (!this.flag) {
            throw 'flag doesn\'t exist';
        }

        // flags have memory by default. check if it was filled by me
        if (!this.flag.memory || !this.flag.memory.flagType) {
            this.parseName();
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
                flagType: FlagTypes.unknown
            };
            return;
        }
        let flagNameTokens = this.flag.name.split('-');
        if (flagNameTokens[0] === 'src') {
            this.flagType = FlagTypes.source;
            let source = <Source>this.flag.pos.lookFor('source')[0];
            let sourceFlagMemory:SourceFlagMemory = {
                flagType: FlagTypes.source,
                roomName: flagNameTokens[1] || null,
                parentRoom: flagNameTokens[2] || null,
                workerCap: parseInt(flagNameTokens[3]) || 0,
                sourceID: _.isObject(source) ? source.id : null
            };
            this.flag.memory = sourceFlagMemory;
        }
        else if (flagNameTokens[0] === 'lnk') {

            let linkFlagMemory: LinkFlagMemory = {
                flagType: FlagTypes.link,
                linkOrder: parseInt(flagNameTokens[1]) || 0
            };
            this.flag.memory = linkFlagMemory;
        }
        else {
            this.flag.memory = {
                flagType: FlagTypes.unknown
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
            if (!(creepMemory.role === CreepTypes.flagMiner) ) {
                return false;
            }
            return (<FlagMinerMemory>creepMemory).flagName === this.flag.name;
        });
        return flagMiners.length < (<SourceFlagMemory>this.flag.memory).workerCap;
    }
}
