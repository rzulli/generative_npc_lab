import { Scene } from "phaser";
import {
    createWorld,
    addEntity,
    addComponent,
    defineQuery,
    defineSystem,
} from "bitecs";

import type { IWorld, System } from "bitecs";
import { defineComponent, Types } from "bitecs";

const Player = defineComponent();
export const Input = defineComponent({
    direction: Types.ui8,
    speed: Types.ui8,
});

export enum Direction {
    None,
    Left,
    Right,
    Up,
    Down,
}

const Position = defineComponent({
    x: Types.f32,
    y: Types.f32,
});

export default function createPlayerSystem(
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
) {
    const playerQuery = defineQuery([Position]);

    return defineSystem((world) => {
        const entities = playerQuery(world);

        for (let i = 0; i < entities.length; ++i) {
            const id = entities[i];
            console.log(Position.y[id]);
        }
        return world;
    });
}

export class TestScene extends Scene {
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

    private world!: IWorld;
    private playerSystem!: System;

    constructor() {
        super("TestScene");
    }

    init() {
        this.cursors = this.input.keyboard.createCursorKeys();
    }
    preload() {}

    create() {
        const { width, height } = this.scale;

        this.world = createWorld();

        const blueTank = addEntity(this.world);

        addComponent(this.world, Position, blueTank);
        Position.x[blueTank] = 100;
        Position.y[blueTank] = 100;

        this.playerSystem = createPlayerSystem(this.cursors);
    }

    update(time: number, delta: number): void {
        this.playerSystem(this.world);
    }
}

