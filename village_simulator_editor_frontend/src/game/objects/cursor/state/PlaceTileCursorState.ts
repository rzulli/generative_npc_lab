import Position from "@/game/components/Position";
import Velocity from "@/game/components/Velocity";
import Sprite from "@/game/components/Sprite";

import Player from "@/game/components/Player";

import Input from "@/game/components/Input";
enum Textures {
    TankBlue,
    TankGreen,
    TankRed,
}

import { createWorld, addEntity, addComponent, IWorld } from "bitecs";
import Rotation from "@/game/components/Rotation";
import Tilemap from "../components/Tilemap";
import StateMachineComponent from "../components/StateMachine";
import { State, StateMachine } from "/src/lib/stateMachine/StateMachine";
import { tile_width } from "../consts";
import CursorComponent from "../components/Cursor";
import {
    Command,
    PlaceTileAreaCommand,
    PlaceTileCommand,
} from "@/game/command/Command";
import { CursorEvent, CursorMode } from "../Cursor";
import { IdleCursorContext, IdleCursorState } from "./IdleCursorState";

export class PlaceTileCursorState extends State<
    IdleCursorContext,
    CursorEvent
> {
    onEnter(event?: CursorEvent | undefined): void {
        this.context.cursor.setMode(CursorMode.place);
    }
    onEvent(event: {
        event: CursorEvent;
        data: any;
    }): State<IdleCursorContext, CursorEvent> | null {
        this.context.cursor.updateState(this.context.scene);
        switch (event.event) {
            case CursorEvent.CANCEL:
                return new IdleCursorState(this.context);
            case CursorEvent.SELECT_TILE:
                console.log("Handling SELECT_TILE - ", event.data.tile_id);
                this.context.cursor.currentTileSelected = event.data.tile_id;
                return null;
            case CursorEvent.ON_MOUSE_DOWN:
                console.log(this.context.cursor.currentTileSelected);
                if (this.context.cursor.currentTileSelected != null) {
                    this.context.cursor.setMode(CursorMode.place);
                    this.context.cursor.executeCommand(
                        PlaceTileCommand(
                            this.context.map_eid,
                            this.context.cursor.currentTileSelected,
                            this.context.cursor.pointerCoord,
                            "First Layer"
                        )
                    );
                } else {
                    this.context.cursor.setMode(CursorMode.place_no_tile);
                }
                return null;
            default:
                return null;
        }
    }
}
