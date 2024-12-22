import { Scene } from "phaser";
import { createWorld, addEntity, addComponent } from "bitecs";
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
import type { IWorld, System } from "bitecs";
import createPlayerSystem from "../../systems/Player";
import createSpriteSystem from "../../systems/Sprite";
import Rotation from "../../components/Rotation";
import { PlayerPrefab } from "../../prefabs/Player";
import createTilemapSystem from "../../systems/TileMap";
import Tilemap from "../../components/Tilemap";
import { MapPrefab } from "../../prefabs/Map";
import createCursorSystem from "../../systems/Cursor";
import { CursorPrefab } from "../../prefabs/Cursor";
import createInputSystem from "../../systems/Input";
import { EventBus } from "../../EventBus";
import { title } from "process";
import { toast } from "@/hooks/use-toast";
export class EditorScene extends Scene {
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    private world!: IWorld;
    private playerSystem!: System;
    private spriteSystem!: System;
    private tilemapSystem!: System;
    private cursorSystem!: System;
    private inputSystem!: System;
    private map;
    constructor() {
        super("EditorScene");
    }
    init() {
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    preload() {
        this.load.image("tank-blue", "assets/tank_blue.png");
        this.load.image("background2", "assets/simulation/background.jpg");
    }

    create() {
        const { width, height } = this.scale;
        this.logo = this.add.image(512, 300, "background2").setDepth(-100);
        this.world = createWorld();
        this.physics.world.setBounds(0, 0, 2000, 2000);

        let player = PlayerPrefab(this);
        const camera = this.cameras.main;
        this.cameras.main.setBounds(0, 0, 2000, 2000);
        camera.startFollow(Player.physics[player]);

        // const map = addEntity(this.world);
        EventBus.addListener(
            "ON_LOAD_MAP_DATA_SUCCESS",
            (map, tries: number = 0) => {
                console.log(map, this);
                if (tries > 5) {
                    console.error("Max tries reached. Aborting");
                    toast({
                        title: "Error",
                        messsage: "Loading failed. Please try again later",
                    });
                    return;
                }
                if (this.sys.cache == null) {
                    console.error("Cache is null. Rescheduling event");
                    setTimeout(() => {
                        EventBus.emit(
                            "ON_LOAD_MAP_DATA_SUCCESS",
                            map,
                            tries + 1
                        );
                    }, 1000);
                    return;
                }
                this.sys.cache.tilemap.add("map", {
                    format: 1, //1 - TILEDJSON
                    data: map,
                });
                EventBus.emit("ON_ADD_TILEMAP");
            }
        );
        EventBus.addListener("SELECT_LAYER", (layer_name) => {
            this.updateView(layer_name);
        });
        this.map = MapPrefab(this.world, this);
        const cursor = CursorPrefab(this.world, this.map, this);
        // create the player tank

        this.tilemapSystem = createTilemapSystem();

        this.playerSystem = createPlayerSystem(this.cursors);

        this.spriteSystem = createSpriteSystem(this, [
            "tank-blue",
            "tank-green",
            "tank-red",
        ]);

        this.cursorSystem = createCursorSystem();
        this.inputSystem = createInputSystem([
            {
                keys: [
                    this.input.keyboard.addKey(
                        Phaser.Input.Keyboard.KeyCodes.Q
                    ),
                ],
                action: (event) => EventBus.emit("ON_TOGGLE_PLACE_CURSOR"),
            },
            {
                keys: [
                    this.input.keyboard.addKey(
                        Phaser.Input.Keyboard.KeyCodes.W
                    ),
                ],
                action: (event) => EventBus.emit("ON_TOGGLE_SELECT_AREA"),
            },
            {
                keys: [
                    this.input.keyboard.addKey(
                        Phaser.Input.Keyboard.KeyCodes.ESC
                    ),
                ],
                action: (event) => EventBus.emit("ON_CANCEL_TOOL"),
            },
        ]);
    }
    updateView(layer_name) {
        console.log(this.map, Tilemap.map[this.map]);
        if (Tilemap.map[this.map] == undefined) {
            return;
        }
        for (let i = 0; i < Tilemap.map[this.map].layers.length; i++) {
            console.log(
                Tilemap.map[this.map].layers[i].name,
                Tilemap.map[this.map].layers[i]?.alpha
            );
            Tilemap.map[this.map].layers[i].alpha = 0;
        }
        const index = Tilemap.map[this.map].layers.findIndex(
            (layer) => layer.name == layer_name
        );
        console.log(index);
        Tilemap.map[this.map].layers[index].alpha = 1;
        this.sys.cache.tilemap.entries.set("map", Tilemap.map[this.map]);
        console.log(this.sys.cache.tilemap);
        //this.map.getLayer(this.currentLayerFocused).alpha = 1;
        //this.map.setLayer(this.currentLayerFocused, )
    }
    update(time: number, delta: number): void {
        this.tilemapSystem(this.world);
        this.playerSystem(this.world);
        this.spriteSystem(this.world);
        this.cursorSystem(this.world, this);
        this.inputSystem(this.world);
    }
}
