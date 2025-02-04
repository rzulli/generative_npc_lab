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
import { TilemapEvent } from "../systems/TileMapSystem";
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
    private tileset: Record<string, MapTileset> = {};
    private layers: Record<string, Phaser.Tilemaps.TilemapLayer> = {};
    private tileLayers: [string] | [] = [];
    private dataLayers: [string] | [] = [];
    private tools: [EditorTool] | [];

    private currentGid: number = 0;
    private static instance: Map;

    constructor(scene: Phaser.Scene) {
        if (Map.instance?.map) {
            console.log("Destroying map", Map.instance.map);
            Map.instance.currentGid = 0;
            Object.entries(Map.instance.tileset).forEach(([key, value]) => {
                console.log("Destroying tileset", key);
                Map.instance.scene.textures.remove(key);
            });

            Map.instance.map.removeAllLayers();
            Map.instance.map.destroy();
            console.log("Destroyed map", Map.instance.map);
            EventBus.emit("ON_MAPSTATE_UPDATE", this);
        }

        if (Map.instance) {
            Map.instance.scene = scene;
            Map.instance.tileset = {};
            Map.instance.layers = {};
            Map.instance.tools = [];
            Map.instance.currentGid = 0;
            return Map.instance; // Retorna a instância existente
        }
        this.scene = scene;
        this.tileset = {};
        this.layers = {};
        this.tools = [];
        this.currentGid = 0;
        Map.instance = this;
    }

    buildMap(withData: string | null) {
        // console.log(withData, Map.instance.map);

        if (withData == null) {
            //empty map
            Map.instance.map = this.scene.make.tilemap();
        } else {
            Map.instance.map = this.scene.make.tilemap({ key: withData });
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

            loader.once("complete", () => {
                const tilesetResult = this.map.addTilesetImage(
                    tilesetName,
                    tilesetName
                );

                // console.log(tilesetName, url, Map.instance.tileset);
                if (tilesetResult == null) {
                    console.error("Tileset not found in cache: ", tilesetName);
                    reject(
                        new Error("Tileset not found in cache: " + tilesetName)
                    );
                    return;
                }
                const tileset = Map.instance.map.tilesets.filter(
                    (obj) => obj.name == tilesetName
                );
                if (tileset.length > 0) {
                    // console.log(tileset);
                    tilesetResult.firstgid = tileset[0].firstgid;
                } else {
                    tilesetResult.firstgid = this.currentGid;
                    Map.instance.currentGid += tilesetResult.total;
                }
                Map.instance.tileset[tilesetName] = {
                    ...tilesetResult,
                    url: url,
                };
                // console.log(tilesetResult.firstgid, this.tileset[tilesetName]);
                // this.map.layers.map((obj, i) =>
                //     obj.tilemapLayer.tileset.push(tilesetResult)
                // );
                EventBus.emit("ON_MAPSTATE_UPDATE", this);
                resolve(this);
            });
            loader.start();
        });
    }

    withDataLayer(layerName: string, offset: { x: number; y: number }) {
        if (layerName in Map.instance.layers) {
            console.error("Duplicate layer name: ", layerName);
            return this;
        }
        const layer = Map.instance.map.createLayer(
            layerName,
            null,
            offset.x,
            offset.y
        );
        if (layer == null) {
            console.error("Layer not created: ", layerName);
            return this;
        }
        Map.instance.layers[layerName] = layer;
        Map.instance.dataLayers.push(layerName);
        return this;
    }
    withTileLayer(
        layerName: string,
        tiledImportLayer: string | null6 = null,
        offset: { x: number; y: number } | null = null,
        depth: number | null = null
    ) {
        if (layerName in Map.instance.layers) {
            console.error(
                "Duplicate layer name: ",
                layerName,
                Map.instance.layers
            );
            return this;
        }
        let layerOffset = offset;
        if (offset == null) {
            layerOffset = { x: 0, y: 0 };
        }
        let layer;
        // console.log(
        //     "ajsdiajaisdjasidjiasida aquiui",
        //     Object.keys(this.tileset),
        //     tiledImportLayer
        // );
        if (tiledImportLayer != null) {
            // Create Phaser.Tilemaps.TileLayer
            layer = Map.instance.map.createLayer(
                tiledImportLayer,
                Object.keys(this.tileset),
                layerOffset.x,
                layerOffset.y
            );
        } else {
            layer = Map.instance.map.createBlankLayer(
                layerName,
                Object.keys(this.tileset),
                layerOffset.x,
                layerOffset.y
            );
        }

        // console.log(layer);
        if (layer == null) {
            console.error("Layer not created: ", layerName);
            return this;
        }

        Map.instance.tileLayers.push(layerName);

        if (depth != null && depth != 0) {
            layer.setDepth(depth);
        }

        Map.instance.layers[layerName] = layer;
        // console.log(this.map);
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
        // console.log("ASDASDIOAOSDIOA", layer, alpha);
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
function createMap(scene: Phaser.Scene, key: string | null, addLayer = true) {
    const newMap = new Map(scene).buildMap(key);
    return newMap
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
            {
                name: "interiors_pt4",
                url: "assets/simulation/the_ville/visuals/map_assets/v1/interiors_pt4.png",
            },
            {
                name: "interiors_pt5",
                url: "assets/simulation/the_ville/visuals/map_assets/v1/interiors_pt5.png",
            },
            {
                name: "CuteRPG_Field_B",
                url: "assets/simulation/the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Field_B.png",
            },
            {
                name: "CuteRPG_Field_C",
                url: "assets/simulation/the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Field_C.png",
            },
            {
                name: "CuteRPG_Harbor_C",
                url: "assets/simulation/the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Harbor_C.png",
            },
            {
                name: "CuteRPG_Village_B",
                url: "assets/simulation/the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Village_B.png",
            },
            {
                name: "CuteRPG_Forest_B",
                url: "assets/simulation/the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Forest_B.png",
            },
            {
                name: "CuteRPG_Desert_C",
                url: "assets/simulation/the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Desert_C.png",
            },
            {
                name: "CuteRPG_Mountains_B",
                url: "assets/simulation/the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Mountains_B.png",
            },
            {
                name: "CuteRPG_Desert_B",
                url: "assets/simulation/the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Desert_B.png",
            },
            {
                name: "CuteRPG_Forest_C",
                url: "assets/simulation/the_ville/visuals/map_assets/cute_rpg_word_VXAce/tilesets/CuteRPG_Forest_C.png",
            },
        ])
        .then(() => {
            if (addLayer) newMap.withTileLayer("First Layer");

            return newMap;
        });
}

function loadMapData(map: Map) {
    map.withTileLayer("Bottom Ground", "Bottom Ground", { x: 0, y: 0 }, 0)
        .withDataLayer("Sector Blocks", { x: 0, y: 0 })
        .withDataLayer("Arena Blocks", { x: 0, y: 0 })
        .withDataLayer("World Blocks", { x: 0, y: 0 })
        .withTileLayer("Exterior Ground", "Exterior Ground", { x: 0, y: 0 }, 0)
        .withTileLayer(
            "Exterior Decoration L1",
            "Exterior Decoration L1",
            { x: 0, y: 0 },
            0
        )
        .withTileLayer(
            "Exterior Decoration L2",
            "Exterior Decoration L2",
            { x: 0, y: 0 },
            0
        )
        .withTileLayer("Interior Ground", "Interior Ground", { x: 0, y: 0 }, 0)
        .withTileLayer("Wall", "Wall", { x: 0, y: 0 }, 0)
        .withTileLayer(
            "Interior Furniture L1",
            "Interior Furniture L1",
            { x: 0, y: 0 },
            0
        )
        .withTileLayer(
            "Interior Furniture L2",
            "Interior Furniture L2",
            { x: 0, y: 0 },
            0
        )
        .withTileLayer("Foreground L1", "Foreground L1", { x: 0, y: 0 }, 2)
        .withTileLayer("Foreground L2", "Foreground L2", { x: 0, y: 0 }, 2)
        .withDataLayer("Collisions", { x: 0, y: 0 })
        .withCollisionLayer("Collisions", { collide: true })
        .withTool(IsolateLayerTool);

    return map;
}

async function loadMapDataSuccess(context: InitialStateContext) {
    let map_instance = await createMap(context.scene, "map", false);
    map_instance = loadMapData(map_instance);
    Tilemap.map[context.eid] = map_instance;
    // console.log("ashjidauishdjias");
    EventBus.emit("ON_MAPSTATE_UPDATE", map_instance);
    context.map = map_instance;
}

async function newMap(context: InitialStateContext) {
    // console.log("uhasduhausdh");
    const map_instance = await createMap(context.scene, null);
    Tilemap.map[context.eid] = map_instance;
    EventBus.emit("ON_MAPSTATE_UPDATE", map_instance);
    context.map = map_instance;
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
    onEvent({ event, data }): State<IdleMapContext, TilemapEvent> | null {
        switch (event) {
            case TilemapEvent.NEW_MAP:
                //newMap(this.context);
                return null;
            case TilemapEvent.LOAD_MAP_DATA_SUCCESS:
                // console.log("ajisdiajsdia");
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
    onEvent({ event, data }): State<InitialStateContext, TilemapEvent> | null {
        // console.log("aaaaaaaaaa", event);
        switch (event) {
            case TilemapEvent.NEW_MAP:
                //newMap(this.context);
                return new IdleMapState({
                    ...this.context,
                    map: Tilemap.map[this.context.eid],
                });
            case TilemapEvent.LOAD_MAP_DATA_SUCCESS:
                // console.log("ajisdiajsdia");
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
