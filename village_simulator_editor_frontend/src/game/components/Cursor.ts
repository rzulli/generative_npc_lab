import { Component, defineComponent, Types } from "bitecs";

export const CursorComponent: Component = defineComponent({
    reference: [Phaser.GameObjects.GameObject],
});

export default CursorComponent;
