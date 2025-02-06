import Position from "@/game/components/Position";
import Sprite from "@/game/components/Sprite";
import Velocity from "@/game/components/Velocity";

import Player from "@/game/components/Player";

import Input from "@/game/components/Input";
enum Textures {
    TankBlue,
    TankGreen,
    TankRed,
}

import Rotation from "@/game/components/Rotation";
import { addComponent, addEntity } from "bitecs";
import Agent from "@/game/components/Agent";
import StateMachineComponent from "../components/StateMachine";
import { StateMachine } from "@/lib/stateMachine/StateMachine";
import {
    InitialState,
    InitialStateContext,
} from "@/game/objects/agent/state/InitialState";
import { AgentEvent } from "../objects/agent/Agent";
import { tile_width } from "../consts";

export const AgentPrefab = (scene: Phaser.Scene, state) => {
    const prefab = addEntity(scene.world);

    addComponent(scene.world, Position, prefab);
    addComponent(scene.world, Sprite, prefab);
    addComponent(scene.world, Agent, prefab);
    addComponent(scene.world, StateMachineComponent, prefab);
    Position.x[prefab] = state.entity.position.x * tile_width;
    Position.y[prefab] = state.entity.position.y * tile_width;
    console.log(Position.x[prefab], Position.y[prefab]);
    Agent.physics[prefab] = scene.physics.add
        .sprite(Position.x[prefab], Position.y[prefab], "character", "down")
        .setSize(30, 46)
        .setOffset(0, 0)
        .setDepth(1);

    Sprite.texture[prefab] = Textures.TankBlue;
    const mach = new StateMachine<InitialStateContext, AgentEvent>(
        new InitialState({
            eid: prefab,
            scene: scene,
            agent_name: "",
            state: state,
        })
    );
    StateMachineComponent.current[prefab] = mach;
    return prefab;
};
