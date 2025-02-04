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
import createPlayerSystem from "../../systems/PlayerSystem";
import createSpriteSystem from "../../systems/SpriteSystem";
import Rotation from "../../components/Rotation";
import { PlayerPrefab } from "../../prefabs/PlayerPrefab";
import createTilemapSystem from "../../systems/TileMapSystem";
import Tilemap from "../../components/Tilemap";
import { MapPrefab } from "../../prefabs/MapPrefab";
import createCursorSystem from "../../systems/CursorSystem";
import { CursorPrefab } from "../../prefabs/CursorPrefab";
import createInputSystem from "../../systems/InputSystem";
import { EventBus } from "../../EventBus";
import { title } from "process";
import { toast } from "@/hooks/use-toast";
import createAgentSystem from "@/game/systems/AgentSystem";
import { AgentPrefab } from "@/game/prefabs/AgentPrefab";
import Agent from "@/game/components/Agent";
export class EditorScene extends Scene {
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    private world!: IWorld;
    private playerSystem!: System;
    private spriteSystem!: System;
    private tilemapSystem!: System;
    private cursorSystem!: System;
    private inputSystem!: System;
    private agentSystem!: System;
    private map;
    private agents: { [key: string]: number };
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
        //this.logo = this.add.image(512, 300, "background2").setDepth(-100);
        this.world = createWorld();
        this.physics.world.setBounds(0, 0, 300, 300);

        let player = PlayerPrefab(this);
        const camera = this.cameras.main;
        this.cameras.main.setBounds(0, 0, 300, 300);
        camera.startFollow(Player.physics[player]);

        // const map = addEntity(this.world);
        const onLoadMapDataSuccess = (map, tries: number = 0) => {
            // console.log(map.data, this);
            if (tries > 5) {
                console.error("Max tries reached. Aborting");
                toast({
                    title: "Error",
                    content: "Loading failed. Please try again later",
                });
                EventBus.removeListener(
                    "ON_LOAD_MAP_DATA_SUCCESS",
                    onLoadMapDataSuccess
                );
                return;
            }
            if (this.sys.cache == null) {
                console.error("Cache is null. Rescheduling event");
                setTimeout(() => {
                    EventBus.emit("map_state", map, tries + 1);
                }, 1000);
                return;
            }
            this.sys.cache.tilemap.add("map", {
                format: 1, //1 - TILEDJSON
                data: map.data,
            });
            const w = map.data.width * map.data.tilewidth;
            const h = map.data.height * map.data.tileheight;
            this.physics.world.setBounds(0, 0, w, h);
            this.cameras.main.setBounds(0, 0, w, h);
            EventBus.emit("ON_ADD_TILEMAP");
        };
        this.agents = [];
        EventBus.addListener("spawn_agent", (eventData) => {
            try {
                // let parsedAgent = JSON.parse(data);
                console.log("spawn agent", eventData);
                Object.entries(eventData.data.state).map(([k, v]) => {
                    eventData.data.state[k] = JSON.parse(v);
                });
                this.agents[eventData.scope] = AgentPrefab(
                    this,
                    eventData.data.state
                );
                camera.startFollow(Agent.physics[this.agents[eventData.scope]]);
                console.log("parsed agent data", eventData, this.agents);
                console.log("ao");
            } catch (error) {
                console.error(
                    "Failed to parse agent data",
                    eventData,
                    typeof eventData,
                    error
                );
            }
        });

        EventBus.addListener("map_state", onLoadMapDataSuccess);
        EventBus.addListener("SELECT_LAYER", (layer_name) => {
            this.updateView(layer_name);
        });
        this.map = MapPrefab(this.world, this);
        const cursor = CursorPrefab(this.world, this.map, this);
        // create the player tank

        this.tilemapSystem = createTilemapSystem();

        this.playerSystem = createPlayerSystem(this.cursors);
        this.agentSystem = createAgentSystem(this);

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
        this.agentSystem(this.world);
    }
}
