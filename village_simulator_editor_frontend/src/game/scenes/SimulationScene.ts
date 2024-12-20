import { Scene, Tilemaps } from "phaser";
import { tile_width } from "../consts";

export class SimulationScene extends Scene {
    marker;
    map: Phaser.Tilemaps.Tilemap;
    wallLayer: Phaser.Tilemaps.TilemapLayer;
    sectorLayer: Phaser.Tilemaps.TilemapLayer;

    focusedLayers = [];
    currentLayerFocused: Phaser.Tilemaps.TilemapLayer | string;
    isUsingFocusTools: boolean = false;
    indexToColor = {};

    constructor() {
        super("SimulationScene");
    }

    preload() {}

    createMap() {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.
        this.map = this.make.tilemap({ key: "map" });
        // Joon: Logging map is really helpful for debugging here:
        console.log(this.map);

        // The first parameter is the name you gave to the tileset in Tiled and then
        // the key of the tileset image in Phaser's cache (i.e. the name you used in
        // preload)
        // Joon: for the first parameter here, really take a look at the
        //       console.log(map) output. You need to make sure that the name
        //       matches.
        const collisions = this.map.addTilesetImage("blocks", "blocks_1");
        const walls = this.map.addTilesetImage("Room_Builder_32x32", "walls");
        const interiors_pt1 = this.map.addTilesetImage(
            "interiors_pt1",
            "interiors_pt1"
        );
        const interiors_pt2 = this.map.addTilesetImage(
            "interiors_pt2",
            "interiors_pt2"
        );
        const interiors_pt3 = this.map.addTilesetImage(
            "interiors_pt3",
            "interiors_pt3"
        );
        const interiors_pt4 = this.map.addTilesetImage(
            "interiors_pt4",
            "interiors_pt4"
        );
        const interiors_pt5 = this.map.addTilesetImage(
            "interiors_pt5",
            "interiors_pt5"
        );
        const CuteRPG_Field_B = this.map.addTilesetImage(
            "CuteRPG_Field_B",
            "CuteRPG_Field_B"
        );
        const CuteRPG_Field_C = this.map.addTilesetImage(
            "CuteRPG_Field_C",
            "CuteRPG_Field_C"
        );
        const CuteRPG_Harbor_C = this.map.addTilesetImage(
            "CuteRPG_Harbor_C",
            "CuteRPG_Harbor_C"
        );
        const CuteRPG_Village_B = this.map.addTilesetImage(
            "CuteRPG_Village_B",
            "CuteRPG_Village_B"
        );
        const CuteRPG_Forest_B = this.map.addTilesetImage(
            "CuteRPG_Forest_B",
            "CuteRPG_Forest_B"
        );
        const CuteRPG_Desert_C = this.map.addTilesetImage(
            "CuteRPG_Desert_C",
            "CuteRPG_Desert_C"
        );
        const CuteRPG_Mountains_B = this.map.addTilesetImage(
            "CuteRPG_Mountains_B",
            "CuteRPG_Mountains_B"
        );
        const CuteRPG_Desert_B = this.map.addTilesetImage(
            "CuteRPG_Desert_B",
            "CuteRPG_Desert_B"
        );
        const CuteRPG_Forest_C = this.map.addTilesetImage(
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
        let tileset_group_1 = [
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
        const bottomGroundLayer = this.map.createLayer(
            "Bottom Ground",
            tileset_group_1,
            0,
            0
        );
        const exteriorGroundLayer = this.map.createLayer(
            "Exterior Ground",
            tileset_group_1,
            0,
            0
        );
        const exteriorDecorationL1Layer = this.map.createLayer(
            "Exterior Decoration L1",
            tileset_group_1,
            0,
            0
        );
        const exteriorDecorationL2Layer = this.map.createLayer(
            "Exterior Decoration L2",
            tileset_group_1,
            0,
            0
        );
        const interiorGroundLayer = this.map.createLayer(
            "Interior Ground",
            tileset_group_1,
            0,
            0
        );
        this.wallLayer = this.map.createLayer(
            "Wall",
            [CuteRPG_Field_C, walls],
            0,
            0
        );
        const interiorFurnitureL1Layer = this.map.createLayer(
            "Interior Furniture L1",
            tileset_group_1,
            0,
            0
        );
        const interiorFurnitureL2Layer = this.map.createLayer(
            "Interior Furniture L2 ",
            tileset_group_1,
            0,
            0
        );
        const foregroundL1Layer = this.map.createLayer(
            "Foreground L1",
            tileset_group_1,
            0,
            0
        );
        const foregroundL2Layer = this.map.createLayer(
            "Foreground L2",
            tileset_group_1,
            0,
            0
        );
        this.focusedLayers = [
            bottomGroundLayer,
            exteriorGroundLayer,
            exteriorDecorationL1Layer,
            exteriorDecorationL2Layer,
            interiorGroundLayer,
            this.wallLayer,
            interiorFurnitureL1Layer,
            interiorFurnitureL2Layer,
            foregroundL1Layer,
            foregroundL2Layer,
        ];
        this.sectorLayer = this.map.createLayer("Sector Blocks", "", 0, 0);
        this.map.createLayer("Arena Blocks", "", 0, 0);
        this.map.createLayer("World Blocks", "", 0, 0);

        foregroundL1Layer.setDepth(2);
        foregroundL2Layer.setDepth(2);

        const collisionsLayer = this.map.createLayer(
            "Collisions",
            collisions,
            0,
            0
        );
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
        this.registry.set("map", this.map);
    }

    create() {
        this.input.keyboard.on("keydown-Q", this.useFocusedTool, this);
        this.input.on("wheel", this.changeLayer, this);
        this.createMap();
        this.marker = this.add.graphics();
        this.marker.lineStyle(2, 0x000000, 1);
        this.marker.strokeRect(
            0,
            0,
            1 * this.map.tileWidth,
            1 * this.map.tileHeight
        );

        let tiles = this.map.filterTiles(
            (tile) => {
                return tile.index != -1;
            },
            null,
            0,
            0,
            this.map.width,
            this.map.height,
            null,
            "Sector Blocks"
        );
        tiles?.map((tile) => {
            if (!(tile.index in this.indexToColor)) {
                this.indexToColor[tile.index] =
                    new Phaser.Display.Color().random(50);
            }
            console.log(tile);
            let a = this.add.graphics();
            a.lineStyle(2, this.indexToColor[tile.index].color, 0.3);
            a.strokeRect(
                tile.x * this.map.tileWidth,
                tile.y * this.map.tileHeight,
                1 * this.map.tileWidth,
                1 * this.map.tileHeight
            );
        });

        this.player = this.physics.add
            .sprite(800, 288, "atlas", "misa-front")
            .setSize(30, 40)
            .setOffset(0, 0);
        console.log(this.player);
        this.player.setDepth(-1);

        // Setting up the camera.
        console.log(this.registry.get("map"));
        const camera = this.cameras.main;
        camera.startFollow(this.player);
        camera.setBounds(
            0,
            0,
            this.registry.get("map").widthInPixels,
            this.registry.get("map").heightInPixels
        );

        this.cursors = this.input.keyboard.createCursorKeys();
        let spawn_tile_loc = this.registry.get("spawn_tile_loc");
        let personas = this.registry.get("personas");
        let pronunciatios = this.registry.get("pronunciatios");
        // *** SET UP PERSONAS ***
        // We start by creating the game sprite objects.
        for (let i = 0; i < Object.keys(spawn_tile_loc).length; i++) {
            let persona_name = Object.keys(spawn_tile_loc)[i];
            let start_pos = [
                spawn_tile_loc[persona_name][0] * tile_width + tile_width / 2,
                spawn_tile_loc[persona_name][1] * tile_width + tile_width,
            ];
            let new_sprite = this.physics.add
                .sprite(start_pos[0], start_pos[1], "atlas", "misa-front")
                .setSize(30, 40)
                .setOffset(0, 32); // DEBUG 1 --- I added 32 offset on Dec 29.
            // Here, we are creating the persona and its pronunciatio sprites.
            personas[persona_name] = new_sprite;
            pronunciatios[persona_name] = this.add
                .text(
                    new_sprite.body.x - 6,
                    new_sprite.body.y - 42 - 32, // DEBUG 1 --- I added 32 offset on Dec 29.
                    "🦁",
                    {
                        font: "28px monospace",
                        fill: "#000000",
                        padding: { x: 8, y: 8 },
                        backgroundColor: "#ffffff",
                        border: "solid",
                        borderRadius: "10px",
                    }
                )
                .setDepth(3);
        }
        this.registry.set("personas", personas);
        this.registry.set("pronunciatios", pronunciatios);
        // Create the player's walking animations from the texture atlas. These are
        // stored in the global animation manager so any sprite can access them.
        const anims = this.anims;
        anims.create({
            key: "misa-left-walk",
            frames: anims.generateFrameNames("atlas", {
                prefix: "misa-left-walk.",
                start: 0,
                end: 3,
                zeroPad: 3,
            }),
            frameRate: 4,
            repeat: -1,
        });

        anims.create({
            key: "misa-right-walk",
            frames: anims.generateFrameNames("atlas", {
                prefix: "misa-right-walk.",
                start: 0,
                end: 3,
                zeroPad: 3,
            }),
            frameRate: 4,
            repeat: -1,
        });

        anims.create({
            key: "misa-front-walk",
            frames: anims.generateFrameNames("atlas", {
                prefix: "misa-front-walk.",
                start: 0,
                end: 3,
                zeroPad: 3,
            }),
            frameRate: 4,
            repeat: -1,
        });

        anims.create({
            key: "misa-back-walk",
            frames: anims.generateFrameNames("atlas", {
                prefix: "misa-back-walk.",
                start: 0,
                end: 3,
                zeroPad: 3,
            }),
            frameRate: 4,
            repeat: -1,
        });

        console.log(tiles);
    }

    update(time, delta) {
        // *** MOVE CAMERA ***
        // This is where we finish up the camera setting we started in the create()
        // function. We set the movement speed of the camera and wire up the keys to
        // map to the actual movement.
        const camera_speed = 900;
        // Stop any previous movement from the last frame
        this.player.body.setVelocity(0);
        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-camera_speed);
        }
        if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(camera_speed);
        }
        if (this.cursors.up.isDown) {
            this.player.body.setVelocityY(-camera_speed);
        }
        if (this.cursors.down.isDown) {
            this.player.body.setVelocityY(camera_speed);
        }

        if (this.isUsingFocusTools) {
            this.updateView();
        } else {
            this.resetView();
        }
    }

    updateView() {
        console.log("aaa");
        for (let i = 0; i < this.focusedLayers.length; i++) {
            console.log(
                this.focusedLayers[i].name,
                this.focusedLayers[i]?.alpha
            );
            this.focusedLayers[i].alpha = 0.3;
        }
        this.focusedLayers[this.currentLayerFocused].alpha = 1;
        //this.map.getLayer(this.currentLayerFocused).alpha = 1;
        //this.map.setLayer(this.currentLayerFocused, )
    }
    resetView() {
        if (this.currentLayerFocused != -1) {
            for (let i = 0; i < this.focusedLayers.length; i++) {
                //console.log(this.map.layers[i].name, this.map.getLayer(i)?.alpha);
                this.focusedLayers[i].alpha = 1;
            }
            this.currentLayerFocused = -1;
        }
    }

    useFocusedTool() {
        if (this.isUsingFocusTools) {
            this.isUsingFocusTools = false;
        } else {
            this.isUsingFocusTools = true;
            this.currentLayerFocused = 0;
        }
        console.log(this.isUsingFocusTools, this.currentLayerFocused);
    }
    changeLayer(pointer, currentlyOver, dx, dy, dz, event) {
        if (this.isUsingFocusTools == false) {
            console.log("aaa");
            return;
        }
        if (dy < 0) {
            this.currentLayerFocused = Math.max(
                this.currentLayerFocused - 1,
                0
            );
        } else if (dy > 0) {
            this.currentLayerFocused = Math.min(
                this.currentLayerFocused + 1,
                this.focusedLayers.length - 1
            );
        }
        console.log(this.currentLayerFocused);
    }
}
