import { Component, defineComponent, Types } from "bitecs";

import { Tilemaps } from "phaser";
export const Tilemap: Component = defineComponent({
    map: [Tilemaps.Tilemap],
    tileset_group: [Tilemaps.Tileset],
    collisions: [Tilemaps.Tileset],
});

export default Tilemap;
