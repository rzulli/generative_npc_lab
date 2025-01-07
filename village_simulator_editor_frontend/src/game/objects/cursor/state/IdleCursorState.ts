import Tilemap from "../../../components/Tilemap";
import { updatePointerPosition } from "../../../prefabs/CursorPrefab";
import { Cursor, CursorEvent, CursorMode } from "../Cursor";
import { PlaceTileCursorState } from "./PlaceTileCursorState";
import { SelectAreaCursorState } from "./SelectAreaCursorState";
import { State } from "@/lib/stateMachine/StateMachine";

export interface IdleCursorContext {
    eid: number;
    scene: Phaser.Scene;
    map_eid: number;
    cursor: Cursor;
}

export class IdleCursorState extends State<IdleCursorContext, CursorEvent> {
    onEnter(event?: CursorEvent | undefined): void {
        this.context.cursor.setMode(CursorMode.single);
    }
    onEvent(event: {
        event: CursorEvent;
        data: any;
    }): State<IdleCursorContext, CursorEvent> | null {
        this.context.cursor.updateState(this.context.scene);
        switch (event.event) {
            case CursorEvent.PLACE_TILE:
                return new PlaceTileCursorState(this.context);
            case CursorEvent.SELECT_TILE:
                console.log("Handling SELECT_TILE - ", event.data.tile_id);
                this.context.cursor.currentTileSelected = event.data.tile_id;
                return null;
            case CursorEvent.SELECT_AREA:
                return new SelectAreaCursorState(this.context);
            default:
                return null;
        }
    }
}
