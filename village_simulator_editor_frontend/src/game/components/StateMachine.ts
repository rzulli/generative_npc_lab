import { Component, defineComponent, Types } from "bitecs";
import { StateMachine } from "@/lib/stateMachine/StateMachine";

export const StateMachineComponent: Component = defineComponent({
    current: [StateMachine],
});

export default StateMachineComponent;
