import { Cursor, CursorEvent } from "../Cursor";
import { IdleCursorContext } from "../../../prefabs/CursorPrefab";
import { State } from "@/lib/stateMachine/StateMachine";
import { IdleCursorState } from "./IdleCursorState";

export interface InitialStateContext {
    eid: number;
    scene: Phaser.Scene;
    map_eid: number;
}
export class InitialState extends State<InitialStateContext, CursorEvent> {
    onEvent(event: CursorEvent): State<IdleCursorContext, CursorEvent> | null {
        return new IdleCursorState({
            ...this.context,
            cursor: Cursor.getInstance(this.context),
        });
    }
}
