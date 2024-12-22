import Phaser, { Scene } from "phaser";
import { defineSystem, defineQuery } from "bitecs";

import Velocity from "../components/Velocity";
import Player from "../components/Player";
import Input, { Direction } from "../components/Input";
import Rotation from "../components/Rotation";
import Tilemap from "../components/Tilemap";
import StateMachineComponent from "../components/StateMachine";
import Cursor from "../components/Cursor";
import { EventBus } from "../EventBus";
import { CursorEvent } from "../prefabs/Cursor";
import { DEBOUNCE_TIMEOUT } from "../consts";

export class CursorEventHandler {
    private currentEvent: { event: CursorEvent; data: any } = {
        event: CursorEvent.NONE,
        data: null,
    };
    debounceActions: CursorEvent[] = [];

    constructor() {
        EventBus.on("ON_TOGGLE_PLACE_CURSOR", () => {
            this.emit(CursorEvent.PLACE_TILE);
        });
        EventBus.on("ON_TOGGLE_SELECT_AREA", () => {
            this.emit(CursorEvent.SELECT_AREA);
        });
        EventBus.on("ON_CANCEL_TOOL", () => {
            this.emit(CursorEvent.CANCEL);
        });
        EventBus.on("ON_SELECT_TILE", (data) => {
            console.log("ahsduahsudhaus");
            this.emit(CursorEvent.SELECT_TILE, data);
        });
    }

    handle(): { event: CursorEvent; data: any } {
        const event = this.currentEvent;
        this.currentEvent = { event: CursorEvent.NONE, data: null };
        return event;
    }

    emit(event: CursorEvent, data: any = null) {
        if (
            !this.debounceActions.includes(event) &&
            event != CursorEvent.NONE
        ) {
            this.currentEvent = { event, data };
            this.debounceActions.push(event);
            setTimeout(() => {
                this.debounceActions = this.debounceActions.filter(
                    (action) => action !== event
                );
            }, DEBOUNCE_TIMEOUT);
        }
    }
}

export default function createCursorSystem() {
    const mapQuery = defineQuery([Cursor, Tilemap, StateMachineComponent]);
    const cursorQuery = defineQuery([Cursor]);
    const eventHandler = new CursorEventHandler();

    return defineSystem((world, scene: Phaser.Scene) => {
        const cursors = cursorQuery(world);

        if (scene.input.activePointer.isDown) {
            eventHandler.emit(CursorEvent.ON_MOUSE_DOWN);
        }
        for (let i = 0; i < cursors.length; ++i) {
            const id = cursors[i];
            if (StateMachineComponent.current[id]) {
                const event = eventHandler.handle();
                if (event.event != CursorEvent.NONE) {
                    console.log("Handling ", event);
                }
                StateMachineComponent.current[id].send(event);
            }
        }

        return world;
    });
}
