import { Component, defineComponent, Types } from "bitecs";
import { StateMachine } from "@/lib/stateMachine/StateMachine";

interface StateMachineComponentType {
    current: StateMachine;
}

export const StateMachineComponent = defineComponent<StateMachineComponentType>(
    {
        current: [StateMachine],
    }
);

export default StateMachineComponent;
