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
} from "../command/Command";

enum CursorMode {
    single,
    place,
    area,
}

interface CursorStyle {
    lineWidth: number;
    color: number;
    alpha: number;
}

const styleMode: Record<CursorMode, CursorStyle> = {
    [CursorMode.single]: { lineWidth: 1, color: 0x00ff00, alpha: 1 },
    [CursorMode.area]: { lineWidth: 1, color: 0xff00ff, alpha: 1 },
    [CursorMode.place]: { lineWidth: 1, color: 0x0000ff, alpha: 1 },
};
class Cursor {
    context: InitialStateContext;
    marker: Phaser.GameObjects.Graphics;
    pointerCoord: { x: number; y: number } = { x: 0, y: 0 };
    pointerTile: { x: number; y: number } = { x: 0, y: 0 };
    area: { x: number; y: number } = { x: 1, y: 1 };
    areaTile: { x: number; y: number } = { x: 1, y: 1 };
    private anchor: { x: number; y: number };

    private mode: CursorMode;
    private commandStack: [Command] = [];
    currentTileSelected: number | null = null;
    private isVisible: boolean = false;
    constructor(context: InitialStateContext) {
        this.context = context;
        this.marker = context.scene.add.graphics();
        this.marker.lineStyle(2, 0x000000, 1);
        this.marker.strokeRect(0, 0, 1 * tile_width, 1 * tile_width);
    }

    setMode(mode: CursorMode) {
        this.mode = mode;
        this.updateStyle();
    }

    updateStyle() {
        const style = styleMode[this.mode];
        // console.log(styleMode, "", style);
        this.marker.clear();
        this.marker.lineStyle(style.lineWidth, style.color, style.alpha);
    }

    updatePointerPosition(worldPoint: Phaser.Math.Vector2 | object) {
        if (
            Tilemap.map[this.context.map_eid].map == null ||
            Tilemap.map[this.context.map_eid].map.layers.length == 0
        )
            return;

        const map = Tilemap.map[this.context.map_eid].map;
        // Rounds down to nearest tile
        this.pointerCoord.x = map.worldToTileX(worldPoint.x);
        this.pointerCoord.y = map.worldToTileY(worldPoint.y);

        // Snap to tile coordinates, but in world space
        this.pointerTile.x = map.tileToWorldX(this.pointerCoord.x);
        this.pointerTile.y = map.tileToWorldY(this.pointerCoord.y);

        if (
            this.pointerCoord.x > map.width ||
            this.pointerCoord.y > map.height ||
            this.pointerCoord.x < 0 ||
            this.pointerCoord.y < 0
        ) {
            this.isVisible = false;
        } else {
            this.isVisible = true;
        }
    }

    hasAnchor() {
        return this.anchor != null && this.anchor.x != null;
    }
    setAnchor(anchor: { x: number; y: number }) {
        this.anchor = { x: anchor.x, y: anchor.y };
    }
    resetAnchor() {
        this.anchor = { x: null, y: null };
    }

    executeCommand(command: Command) {
        // console.log(command);
        this.commandStack.push(command);
        command.execute();
    }
    undoLastCommand() {
        const command = this.commandStack.shift();
        command?.undo();
    }

    updateState() {
        this.marker.clear();
        if (!this.isVisible) {
            return;
        }
        this.area = { x: 1, y: 1 };
        switch (this.mode) {
            case CursorMode.single:
            case CursorMode.place:
                this.marker.strokeRect(
                    this.pointerTile.x,
                    this.pointerTile.y,
                    tile_width,
                    tile_width
                );
                return;
            case CursorMode.area:
                if (this.hasAnchor()) {
                    this.area = {
                        x: Math.abs(
                            Math.ceil(
                                this.anchor.x - this.pointerTile.x - tile_width
                            )
                        ),

                        y: Math.abs(
                            Math.ceil(
                                this.anchor.y - this.pointerTile.y - tile_width
                            )
                        ),
                    };
                    this.areaTile = {
                        x: Tilemap.map[this.context.map_eid].map.worldToTileX(
                            this.area.x
                        ),
                        y: Tilemap.map[this.context.map_eid].map.worldToTileY(
                            this.area.y
                        ),
                    };
                    this.marker.strokeRect(
                        this.anchor.x,
                        this.anchor.y,
                        this.area.x,
                        this.area.y
                    );
                } else {
                    this.marker.strokeRect(
                        this.pointerTile.x,
                        this.pointerTile.y,
                        tile_width,
                        tile_width
                    );
                }
        }
    }
}

export enum CursorEvent {
    NONE,
    CANCEL,
    PLACE_TILE,
    SELECT_AREA,
    ON_MOUSE_DOWN,
    SELECT_TILE,
}
interface IdleCursorContext {
    eid: number;
    scene: Phaser.Scene;
    map_eid: number;
    cursor: Cursor;
}

const updatePointerPosition = (context: IdleCursorContext) => {
    const worldPoint = context.scene.input.activePointer.positionToCamera(
        context.scene.cameras.main
    );
    context.cursor.updatePointerPosition(worldPoint);
};

class SelectAreaCursorState extends State<IdleCursorContext, CursorEvent> {
    onEnter(event?: CursorEvent | undefined): void {
        this.context.cursor.setMode(CursorMode.area);
    }
    onEvent(event: {
        event: CursorEvent;
        data: any;
    }): State<IdleCursorContext, CursorEvent> | null {
        updatePointerPosition(this.context);

        switch (event) {
            case CursorEvent.CANCEL:
                this.context.cursor.resetAnchor();
                return new IdleCursorState(this.context);
            case CursorEvent.SELECT_TILE:
                console.log("ihujaisudhaishdaishdia");
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
                this.context.cursor.updateState();
                return null;
        }
    }
}

class PlaceTileCursorState extends State<IdleCursorContext, CursorEvent> {
    onEnter(event?: CursorEvent | undefined): void {
        this.context.cursor.setMode(CursorMode.place);
    }
    onEvent(event: {
        event: CursorEvent;
        data: any;
    }): State<IdleCursorContext, CursorEvent> | null {
        updatePointerPosition(this.context);

        switch (event.event) {
            case CursorEvent.CANCEL:
                return new IdleCursorState(this.context);
            case CursorEvent.SELECT_TILE:
                console.log("ihujaisudhaishdaishdia");
                this.context.cursor.currentTileSelected = event.data.tile_id;
                return null;
            case CursorEvent.ON_MOUSE_DOWN:
                console.log(this.context.cursor.currentTileSelected);
                if (this.context.cursor.currentTileSelected != null) {
                    this.context.cursor.executeCommand(
                        PlaceTileCommand(
                            this.context.map_eid,
                            this.context.cursor.currentTileSelected,
                            this.context.cursor.pointerCoord,
                            "First Layer"
                        )
                    );
                }
                return null;
            default:
                this.context.cursor.updateState();
                return null;
        }
    }
}
class IdleCursorState extends State<IdleCursorContext, CursorEvent> {
    onEnter(event?: CursorEvent | undefined): void {
        this.context.cursor.setMode(CursorMode.single);
    }
    onEvent(event: {
        event: CursorEvent;
        data: any;
    }): State<IdleCursorContext, CursorEvent> | null {
        updatePointerPosition(this.context);

        this.context.cursor.updateState();
        switch (event.event) {
            case CursorEvent.PLACE_TILE:
                return new PlaceTileCursorState(this.context);
            case CursorEvent.SELECT_TILE:
                console.log(
                    "ihujaisudhaishdaishdia",
                    this.context.cursor.currentTileSelected
                );
                this.context.cursor.currentTileSelected = event.data.tile_id;
                return null;
            case CursorEvent.SELECT_AREA:
                return new SelectAreaCursorState(this.context);
            default:
                return null;
        }
        const map = Tilemap.map[this.context.map_eid];

        const pointerTileX = this.context.pointer.x;
        const pointerTileY = this.context.pointer.y;

        return null;
    }
}

interface InitialStateContext {
    eid: number;
    scene: Phaser.Scene;
    map_eid: number;
}
class InitialState extends State<InitialStateContext, string> {
    onEvent(event: string): State<IdleCursorContext, string> | null {
        return new IdleCursorState({
            ...this.context,
            cursor: new Cursor(this.context),
        });
    }
}

export const CursorPrefab = (
    world: IWorld,
    map_eid: number,
    scene: Phaser.Scene
) => {
    const prefab = addEntity(world);

    addComponent(world, StateMachineComponent, prefab);
    addComponent(world, CursorComponent, prefab);

    let mach = new StateMachine(
        new InitialState({ eid: prefab, scene: scene, map_eid: map_eid })
    );
    console.log(mach);
    StateMachineComponent.current[prefab] = mach;

    return prefab;
};
