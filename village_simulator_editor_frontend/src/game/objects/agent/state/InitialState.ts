import { Cursor, CursorEvent } from "../Cursor";
import { IdleCursorContext } from "../../../prefabs/CursorPrefab";
import { State } from "@/lib/stateMachine/StateMachine";

import { Agent, AgentEvent } from "@/game/objects/agent/Agent";

export interface IdleStateContext {
    eid: number;
    scene: Phaser.Scene;
    agent_name: string;
    agent: Agent;
}
export interface InitialStateContext {
    eid: number;
    scene: Phaser.Scene;
    agent_name: string;
    state: any;
}
export class IdleAgentState extends State<IdleStateContext, AgentEvent> {
    onEvent(event: AgentEvent): State<IdleCursorContext, AgentEvent> | null {
        return null;
    }
}

export class InitialState extends State<InitialStateContext, AgentEvent> {
    onEvent(event: AgentEvent): State<IdleStateContext, AgentEvent> | null {
        switch (event) {
            case AgentEvent.SPAWN_AGENT:
                console.log("aloo", event, this.context);

                return new IdleAgentState({
                    ...this.context,
                    agent: new Agent(),
                });
            case AgentEvent.NONE:
            case AgentEvent.UPDATE_AGENT:
                return null;
        }
    }
}
