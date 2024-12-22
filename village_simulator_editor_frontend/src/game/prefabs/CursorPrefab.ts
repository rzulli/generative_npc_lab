enum Textures {
    TankBlue,
    TankGreen,
    TankRed,
}

import { addComponent, addEntity, IWorld } from "bitecs";
import CursorComponent from "../components/Cursor";
import StateMachineComponent from "../components/StateMachine";
import { Cursor } from "../objects/cursor/Cursor";
import { InitialState } from "@/game/objects/cursor/state/InitialState";
import { StateMachine } from "@/lib/stateMachine/StateMachine";

export interface IdleCursorContext {
    eid: number;
    scene: Phaser.Scene;
    map_eid: number;
    cursor: Cursor;
}

export const CursorPrefab = (
    world: IWorld,
    map_eid: number,
    scene: Phaser.Scene
) => {
    const prefab = addEntity(world);

    addComponent(world, StateMachineComponent, prefab);
    addComponent(world, CursorComponent, prefab);

    let mach = new StateMachine(
        new InitialState({ eid: prefab, scene: scene, map_eid: map_eid })
    );
    console.log(mach);
    StateMachineComponent.current[prefab] = mach;

    return prefab;
};
