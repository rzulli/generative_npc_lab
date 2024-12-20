import Phaser, { Scene } from "phaser";
import { defineSystem, defineQuery } from "bitecs";

import Velocity from "../components/Velocity";
import Player from "../components/Player";
import Input, { Direction } from "../components/Input";
import Rotation from "../components/Rotation";
import Tilemap from "../components/Tilemap";
import StateMachineComponent from "../components/StateMachine";
import { DEBOUNCE_TIMEOUT } from "../consts";
import { EventBus } from "../EventBus";

export enum TilemapEvent {
    NEW_MAP,
    LOAD_MAP_DATA_SUCCESS,
    IDLE,
}
export class TilemapEventHandler {
    private currentEvent: TilemapEvent = TilemapEvent.IDLE;
    debounceActions: TilemapEvent[] = [];

    constructor() {}
    handle(): TilemapEvent {
        const event = this.currentEvent;
        this.currentEvent = TilemapEvent.IDLE;
        return event;
    }

    emit(event: TilemapEvent): void {
        if (
            !this.debounceActions.includes(event) &&
            event != TilemapEvent.IDLE
        ) {
            this.currentEvent = event;
            this.debounceActions.push(event);
            setTimeout(() => {
                this.debounceActions = this.debounceActions.filter(
                    (action) => action !== event
                );
            }, DEBOUNCE_TIMEOUT);
        }
    }
}

export default function createTilemapSystem() {
    const mapQuery = defineQuery([Tilemap, StateMachineComponent]);
    const eventHandler = new TilemapEventHandler();
    eventHandler.emit(TilemapEvent.NEW_MAP);
    EventBus.addListener("ON_ADD_TILEMAP", () => {
        eventHandler.emit(TilemapEvent.LOAD_MAP_DATA_SUCCESS);
    });

    return defineSystem((world) => {
        const entities = mapQuery(world);

        for (let i = 0; i < entities.length; ++i) {
            const id = entities[i];
            if (StateMachineComponent.current[id]) {
                const event = eventHandler.handle();
                console.log(event);

                StateMachineComponent.current[id].send(event);
            }
        }
        return world;
    });
}
