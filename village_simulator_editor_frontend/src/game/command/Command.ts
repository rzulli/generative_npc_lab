import Tilemap from "../components/Tilemap";

export class Command {
    execute: Function;
    constructor(execute: Function) {
        this.execute = execute;
    }
}

export function PlaceTileCommand(
    map_eid: number,
    tileId: number,
    coord: {
        x: number;
        y: number;
    },
    layer: string
) {
    return new Command(() => {
        console.log(
            "asdasdas",
            Tilemap.map[map_eid],
            tileId,
            coord.x,
            coord.y,
            true,
            layer
        );
        Tilemap.map[map_eid].fill(tileId, coord.x, coord.y, 1, 1, true, layer);
    });
}

export function PlaceTileAreaCommand(
    map_eid: number,
    tileId: number,
    coord: {
        x: number;
        y: number;
    },
    area: {
        x: number;
        y: number;
    },
    layer: string
) {
    return new Command(() => {
        console.log(
            "asdasdas",
            Tilemap.map[map_eid],
            tileId,
            coord.x,
            coord.y,
            area.x,
            area.y,
            true,
            layer
        );
        Tilemap.map[map_eid].fill(
            tileId,
            Math.max(coord.x - area.x + 1, 0),
            Math.max(coord.y - area.y + 1, 0),
            area.x,
            area.y,
            true,
            layer
        );
    });
}

export function ToggleFocusLayerCommand(editorScene) {
    return new Command(() => {
        console.log("aaaaaaaaaa");
        if (editorScene.isUsingFocusTools) {
            editorScene.isUsingFocusTools = false;
        } else {
            editorScene.isUsingFocusTools = true;
            editorScene.currentLayerFocused = 0;
        }
        console.log(
            editorScene.isUsingFocusTools,
            editorScene.currentLayerFocused
        );
    });
}
