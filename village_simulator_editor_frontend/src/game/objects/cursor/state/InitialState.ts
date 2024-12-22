import { Cursor } from "../Cursor";
import { IdleCursorContext } from "../../../prefabs/CursorPrefab";
import { State } from "@/lib/stateMachine/StateMachine";
import { IdleCursorState } from "./IdleCursorState";

export interface InitialStateContext {
    eid: number;
    scene: Phaser.Scene;
    map_eid: number;
}
export class InitialState extends State<InitialStateContext, string> {
    onEvent(event: string): State<IdleCursorContext, string> | null {
        console.log(this.context);
        return new IdleCursorState({
            ...this.context,
            cursor: new Cursor(this.context),
        });
    }
}
