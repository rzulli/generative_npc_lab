import Phaser from "phaser";
import { defineSystem, defineQuery } from "bitecs";

import Velocity from "../components/Velocity";
import Player from "../components/Player";
import Input, { Direction } from "../components/Input";
import Rotation from "../components/Rotation";
import Position from "../components/Position";

export default function createPlayerSystem(
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
) {
    const playerQuery = defineQuery([
        Player,
        Position,
        Velocity,
        Rotation,
        Input,
    ]);

    return defineSystem((world) => {
        const entities = playerQuery(world);

        for (let i = 0; i < entities.length; ++i) {
            const id = entities[i];
            if (cursors.left.isDown) {
                Input.direction[id] = Direction.Left;
            } else if (cursors.right.isDown) {
                Input.direction[id] = Direction.Right;
            } else if (cursors.up.isDown) {
                Input.direction[id] = Direction.Up;
            } else if (cursors.down.isDown) {
                Input.direction[id] = Direction.Down;
            } else {
                Input.direction[id] = Direction.None;
            }
            Player.physics[id].body.setVelocity(0);
            if (Input.direction[id] == Direction.Left) {
                Player.physics[id].body.setVelocityX(-400);
            } else if (Input.direction[id] == Direction.Right) {
                Player.physics[id].body.setVelocityX(400);
            }

            if (Input.direction[id] == Direction.Up) {
                Player.physics[id].body.setVelocityY(-400);
            } else if (Input.direction[id] == Direction.Down) {
                Player.physics[id].body.setVelocityY(400);
            }
        }

        return world;
    });
}
