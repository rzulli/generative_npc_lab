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

class Map {
    private map: Phaser.Tilemaps.Tilemap;
    private scene: Phaser.Scene;
    private tileset: Record<string, Phaser.Tilemaps.Tileset>;
    private layers: Record<string, Phaser.Tilemaps.TilemapLayer>;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }
    buildMap(withData: string | null) {
        if (withData == null) {
            //empty map
            this.map = this.scene.make.tilemap();
        } else {
            this.map = this.scene.make.tilemap({ key: withData });
        }
        return this;
    }

    withTilesetFromCache(tilesetName: string, cacheKey: string) {
        const tilesetResult = this.map.addTilesetImage(tilesetName, cacheKey);
        if (tilesetResult == null) {
            console.error(
                "Tileset not found in cache: ",
                tilesetName,
                cacheKey
            );
            return this;
        }
        this.tileset[tilesetName] = tilesetResult;
        return this;
    }

    withExternalTileset(tilesetName: string, url: string) {
        this.scene.load.image(tilesetName, url);
        return this.withTilesetFromCache(tilesetName, tilesetName);
    }

    withLayer(
        layerName: string,
        tilesetName: string | string[],
        offset: { x: number; y: number } | null
    ) {
        if (layerName in this.layers) {
            console.error("Duplicate layer name: ", layerName);
            return this;
        }
        let layerOffset = offset;
        if (offset == null) {
            layerOffset = { x: 0, y: 0 };
        }
        const layer = this.map.createLayer(
            layerName,
            tilesetName,
            layerOffset.x,
            layerOffset.y
        );
        if (layer == null) {
            console.error("Layer not created: ", layerName);
            return this;
        }
        this.layers[layerName] = layer;
        return this;
    }
}
class EditableMap {
    constructor() {}
}
function createMap(scene: Phaser.Scene) {
    //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
    //  For example, you can define global animations here, so we can use them in other scenes.
    let map = scene.make.tilemap({ key: "map" });
    // Joon: Logging map is really helpful for debugging here:
    console.log(map);

    // The first parameter is the name you gave to the tileset in Tiled and then
    // the key of the tileset image in Phaser's cache (i.e. the name you used in
    // preload)
    // Joon: for the first parameter here, really take a look at the
    //       console.log(map) output. You need to make sure that the name
    //       matches.
    const collisions = map.addTilesetImage("blocks", "blocks_1");
    const walls = map.addTilesetImage("Room_Builder_32x32", "walls");
    const interiors_pt1 = map.addTilesetImage("interiors_pt1", "interiors_pt1");
    const interiors_pt2 = map.addTilesetImage("interiors_pt2", "interiors_pt2");
    const interiors_pt3 = map.addTilesetImage("interiors_pt3", "interiors_pt3");
    const interiors_pt4 = map.addTilesetImage("interiors_pt4", "interiors_pt4");
    const interiors_pt5 = map.addTilesetImage("interiors_pt5", "interiors_pt5");
    const CuteRPG_Field_B = map.addTilesetImage(
        "CuteRPG_Field_B",
        "CuteRPG_Field_B"
    );
    const CuteRPG_Field_C = map.addTilesetImage(
        "CuteRPG_Field_C",
        "CuteRPG_Field_C"
    );
    const CuteRPG_Harbor_C = map.addTilesetImage(
        "CuteRPG_Harbor_C",
        "CuteRPG_Harbor_C"
    );
    const CuteRPG_Village_B = map.addTilesetImage(
        "CuteRPG_Village_B",
        "CuteRPG_Village_B"
    );
    const CuteRPG_Forest_B = map.addTilesetImage(
        "CuteRPG_Forest_B",
        "CuteRPG_Forest_B"
    );
    const CuteRPG_Desert_C = map.addTilesetImage(
        "CuteRPG_Desert_C",
        "CuteRPG_Desert_C"
    );
    const CuteRPG_Mountains_B = map.addTilesetImage(
        "CuteRPG_Mountains_B",
        "CuteRPG_Mountains_B"
    );
    const CuteRPG_Desert_B = map.addTilesetImage(
        "CuteRPG_Desert_B",
        "CuteRPG_Desert_B"
    );
    const CuteRPG_Forest_C = map.addTilesetImage(
        "CuteRPG_Forest_C",
        "CuteRPG_Forest_C"
    );

    // The first parameter is the layer name (or index) taken from Tiled, the
    // second parameter is the tileset you set above, and the final two
    // parameters are the x, y coordinate.
    // Joon: The "layer name" that comes as the first parameter value
    //       literally is taken from our Tiled layer name. So to find out what
    //       they are; you actually need to open up tiled and see how you
    //       named things there.
    let tileset_group = [
        CuteRPG_Field_B,
        CuteRPG_Field_C,
        CuteRPG_Harbor_C,
        CuteRPG_Village_B,
        CuteRPG_Forest_B,
        CuteRPG_Desert_C,
        CuteRPG_Mountains_B,
        CuteRPG_Desert_B,
        CuteRPG_Forest_C,
        interiors_pt1,
        interiors_pt2,
        interiors_pt3,
        interiors_pt4,
        interiors_pt5,
        walls,
    ];

    return [map, tileset_group, collisions];
}

function loadMapData(map, tileset_group, collisions) {
    const bottomGroundLayer = map.createLayer(
        "Bottom Ground",
        tileset_group,
        0,
        0
    );
    const exteriorGroundLayer = map.createLayer(
        "Exterior Ground",
        tileset_group,
        0,
        0
    );
    const exteriorDecorationL1Layer = map.createLayer(
        "Exterior Decoration L1",
        tileset_group,
        0,
        0
    );
    const exteriorDecorationL2Layer = map.createLayer(
        "Exterior Decoration L2",
        tileset_group,
        0,
        0
    );
    const interiorGroundLayer = map.createLayer(
        "Interior Ground",
        tileset_group,
        0,
        0
    );
    const wallLayer = map.createLayer("Wall", tileset_group, 0, 0);
    const interiorFurnitureL1Layer = map.createLayer(
        "Interior Furniture L1",
        tileset_group,
        0,
        0
    );
    const interiorFurnitureL2Layer = map.createLayer(
        "Interior Furniture L2 ",
        tileset_group,
        0,
        0
    );
    const foregroundL1Layer = map.createLayer(
        "Foreground L1",
        tileset_group,
        0,
        0
    );
    const foregroundL2Layer = map.createLayer(
        "Foreground L2",
        tileset_group,
        0,
        0
    );
    const focusedLayers = [
        bottomGroundLayer,
        exteriorGroundLayer,
        exteriorDecorationL1Layer,
        exteriorDecorationL2Layer,
        interiorGroundLayer,
        wallLayer,
        interiorFurnitureL1Layer,
        interiorFurnitureL2Layer,
        foregroundL1Layer,
        foregroundL2Layer,
    ];
    const sectorLayer = map.createLayer("Sector Blocks", "", 0, 0);
    map.createLayer("Arena Blocks", "", 0, 0);
    map.createLayer("World Blocks", "", 0, 0);

    foregroundL1Layer.setDepth(2);
    foregroundL2Layer.setDepth(2);

    const collisionsLayer = map.createLayer("Collisions", collisions, 0, 0);
    // const groundLayer = map.createLayer("Ground", walls, 0, 0);
    // const indoorGroundLayer = map.createLayer("Indoor Ground", walls, 0, 0);
    // const wallsLayer = map.createLayer("Walls", walls, 0, 0);
    // const interiorsLayer = map.createLayer("Furnitures", interiors, 0, 0);
    // const builtInLayer = map.createLayer("Built-ins", interiors, 0, 0);
    // const appliancesLayer = map.createLayer("Appliances", interiors, 0, 0);
    // const foregroundLayer = map.createLayer("Foreground", interiors, 0, 0);

    // Joon : This is where you want to create a custom field for the tileset
    //        in Tiled. Take a look at this guy's tutorial:
    //        https://www.youtube.com/watch?v=MR2CvWxOEsw&ab_channel=MattWilber
    collisionsLayer.setCollisionByProperty({ collide: true });
    // By default, everything gets depth sorted on the screen in the order we
    // created things. Here, we want the "Above Player" layer to sit on top of
    // the player, so we explicitly give it a depth. Higher depths will sit on
    // top of lower depth objects.
    // Collisions layer should get a negative depth since we do not want to see
    // it.
    collisionsLayer.setDepth(-1);
    // foregroundL1Layer.setDepth(2);
    // foregroundL1Layer.setDepth(2);

    return map;
}

function loadMapDataSuccess(context: InitialStateContext) {
    const [mapState, tileset_group, collisions] = createMap(context.scene);
    const map = loadMapData(mapState, tileset_group, collisions);
    Tilemap.map[context.eid] = map;
    Tilemap.tileset_group[context.eid] = tileset_group;
    Tilemap.collisions[context.eid] = collisions;
}

function newMap(context: InitialStateContext) {
    const [mapState, tileset_group, collisions] = createMap(context.scene);
    console.log(mapState, tileset_group);
    Tilemap.map[context.eid] = mapState;
    Tilemap.tileset_group[context.eid] = tileset_group;
    Tilemap.collisions[context.eid] = collisions;
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
    onEvent(event: string): State<IdleMapContext, TilemapEvent> | null {
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
        let mapState = null;
        let tileset_group = [];

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
