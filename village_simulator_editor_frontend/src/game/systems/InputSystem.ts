import Phaser from "phaser";
import { defineSystem, defineQuery } from "bitecs";

import Velocity from "../components/Velocity";
import Player from "../components/Player";
import Input, { Direction } from "../components/Input";
import Rotation from "../components/Rotation";

interface InputAction {
    keys: [Phaser.Input.Keyboard.Key];
    action: (event) => void;
    debounceTime: number;
    lastExecuted: number;
}
interface InputActionList {
    data: [InputAction];
}
export default function createInputSystem(InputActionList: InputActionList) {
    const inputQuery = defineQuery([Input]);
    console.log(InputActionList);
    return defineSystem((world) => {
        for (let j = 0; j < InputActionList.data.length; ++j) {
            if (
                InputActionList.data[j] == null ||
                InputActionList.data[j].keys.length == 0
            ) {
                continue;
            }

            for (let i = 0; i < InputActionList.data[j].keys.length; i++) {
                const inputAction = InputActionList.data[j];
                const currentTime = Date.now();

                if (inputAction.keys[i].isDown) {
                    if (
                        inputAction.lastExecuted == null ||
                        currentTime - inputAction.lastExecuted >=
                            inputAction.debounceTime
                    ) {
                        inputAction.action(inputAction.keys[i].keyCode);
                        inputAction.lastExecuted = currentTime;
                    }
                }
            }
        }

        return world;
    });
}
