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

class CursorEventHandler extends AbstractEventHandler<CursorEvent> {
    constructor() {
        super();
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
            this.emit(CursorEvent.SELECT_TILE, data);
        });
    }

    handle(): { event: CursorEvent; data: any } {
        const event = this.currentEvent;
        this.currentEvent = { event: CursorEvent.NONE, data: null };
        return event;
    }
}

export default function createCursorSystem() {
    const cursorQuery = defineQuery([Cursor]);
    const eventHandler = new CursorEventHandler();
    const stateMachineSystem = createStateMachineSystem<CursorEvent>();

    return defineSystem((world: IWorld, scene: Phaser.Scene) => {
        const cursors = cursorQuery(world);

        if (scene.input.activePointer.isDown) {
            eventHandler.emit(CursorEvent.ON_MOUSE_DOWN, null, 100);
        }
        stateMachineSystem(world, cursors, eventHandler, CursorEvent.NONE);

        return world;
    });
}
