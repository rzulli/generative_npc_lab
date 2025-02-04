import Phaser, { Events, Scene } from "phaser";
import { defineSystem, defineQuery, IWorld } from "bitecs";

import Velocity from "../components/Velocity";
import Player from "../components/Player";
import Input, { Direction } from "../components/Input";
import Rotation from "../components/Rotation";
import Tilemap from "../components/Tilemap";
import Cursor from "../components/Cursor";
import { EventBus } from "../EventBus";
import { CursorEvent } from "../objects/cursor/Cursor";
import { AbstractEventHandler } from "../../lib/stateMachine/AbstractEventHandler";
import { createStateMachineSystem } from "./StateMachineSystem";
import { AgentEvent } from "../objects/agent/Agent";
import Agent from "../components/Agent";
import Position from "../components/Position";

class AgentEventHandler extends AbstractEventHandler<AgentEvent> {
    constructor() {
        super();
    }

    handle(): { event: AgentEvent; data: any } {
        const event = this.currentEvent;
        this.currentEvent = { event: AgentEvent.NONE, data: null };
        return event;
    }
}

export default function createAgentSystem(scene) {
    const agentQuery = defineQuery([Agent]);
    const eventHandler = new AgentEventHandler();
    const stateMachineSystem = createStateMachineSystem<AgentEvent>();

    EventBus.on("agent_update", (eventData) => {
        console.log("agent_update1", eventData);

        try {
            // let parsedAgent = JSON.parse(data);
            Object.entries(eventData.data.state).map(([k, v]) => {
                eventData.data.state[k] = JSON.parse(v);
            });
            // console.log("agent_update2", eventData);
            const prefab = scene.agents[eventData.scope];
            // console.log(prefab);
            Agent.physics[prefab].x =
                Number(eventData.data.state.entity.position.x) * 32;
            Agent.physics[prefab].y =
                Number(eventData.data.state.entity.position.y) * 32;

            console.log(
                "parsed agent data",
                Position.x[prefab],
                Agent.physics[prefab],
                eventData,
                scene.agents
            );
            console.log("ao");
        } catch (e) {
            console.warn("parsing failed", eventData, e);
        }

        eventHandler.emit(AgentEvent.UPDATE_AGENT, eventData);
    });
    return defineSystem((world: IWorld, scene: Phaser.Scene) => {
        const agents = agentQuery(world);
        stateMachineSystem(world, agents, eventHandler, AgentEvent.NONE);

        return world;
    });
}
