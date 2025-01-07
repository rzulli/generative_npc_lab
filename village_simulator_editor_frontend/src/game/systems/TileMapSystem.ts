import Phaser, { Scene } from "phaser";
import { defineSystem, defineQuery, IWorld } from "bitecs";

import Velocity from "../components/Velocity";
import Player from "../components/Player";
import Input, { Direction } from "../components/Input";
import Rotation from "../components/Rotation";
import Tilemap from "../components/Tilemap";
import StateMachineComponent from "../components/StateMachine";
import { DEBOUNCE_TIMEOUT } from "../consts";
import { EventBus } from "../EventBus";
import { AbstractEventHandler } from "@/lib/stateMachine/AbstractEventHandler";
import { createStateMachineSystem } from "./StateMachineSystem";

export enum TilemapEvent {
    NEW_MAP,
    LOAD_MAP_DATA_SUCCESS,
    IDLE,
}
export class TilemapEventHandler extends AbstractEventHandler<TilemapEvent> {
    constructor() {
        super();
        EventBus.addListener("ON_ADD_TILEMAP", () => {
            this.emit(TilemapEvent.LOAD_MAP_DATA_SUCCESS);
        });
    }

    handle(): { event: TEventType; data: any } {
        const event = this.currentEvent;
        this.currentEvent = { event: TilemapEvent.IDLE, data: null };
        return event;
    }
}

export default function createTilemapSystem() {
    const mapQuery = defineQuery([Tilemap, StateMachineComponent]);
    const eventHandler = new TilemapEventHandler();
    eventHandler.emit(TilemapEvent.NEW_MAP);
    const stateMachineSystem = createStateMachineSystem<TilemapEvent>();

    return defineSystem((world: IWorld) => {
        const entities = mapQuery(world);
        stateMachineSystem(world, entities, eventHandler, TilemapEvent.IDLE);

        return world;
    });
}
