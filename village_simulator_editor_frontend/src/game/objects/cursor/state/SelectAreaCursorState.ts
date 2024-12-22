import { IWorld, addEntity, addComponent } from "bitecs";
import { PlaceTileAreaCommand } from "../../../command/Command";
import CursorComponent from "../../../components/Cursor";
import StateMachineComponent from "../../../components/StateMachine";
import { IdleCursorContext } from "../../../prefabs/CursorPrefab";
import { CursorEvent, CursorMode } from "../Cursor";

import { IdleCursorState } from "./IdleCursorState";
import { InitialState } from "./InitialState";
import { State, StateMachine } from "/src/lib/stateMachine/StateMachine";

export class SelectAreaCursorState extends State<
    IdleCursorContext,
    CursorEvent
> {
    onEnter(event?: CursorEvent | undefined): void {
        this.context.cursor.setMode(CursorMode.area);
    }
    onEvent(event: {
        event: CursorEvent;
        data: any;
    }): State<IdleCursorContext, CursorEvent> | null {
        this.context.cursor.updateState(this.context.scene);

        switch (event) {
            case CursorEvent.CANCEL:
                this.context.cursor.resetAnchor();
                return new IdleCursorState(this.context);
            case CursorEvent.SELECT_TILE:
                console.log("Handling SELECT_TILE - ", event.data.tile_id);
                this.context.cursor.currentTileSelected = event.data.tile_id;
                return null;
            case CursorEvent.ON_MOUSE_DOWN:
                this.context.cursor.updateState();
                if (!this.context.cursor.hasAnchor()) {
                    this.context.cursor.setAnchor(
                        this.context.cursor.pointerTile
                    );
                } else {
                    console.log("here");
                    this.context.cursor.executeCommand(
                        PlaceTileAreaCommand(
                            this.context.map_eid,
                            8805,
                            this.context.cursor.pointerCoord,
                            this.context.cursor.areaTile,
                            "Wall"
                        )
                    );
                }
                return null;

            default:
                return null;
        }
    }
}
