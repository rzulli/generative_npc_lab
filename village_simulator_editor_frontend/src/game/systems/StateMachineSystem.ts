import { defineSystem, IWorld } from "bitecs";
import StateMachineComponent from "../components/StateMachine";
import { AbstractEventHandler } from "../../lib/stateMachine/AbstractEventHandler";

export function createStateMachineSystem<TEvent>() {
    return defineSystem(
        (
            world: IWorld,
            entities: number[],
            eventHandler: AbstractEventHandler<TEvent>,
            idleEvent: any
        ) => {
            for (let i = 0; i < entities.length; ++i) {
                const id = entities[i];
                if (StateMachineComponent.current[id]) {
                    const event = eventHandler.handle();
                    if (event.event != idleEvent) {
                        // console.log("Handling ", event);
                    }
                    StateMachineComponent.current[id].send(event);
                }
            }
            return world;
        }
    );
}
