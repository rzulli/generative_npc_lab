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
import Cursor from "../components/Cursor";
import { TilemapEvent } from "../systems/TileMap";
import { EventBus } from "../EventBus";

import {} from "ph";
class EditorTool {
    protected map: Map;
    constructor(map: Map) {
        this.map = map;
    }
}
class IsolateLayerTool extends EditorTool {
    private currentLayerFocused: number;

    constructor(map: Map) {
        super(map);

        this.currentLayerFocused = -1;
        EventBus.addListener("RESET_VIEW", () => {
            this.resetView();
        });
        EventBus.addListener("FOCUS_LAYER", (index) => {
            this.focusLayer(index);
        });
        EventBus.addListener("SHOW_LAYER", (index) => {
            this.showLayer(index);
        });
        EventBus.addListener("HIDE_LAYER", (index) => {
            this.hideLayer(index);
        });
    }

    resetView() {
        if (this.currentLayerFocused != -1) {
            Object.entries(this.map.layers).forEach(([key, value]) => {
                this.map.setLayerAlpha(key, 1.0);
            });
            this.currentLayerFocused = -1;
        }
    }

    focusLayer(layerIndex: number) {
        console.log(this);
        this.resetView();
        this.currentLayerFocused = layerIndex;
        Object.entries(this.map.layers).forEach(([key, value], index) => {
            if (index == layerIndex) {
                return;
            }
            this.map.setLayerAlpha(key, 0.1);
        });

        console.log(this.map.map.layers);
    }

    hideLayer(layerIndex: number | string) {
        console.log(this.map.map, layerIndex);
        Map.instance.hideLayer(layerIndex);

        EventBus.emit("ON_MAPSTATE_UPDATE");
    }
    showLayer(layerIndex: number | string) {
        Map.instance.showLayer(layerIndex);

        EventBus.emit("ON_MAPSTATE_UPDATE");
    }
}
interface MapTileset extends Phaser.Tilemaps.Tileset {
    url: string;
}

export class Map {
    map: Phaser.Tilemaps.Tilemap;
    private scene: Phaser.Scene;
    private tileset: Record<string, MapTileset>;
    private layers: Record<string, Phaser.Tilemaps.TilemapLayer>;
    private tileLayers: [string] | [] = [];
    private dataLayers: [string] | [] = [];
    private tools: [EditorTool] | [];

    private currentGid: number = 0;
    private static instance: Map;

    constructor(scene: Phaser.Scene) {
        if (Map.instance) {
            return Map.instance; // Retorna a instância existente
        }
        Map.instance = this;
        this.scene = scene;
        this.tileset = {};
        this.layers = {};
        this.tools = [];
    }

    buildMap(withData: string | null) {
        console.log(withData, this.map);
        if (withData == null) {
            //empty map
            this.map = this.scene.make.tilemap();
        } else {
            this.map = this.scene.make.tilemap({ key: withData });
        }
        return this;
    }
    async withTilesets(
        tilesets: { name: string; url: string }[]
    ): Promise<this> {
        const promises = tilesets.map((tileset) =>
            this.withTileset(tileset.name, tileset.url)
        );
        await Promise.all(promises);
        return this;
    }
    async withTileset(tilesetName: string, url: string): Promise<this> {
        return new Promise((resolve, reject) => {
            let loader = this.scene.load.image(tilesetName, url);
            console.log(tilesetName, url);
            this.tileset[tilesetName] = {};
            loader.once("complete", () => {
                const tilesetResult = this.map.addTilesetImage(
                    tilesetName,
                    tilesetName
                );
                if (tilesetResult == null) {
                    console.error("Tileset not found in cache: ", tilesetName);
                    reject(
                        new Error("Tileset not found in cache: " + tilesetName)
                    );
                    return;
                }
                tilesetResult.firstgid = this.currentGid;
                this.currentGid += tilesetResult.total;
                this.tileset[tilesetName] = { ...tilesetResult, url: url };
                console.log(tilesetResult.firstgid, this.tileset[tilesetName]);
                // this.map.layers.map((obj, i) =>
                //     this.map.layers[i].tilemapLayer.tileset.push(tilesetResult)
                // );
                EventBus.emit("ON_MAPSTATE_UPDATE", this);
                resolve(this);
            });
            loader.start();
        });
    }

    withDataLayer(layerName: string, offset: { x: number; y: number }) {
        if (layerName in this.layers) {
            console.error("Duplicate layer name: ", layerName);
            return this;
        }
        const layer = this.map.createLayer(layerName, null, offset.x, offset.y);
        if (layer == null) {
            console.error("Layer not created: ", layerName);
            return this;
        }
        this.layers[layerName] = layer;
        this.dataLayers.push(layerName);
        return this;
    }
    withTileLayer(
        layerName: string,
        tiledImportLayer: string | null6 = null,
        offset: { x: number; y: number } | null = null,
        depth: number | null = null
    ) {
        if (layerName in this.layers) {
            console.error("Duplicate layer name: ", layerName);
            return this;
        }
        let layerOffset = offset;
        if (offset == null) {
            layerOffset = { x: 0, y: 0 };
        }
        let layer;
        console.log(
            "ajsdiajaisdjasidjiasida aquiui",
            Object.keys(this.tileset)
        );
        if (tiledImportLayer != null) {
            // Create Phaser.Tilemaps.TileLayer
            layer = this.map.createLayer(
                tiledImportLayer,
                Object.keys(this.tileset),
                layerOffset.x,
                layerOffset.y
            );
        } else {
            layer = this.map.createBlankLayer(
                layerName,
                Object.keys(this.tileset),
                layerOffset.x,
                layerOffset.y
            );
        }
        this.tileLayers.push(layerName);
        console.log(layer);
        if (layer == null) {
            console.error("Layer not created: ", layerName);
            return this;
        }

        if (depth != null && depth != 0) {
            layer.setDepth(depth);
        }

        this.layers[layerName] = layer;
        console.log(this.map);
        return this;
    }

    withCollisionLayer(layerName: string, properties: any) {
        if (!(layerName in this.layers)) {
            console.error(
                "Adding collision to layer name: ",
                layerName,
                " layer not found"
            );
            return this;
        }
        this.layers[layerName].setCollisionByProperty(properties);
        return this;
    }

    withTool(tool: typeof EditorTool) {
        this.tools.push(new tool(this));
        return this;
    }

    setLayerAlpha(layer: number | string, alpha: number) {
        console.log("ASDASDIOAOSDIOA", layer, alpha);
        if (typeof layer == "string") {
            this.layers[layer].alpha = alpha;
        } else if (
            typeof layer == "number" &&
            this.map.getLayer(layer) != null
        ) {
            this.map.getLayer(layer).alpha = alpha;
        }
    }

    showLayer(layer: number | string) {
        if (typeof layer == "string") {
            this.layers[layer].visible = true;
        } else if (
            typeof layer == "number" &&
            this.map.getLayer(layer) != null
        ) {
            this.map.getLayer(layer).visible = true;
        }
    }

    hideLayer(layer: number | string) {
        console.log("ASDASDIOAOSDIOA", layer);
        if (typeof layer == "string") {
            this.layers[layer].visible = false;
        } else if (
            typeof layer == "number" &&
            this.map.getLayer(layer) != null
        ) {
            this.map.getLayer(layer).visible = false;
        }
    }
}
class EditableMap {
    constructor() {}
}
function createMap(scene: Phaser.Scene, key) {
    const newMap = new Map(scene).buildMap(key);
    newMap
        .withTilesets([
            {
                name: "blocks_1",
                url: "assets/simulation/the_ville/visuals/map_assets/blocks/blocks_1.png",
            },
            {
                name: "walls",
                url: "assets/simulation/the_ville/visuals/map_assets/v1/Room_Builder_32x32.png",
            },
            {
                name: "interiors_pt1",
                url: "assets/simulation/the_ville/visuals/map_assets/v1/interiors_pt1.png",
            },
            {
                name: "interiors_pt2",
                url: "assets/simulation/the_ville/visuals/map_assets/v1/interiors_pt2.png",
            },
            {
                name: "interiors_pt3",
                url: "assets/simulation/the_ville/visuals/map_assets/v1/interiors_pt3.png",
            },
        ])
        .then(() => {
            newMap.withTileLayer("First Layer");
        });

    return newMap;
}

function loadMapData(map: Map) {
    map.withTileLayer("Bottom Ground", { x: 0, y: 0 }, 0)
        .withDataLayer("Sector Blocks", { x: 0, y: 0 }, 0)
        .withDataLayer("Arena Blocks", { x: 0, y: 0 }, 0)
        .withDataLayer("World Blocks", { x: 0, y: 0 }, 0)
        .withTileLayer("Exterior Ground", { x: 0, y: 0 }, 0)
        .withTileLayer("Exterior Decoration L1", { x: 0, y: 0 }, 0)
        .withTileLayer("Exterior Decoration L2", { x: 0, y: 0 }, 0)
        .withTileLayer("Interior Ground", { x: 0, y: 0 }, 0)
        .withTileLayer("Wall", { x: 0, y: 0 }, 0)
        .withTileLayer("Interior Furniture L1", { x: 0, y: 0 }, 0)
        .withTileLayer("Interior Furniture L2 ", { x: 0, y: 0 }, 0)
        .withTileLayer("Foreground L1", { x: 0, y: 0 }, 2)
        .withTileLayer("Foreground L2", { x: 0, y: 0 }, 2)
        .withDataLayer("Collisions", { x: 0, y: 0 })
        .withCollisionLayer("Collisions", { collide: true })
        .withTool(IsolateLayerTool);

    return map;
}

function loadMapDataSuccess(context: InitialStateContext) {
    let map_instance = createMap(context.scene, "map");
    map_instance = loadMapData(map_instance);
    Tilemap.map[context.eid] = map_instance;

    EventBus.emit("ON_MAPSTATE_UPDATE", map_instance);
}

function newMap(context: InitialStateContext) {
    let map_instance = createMap(context.scene);
    Tilemap.map[context.eid] = map_instance;
    EventBus.emit("ON_MAPSTATE_UPDATE", map_instance);
}

function resetView() {
    if (this.currentLayerFocused != -1) {
        for (let i = 0; i < this.focusedLayers.length; i++) {
            //console.log(this.map.layers[i].name, this.map.getLayer(i)?.alpha);
            this.focusedLayers[i].alpha = 1;
        }
        this.currentLayerFocused = -1;
    }
}
interface IdleMapContext {
    eid: number;
    scene: Phaser.Scene;
    map: Phaser.Tilemaps.Tilemap;
}

class IdleMapState extends State<IdleMapContext, TilemapEvent> {
    onEvent(event: TilemapEvent): State<IdleMapContext, TilemapEvent> | null {
        switch (event) {
            case TilemapEvent.NEW_MAP:
                newMap(this.context);
                return null;
            case TilemapEvent.LOAD_MAP_DATA_SUCCESS:
                loadMapDataSuccess(this.context);
                return null;
            default:
                return null;
        }
    }
}

interface InitialStateContext {
    eid: number;
    scene: Phaser.Scene;
}
class InitialState extends State<InitialStateContext, TilemapEvent> {
    onEvent(
        event: TilemapEvent
    ): State<InitialStateContext, TilemapEvent> | null {
        switch (event) {
            case TilemapEvent.NEW_MAP:
                newMap(this.context);
                return new IdleMapState({
                    ...this.context,
                    map: Tilemap.map[this.context.eid],
                });
            case TilemapEvent.LOAD_MAP_DATA_SUCCESS:
                loadMapDataSuccess(this.context);
                return new IdleMapState({
                    ...this.context,
                    map: Tilemap.map[this.context.eid],
                });
            default:
                return null;
        }

        return null; // Fica no estado atual
    }
}

export const MapPrefab = (world: IWorld, scene: Phaser.Scene) => {
    const prefab = addEntity(world);

    addComponent(world, Tilemap, prefab);
    addComponent(world, StateMachineComponent, prefab);

    let mach = new StateMachine(
        new InitialState({ eid: prefab, scene: scene })
    );
    console.log(mach);
    StateMachineComponent.current[prefab] = mach;

    return prefab;
};
