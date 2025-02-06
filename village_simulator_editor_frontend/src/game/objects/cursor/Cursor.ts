import { Scene } from "phaser";
import { Command } from "../../command/Command";
import Tilemap from "../../components/Tilemap";
import { tile_width } from "../../consts";
import { store } from "@/store";
import { IdleCursorContext, IdleCursorState } from "./state/IdleCursorState";

export enum CursorEvent {
    NONE,
    CANCEL,
    PLACE_TILE,
    SELECT_AREA,
    ON_MOUSE_DOWN,
    SELECT_TILE,
}

export enum CursorMode {
    single,
    place,
    place_no_tile,
    area,
}

interface CursorStyle {
    lineWidth: number;
    color: number;
    alpha: number;
}
const styleMode: Record<CursorMode, CursorStyle> = {
    [CursorMode.single]: { lineWidth: 1, color: 0xff0000, alpha: 1 },

    [CursorMode.area]: { lineWidth: 1, color: 0xff00ff, alpha: 1 },
    [CursorMode.place]: { lineWidth: 1, color: 0x0000ff, alpha: 1 },
    [CursorMode.place_no_tile]: { lineWidth: 1, color: 0x333333, alpha: 0.5 },
};
export class Cursor {
    private static instance: Cursor;
    context: IdleCursorContext;
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
    worldPoint = { x: 0, y: 0 };
    static map_metadata: any = {};
    static reverse_lookup: any = {};
    private unsubscribe;
    private label: Phaser.GameObjects.Text;
    private constructor(context: IdleCursorContext) {
        this.unsubscribe = store.subscribe(() => {
            const state = store.getState();
            Cursor.map_metadata = { ...state.simulationInstance.map_metadata };
            Cursor.reverse_lookup = {
                ...state.simulationInstance.reverse_lookup,
            };
            console.debug(
                "STORE UPDATE",
                Cursor.map_metadata,
                Cursor.reverse_lookup
            );
        });
        this.context = context;

        this.marker = context.scene.add.graphics();
        this.label = context.scene.add.text(100, 100, "debug text", {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: 20,
            color: "#fff",
        });
        this.label.setDepth(99);

        this.marker.lineStyle(2, 0x000000, 1);
        this.marker.strokeRect(0, 0, 1 * tile_width, 1 * tile_width);
    }

    public static getInstance(context: InitialStateContext): Cursor {
        if (!Cursor.instance) {
            Cursor.instance = new Cursor(context);
        }
        return Cursor.instance;
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
    updatePointerPosition = (scene: Scene) => {
        this.worldPoint = scene.input.activePointer.positionToCamera(
            scene.cameras.main
        );
        this.updateCursorPosition();
    };
    updateCursorPosition() {
        const tilemapComponent = Tilemap.map[this.context.map_eid];
        if (
            !tilemapComponent ||
            !tilemapComponent.map ||
            tilemapComponent.map.layers.length == 0
        )
            return;

        const map = tilemapComponent.map;
        // Rounds down to nearest tile
        this.pointerCoord.x = map.worldToTileX(this.worldPoint.x);
        this.pointerCoord.y = map.worldToTileY(this.worldPoint.y);

        // Snap to tile coordinates, but in world space
        this.pointerTile.x = map.tileToWorldX(this.pointerCoord.x);
        this.pointerTile.y = map.tileToWorldY(this.pointerCoord.y);
        this.label.x = this.pointerTile.x;
        this.label.y = this.pointerTile.y;
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

    updateState(scene: Scene) {
        this.marker.clear();
        this.marker.setDepth(2);

        this.updatePointerPosition(scene);
        if (!this.isVisible) {
            return;
        }
        if (
            Cursor.map_metadata &&
            Cursor.map_metadata[`${this.pointerCoord.x}:${this.pointerCoord.y}`]
        ) {
            this.label.text =
                `${this.pointerCoord.x}:${this.pointerCoord.y}\n` +
                Object.entries(
                    Cursor.map_metadata[
                        `${this.pointerCoord.x}:${this.pointerCoord.y}`
                    ]
                )
                    .map(([key, value]) => `${key}: ${String(value)}`)
                    .join("\n");
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
    destroy() {
        this.marker.destroy();
        this.unsubscribe();
    }
}
