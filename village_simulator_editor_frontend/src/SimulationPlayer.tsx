import { useEffect, useState } from "react";
import "tldraw/tldraw.css";
/* eslint-disable react-hooks/rules-of-hooks */
import {
    BaseBoxShapeUtil,
    Editor,
    RecordProps,
    T,
    TLBaseShape,
    Tldraw,
    TldrawEditor,
    useEditor,
} from "tldraw";

import { SquareArrowDownLeft, SquareArrowOutUpRight } from "lucide-react";
import { useSelector } from "react-redux";
import { Circle2d, Geometry2d, ShapeUtil } from "tldraw";

import { EventBus } from "./game/EventBus";
import { PhaserSimulationCanvas } from "./game/PhaserGame";
import { useAppDispatch, useAppSelector } from "./hooks/hooks";
import {
    selectSimulationInstance,
    setMapMetadata,
    setReverseLookup,
    SimulationInstanceSliceState,
} from "./store/slices/simulationInstanceSlice";
import { selectSimulationMeta } from "./store/slices/simulationMetaSlice";
import { EditorTools } from "./components/infinite-canvas/EditorTools";
import { SimulationLogShapeUtil } from "./components/infinite-canvas/SimulationLogShapeUtil";
import SimulationCanvasShapeUtil from "./components/infinite-canvas/SimulationCanvasShapeUtil";
import { simulationInstanceSlice } from "./store/slices/simulationInstanceSlice";
import { PromptShapeUtil } from "./components/infinite-canvas/PromptShapeUtil";

export default function SimulationPlayer() {
    return (
        <div className="relative h-[100vh]">
            <Tldraw
                hideUi
                shapeUtils={[
                    SimulationLogShapeUtil,
                    SimulationCanvasShapeUtil,
                    PromptShapeUtil,
                ]}
                onMount={(editor) => {
                    editor.zoomOut();
                    editor.createShape({
                        id: "shape:alo",
                        type: "simulation-log",
                        x: 0,
                        y: 620,
                        props: {
                            h: 400,
                            w: 600,
                            scope: "agent",
                            shapeType: "agentShape",
                        },
                    });
                    editor.zoomToFit();
                }}
            >
                <SimulationShapes />
                <EditorTools />
            </Tldraw>
        </div>
    );
}
export function SimulationShapes() {
    const editor = useEditor();
    const [shapesSet, setShapesSet] = useState<Set<string>>(new Set());

    const simulationInstance = useAppSelector(selectSimulationInstance);

    const dispatch = useAppDispatch();

    const updateShapes = (newEvent) => {
        const shapeId = `shape:events-${newEvent.scope}`;
        if (!shapesSet.has(shapeId)) {
            console.log("updateShape", newEvent);
            const calculatedWidth = Math.floor(window.innerWidth * 0.5);
            const calculatedHeight = Math.floor(window.innerHeight * 0.5);

            const currentX =
                shapesSet.size == 0
                    ? -calculatedWidth / 2
                    : (shapesSet.size - 1) * (calculatedWidth + 10) +
                      calculatedWidth -
                      calculatedWidth / 2;
            editor.createShape({
                id: shapeId,
                type: "simulation-log",
                x: currentX,
                y: 620,
                props: {
                    h: calculatedHeight,
                    w: calculatedWidth,
                    scope: newEvent.scope,
                },
            });
            shapesSet.add(shapeId);

            editor.zoomToFit();
        }
    };
    useEffect(() => {
        if (!editor) return;

        EventBus.on("socketEvent", (newEvent) => updateShapes(newEvent));
        return () => {
            EventBus.off("socketEvent", (newEvent) => updateShapes(newEvent));
        };
    }, [editor]);

    // useEffect(() => {
    //     EventBus.on("map_metadata", (newEvent) => {
    //         console.log(newEvent.data);
    //         dispatch(setMapMetadata(newEvent.data));
    //     });
    //     return () => {
    //         EventBus.on("map_metadata", (newEvent) => {
    //             console.log(newEvent.data);
    //             dispatch(setMapMetadata(newEvent.data));
    //         });
    //     };
    // }, [editor]);

    // useEffect(() => {
    //     EventBus.on("reverse_lookup", (newEvent) =>
    //         dispatch(setReverseLookup(newEvent.data))
    //     );
    //     return () => {
    //         EventBus.off("reverse_lookup", (newEvent) =>
    //             dispatch(setReverseLookup(newEvent.data))
    //         );
    //     };
    // }, [editor]);
    return <div></div>;
}
