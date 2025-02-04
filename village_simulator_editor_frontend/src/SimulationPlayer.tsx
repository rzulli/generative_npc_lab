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
} from "tldraw";

import { SquareArrowDownLeft, SquareArrowOutUpRight } from "lucide-react";
import { useSelector } from "react-redux";
import { Circle2d, Geometry2d, ShapeUtil } from "tldraw";

import { EventBus } from "./game/EventBus";
import { PhaserSimulationCanvas } from "./game/PhaserGame";
import { useAppDispatch, useAppSelector } from "./hooks/hooks";
import { selectSimulationInstance } from "./store/slices/simulationInstanceSlice";
import { selectSimulationMeta } from "./store/slices/simulationMetaSlice";
import { EditorTools } from "./components/infinite-canvas/EditorTools";
import { SimulationLogShapeUtil } from "./SimulationLogShapeUtil";

type ISimulationCanvasShape = TLBaseShape<
    "my-interactive-shape",
    {
        w: number;
        h: number;
        container_w: string;
        container_h: string;
    }
>;
class SimulationCanvasShapeUtil extends BaseBoxShapeUtil<ISimulationCanvasShape> {
    static override type = "simulation-canvas" as const;

    static override props: RecordProps<ISimulationCanvasShape> = {
        w: T.number,
        h: T.number,
        container_h: T.string,
        container_w: T.string,
    };

    getDefaultProps(): ISimulationCanvasShape["props"] {
        return {
            w: 800,
            h: 600,
            container_w: "30vw",
            container_h: "30vh",
        };
    }

    override canResize() {
        return false;
    }

    component(shape: ISimulationCanvasShape) {
        return (
            <div className="flex flex-col" style={{ pointerEvents: "all" }}>
                <div className="flex z-10 p-1 gap-3 bg-slate-950 text-white">
                    {shape.props.w > 400 && (
                        <div
                            className=" flex"
                            onMouseDown={(e) => {
                                e.stopPropagation();

                                if (shape.props.w == 1920) {
                                    this.editor.updateShape({
                                        id: shape.id,
                                        type: shape.type,
                                        props: {
                                            ...shape.props,
                                            w: 800,
                                            h: 600,
                                        },
                                    });
                                } else if (shape.props.w == 800) {
                                    this.editor.updateShape({
                                        id: shape.id,
                                        type: shape.type,
                                        props: {
                                            ...shape.props,
                                            w: 400,
                                            h: 320,
                                        },
                                    });
                                } else if (shape.props.w == 400) {
                                    this.editor.updateShape({
                                        id: shape.id,
                                        type: shape.type,
                                        props: {
                                            ...shape.props,
                                            w: 1920,
                                            h: 1080,
                                        },
                                    });
                                }
                            }}
                        >
                            {shape.props.w == 1920 && (
                                <SquareArrowDownLeft className="w-4 h-4 " />
                            )}

                            {shape.props.w == 800 && (
                                <SquareArrowDownLeft className="w-4 h-4 " />
                            )}
                        </div>
                    )}
                    {shape.props.w < 1900 && (
                        <div
                            className=" flex"
                            onMouseDown={(e) => {
                                e.stopPropagation();

                                if (shape.props.w == 400) {
                                    this.editor.updateShape({
                                        id: shape.id,
                                        type: shape.type,
                                        props: {
                                            ...shape.props,
                                            w: 800,
                                            h: 600,
                                        },
                                    });
                                } else if (shape.props.w == 800) {
                                    this.editor.updateShape({
                                        id: shape.id,
                                        type: shape.type,
                                        props: {
                                            ...shape.props,
                                            w: 1920,
                                            h: 1080,
                                        },
                                    });
                                } else if (shape.props.w == 1920) {
                                    this.editor.updateShape({
                                        id: shape.id,
                                        type: shape.type,
                                        props: {
                                            ...shape.props,
                                            w: 400,
                                            h: 320,
                                        },
                                    });
                                }
                            }}
                        >
                            {shape.props.w == 400 && (
                                <SquareArrowOutUpRight className="w-4 h-4 " />
                            )}

                            {shape.props.w == 800 && (
                                <SquareArrowOutUpRight className="w-4 h-4 " />
                            )}
                        </div>
                    )}

                    <div>
                        {shape.props.w} x {shape.props.h}
                    </div>
                    <div>Simulation Panel</div>
                </div>
                <PhaserSimulationCanvas
                    width={shape.props.w}
                    height={shape.props.h - 26}
                />
            </div>
        );
    }

    override canScroll(shape: ISimulationCanvasShape) {
        return false;
    }
    override canEdit(_shape: ISimulationCanvasShape): boolean {
        return false;
    }
    override canBeLaidOut(_shape: ISimulationCanvasShape): boolean {
        return false;
    }

    indicator(shape: ISimulationCanvasShape) {
        return <rect width={shape.props.w} height={shape.props.h} />;
    }
}
// const GridExample = () => {
//     // Row Data: The data to be displayed.
//     const [rowData, setRowData] = useState([
//         { make: "Tesla", model: "Model Y", price: 64950, electric: true },
//         { make: "Ford", model: "F-Series", price: 33850, electric: false },
//         { make: "Toyota", model: "Corolla", price: 29600, electric: false },
//     ]);

//     // Column Definitions: Defines the columns to be displayed.
//     const [colDefs, setColDefs] = useState([
//         { field: "make" },
//         { field: "model" },
//         { field: "price" },
//         { field: "electric" },
//     ]);

//     return (
//         <>
//             <AgGridReact rowData={rowData} columnDefs={colDefs} />
//         </>
//     );
// };
export default function SimulationPlayer() {
    const [editor, setEditor] = useState<Editor | null>(null);
    const [shapesSet, setShapesSet] = useState<Set<string>>(new Set());
    const [updateShapesToggle, setUpdateShapesToggle] = useState(false);
    const simulationMeta = useAppSelector(selectSimulationMeta);
    const simulationInstance = useAppSelector(selectSimulationInstance);
    const state = useSelector((state) => state.socket);

    const dispatch = useAppDispatch();
    const updateShapes = () => {
        // console.log("updateShapes", simulationInstance.events);

        const newShapes: any[] = [];
        const existingShapeIds = new Set<string>();

        Object.entries(simulationInstance.events).forEach(([scope, log]) => {
            // console.log(scope, log);
            const calculatedWidth = Math.floor(window.innerWidth * 0.5);
            const calculatedHeight = Math.floor(window.innerHeight * 0.5);

            const shapeId = `shape:events-${scope}`;
            existingShapeIds.add(shapeId);
            if (!shapesSet.has(shapeId)) {
                const currentX =
                    newShapes.length > 0
                        ? newShapes[newShapes.length - 1].x +
                          calculatedWidth +
                          10
                        : 0;
                newShapes.push({
                    id: shapeId,
                    type: "simulation-log",
                    x: currentX,
                    y: 0,
                    props: {
                        h: calculatedHeight,
                        w: calculatedWidth,
                        scope: scope,
                    },
                });
                shapesSet.add(shapeId);
            }
        });
        if (editor) {
            editor.createShapes(newShapes);
            setShapesSet(new Set(shapesSet));
        }
    };
    useEffect(() => {
        if (!editor) return;

        EventBus.on("socketEvent", () =>
            setUpdateShapesToggle((prev) => !prev)
        );
        return () => {
            EventBus.off("socketEvent", () =>
                setUpdateShapesToggle((prev) => !prev)
            );
        };
    }, [editor]);

    useEffect(() => {
        if (!editor) return;
        // console.log(updateShapesToggle);
        updateShapes();
    }, [updateShapesToggle]);

    // useEffect(() => {
    //     const handleUpdate = (event: any) => {
    //         if (editor) {
    //             console.log(event.data.state);
    //             console.log(
    //                 "agent_update",
    //                 JSON.parse(event.data.state.atavistic)
    //             );
    //             // const { id, x, y, w, h, scope, logInstances } = event.detail;
    //             // editor.createShapes([
    //             //     {
    //             //         id,
    //             //         type: "simulation-log",
    //             //         x,
    //             //         y,
    //             //         props: { w, h, scope, logInstances },
    //             //     },
    //             // ]);
    //         }
    //     };

    //     EventBus.on("agent_update", handleUpdate);

    //     return () => {
    //         EventBus.off("agent_update", handleUpdate);
    //     };
    // }, [editor]);
    // useEffect(() => {
    //     const handleSpawnAgent = (event: any) => {
    //         if (editor) {
    //             console.log("spawn_agent", event);
    //             // const { id, x, y, w, h, scope, logInstances } = event.detail;
    //             // editor.createShapes([
    //             //     {
    //             //         id,
    //             //         type: "simulation-log",
    //             //         x,
    //             //         y,
    //             //         props: { w, h, scope, logInstances },
    //             //     },
    //             // ]);
    //         }
    //     };

    //     EventBus.on("spawn_agent", handleSpawnAgent);

    //     return () => {
    //         EventBus.off("spawn_agent", handleSpawnAgent);
    //     };
    // }, [editor]);

    useEffect(() => {
        // EventBus.on("simulation_start", handleStart);
        // return () => {
        //     EventBus.off("simulation_start", handleStart);
        // };
    }, [editor]);

    return (
        <div className="relative h-[100vh]">
            <Tldraw
                tools={[]}
                shapeUtils={[SimulationLogShapeUtil, SimulationCanvasShapeUtil]}
                onMount={(editor) => {
                    setEditor(editor);
                    // editor.createShape({
                    //     type: "simulation-canvas",
                    //     x: 100,
                    //     y: 100,
                    //     props: {
                    //         w: 200,
                    //         h: 200,
                    //         scope: "global",
                    //         logInstances: () => object,
                    //     },
                    // });
                }}
            >
                <EditorTools editor={editor} />
            </Tldraw>
        </div>
    );
}
