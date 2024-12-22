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

export const PlayerPrefab = (scene: Phaser.Scene) => {
    const prefab = addEntity(scene.world);

    addComponent(scene.world, Position, prefab);
    addComponent(scene.world, Velocity, prefab);
    addComponent(scene.world, Rotation, prefab);
    addComponent(scene.world, Sprite, prefab);
    addComponent(scene.world, Player, prefab);
    addComponent(scene.world, Input, prefab);

    Player.physics[prefab] = scene.physics.add
        .sprite(800, 288, "atlas", "misa-front")
        .setSize(30, 40)
        .setOffset(0, 0);
    Position.x[prefab] = 100;
    Position.y[prefab] = 100;
    Sprite.texture[prefab] = Textures.TankBlue;
    Input.speed[prefab] = 10;
    return prefab;
};
