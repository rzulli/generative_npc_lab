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

export const PlayerPrefab = (world: IWorld) => {
    const prefab = addEntity(world);

    addComponent(world, Position, prefab);
    addComponent(world, Velocity, prefab);
    addComponent(world, Rotation, prefab);
    addComponent(world, Sprite, prefab);
    addComponent(world, Player, prefab);
    addComponent(world, Input, prefab);

    Position.x[prefab] = 100;
    Position.y[prefab] = 100;
    Sprite.texture[prefab] = Textures.TankBlue;
    Input.speed[prefab] = 10;
    return prefab;
};
