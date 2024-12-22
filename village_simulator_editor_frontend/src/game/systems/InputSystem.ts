import Phaser from "phaser";
import { defineSystem, defineQuery } from "bitecs";

import Velocity from "../components/Velocity";
import Player from "../components/Player";
import Input, { Direction } from "../components/Input";
import Rotation from "../components/Rotation";

interface InputAction {
    keys: [Phaser.Input.Keyboard.Key];
    action: (event) => void;
}
export default function createInputSystem(InputActionList: [InputAction]) {
    const inputQuery = defineQuery([Input]);

    return defineSystem((world) => {
        for (let j = 0; j < InputActionList.length; ++j) {
            if (
                InputActionList[j] == null ||
                InputActionList[j].keys.length == 0
            ) {
                continue;
            }

            for (let i = 0; i < InputActionList[j].keys.length; i++) {
                if (InputActionList[j].keys[i].isDown) {
                    InputActionList[j].action(
                        InputActionList[j].keys[i].keyCode
                    );
                }
            }
        }

        return world;
    });
}
