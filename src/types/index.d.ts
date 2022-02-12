declare namespace uhbot {
    interface AddHop {
        oldSkill: number,
        newSkill: number,
         hopsRemaining: number
    }

    interface RollItems {
        size: number,
        number: number,
        rerolls: number,
        explode: number,
        diceModifiers: string
    }

    interface RollReturns {
        total: number,
        value?: number,
        modifiers?: string,
        rerollsSafeHit?: boolean,
        explodeSafeHit?: boolean,
        rolls: Array<number>,
        modifieds: Array<number>,
        explodes: Array<number>
    }

    interface PEMObject {
        total: number,
        value: number,
        modifiers?: string
    }

    interface RollsWrittenContent {
        total: number,
        value?: number,
        modifiers?: string,
        rolls?: Array<RollsWrittenContent>
    }
}

declare module 'uhbot' {
    export = uhbot
}
