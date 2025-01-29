import { useContext, useEffect, useRef, useState } from "react";
import { SimulationContext } from "./hooks/useSimulationContext";
interface SimulationEditorProps {}

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

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "tldraw/tldraw.css";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

import {
    Circle2d,
    Geometry2d,
    HTMLContainer,
    Rectangle2d,
    ShapeUtil,
    TLShape,
} from "tldraw";
import "tldraw/tldraw.css";
import SimulationLog from "./SimulationLog";
import {
    BluetoothConnected,
    FolderOpen,
    Loader,
    PlayCircle,
    PowerCircle,
    Wifi,
} from "lucide-react";
import CollapsibleLog from "./components/infinite-canvas/CollapsibleLog";
import { object } from "zod";
import SimulationEditor from "./SimulationEditor";
import { useAppDispatch } from "./hooks/hooks";
import { loadMap } from "./slices/mapMetaSlice";
import { EventBus } from "./game/EventBus";
import {
    IRefPhaserGame,
    PhaserGame,
    PhaserSimulationCanvas,
} from "./game/PhaserGame";

// There's a guide at the bottom of this file!

// [1]
type MyGridShape = TLBaseShape<"my-grid-shape", Record<string, never>>;
type MyCounterShape = TLBaseShape<"my-counter-shape", Record<string, never>>;

// [2]
const SLOT_SIZE = 100;
class MyCounterShapeUtil extends ShapeUtil<MyCounterShape> {
    static override type = "my-counter-shape" as const;

    override canResize() {
        return false;
    }
    override hideResizeHandles() {
        return true;
    }

    getDefaultProps(): MyCounterShape["props"] {
        return {};
    }

    getGeometry(): Geometry2d {
        return new Circle2d({ radius: SLOT_SIZE / 2 - 10, isFilled: true });
    }

    component() {
        return (
            <HTMLContainer
                style={{
                    backgroundColor: "#e03131",
                    border: "1px solid #ff8787",
                    borderRadius: "50%",
                }}
            />
        );
    }

    indicator() {
        return (
            <circle
                r={SLOT_SIZE / 2 - 10}
                cx={SLOT_SIZE / 2 - 10}
                cy={SLOT_SIZE / 2 - 10}
            />
        );
    }
}
type IMyInteractiveShape = TLBaseShape<
    "my-interactive-shape",
    {
        w: number;
        h: number;
        scope: string;
        logInstances: () => object;
    }
>;
// [3]
class SimulationLogShapeUtil extends BaseBoxShapeUtil<IMyInteractiveShape> {
    static override type = "simulation-log" as const;

    static override props: RecordProps<IMyInteractiveShape> = {
        w: T.number,
        h: T.number,
        scope: T.string,
        logInstances: T.any,
    };

    getDefaultProps(): IMyInteractiveShape["props"] {
        return {
            w: 230,
            h: 230,
            scope: "global",
            logInstances: () => object,
        };
    }

    override canResize() {
        return true;
    }

    component(shape: IMyInteractiveShape) {
        return (
            <HTMLContainer
                style={{
                    padding: 16,
                    height: shape.props.h,
                    width: shape.props.w,
                    // [a] This is where we allow pointer events on our shape
                    pointerEvents: "all",
                    backgroundColor: "#efefef",
                    overflow: "hidden",
                }}
            >
                <CollapsibleLog
                    key={shape.props.scope}
                    scope={shape.props.scope}
                    instancesFunction={shape.props.logInstances}
                />
            </HTMLContainer>
        );
    }

    // [5]
    indicator(shape: IMyInteractiveShape) {
        return <rect width={shape.props.w} height={shape.props.h} />;
    }
}
class SimulationCanvasShapeUtil extends BaseBoxShapeUtil<IMyInteractiveShape> {
    static override type = "simulation-canvas" as const;

    static override props: RecordProps<IMyInteractiveShape> = {
        w: T.number,
        h: T.number,
        scope: T.string,
        logInstances: T.any,
    };

    getDefaultProps(): IMyInteractiveShape["props"] {
        return {
            w: 230,
            h: 230,
            scope: "global",
            logInstances: () => object,
        };
    }

    override canResize() {
        return true;
    }

    component(shape: IMyInteractiveShape) {
        return (
            <HTMLContainer
                style={{
                    padding: 0,
                    height: shape.props.h,
                    width: shape.props.w,
                    pointerEvents: "all",
                    backgroundColor: "#efefef",
                    overflow: "hidden",
                }}
            >
                <PhaserSimulationCanvas
                    width={shape.props.w}
                    height={shape.props.h}
                />
            </HTMLContainer>
        );
    }

    override canScroll(shape: IMyInteractiveShape) {
        return false;
    }
    override canEdit(_shape: IMyInteractiveShape): boolean {
        return false;
    }
    override canBeLaidOut(_shape: IMyInteractiveShape): boolean {
        return false;
    }

    indicator(shape: IMyInteractiveShape) {
        return <rect width={shape.props.w} height={shape.props.h} />;
    }
}
const GridExample = () => {
    // Row Data: The data to be displayed.
    const [rowData, setRowData] = useState([
        { make: "Tesla", model: "Model Y", price: 64950, electric: true },
        { make: "Ford", model: "F-Series", price: 33850, electric: false },
        { make: "Toyota", model: "Corolla", price: 29600, electric: false },
    ]);

    // Column Definitions: Defines the columns to be displayed.
    const [colDefs, setColDefs] = useState([
        { field: "make" },
        { field: "model" },
        { field: "price" },
        { field: "electric" },
    ]);

    return (
        <>
            <AgGridReact rowData={rowData} columnDefs={colDefs} />
        </>
    );
};
export default function SimulationPlayer() {
    const { mapMeta, startSimulation, simulationState, stopSimulation } =
        useContext(SimulationContext);
    const [editor, setEditor] = useState<Editor | null>(null);
    const dispatch = useAppDispatch();
    const connectSimulation = () => {
        if (simulationState?.socket && simulationState?.socket?.connected) {
            simulationState.socket.emit("run_simulation");
        }
    };

    useEffect(() => {
        const handleSpawnAgent = (event: any) => {
            if (editor) {
                const { id, x, y, w, h, scope, logInstances } = event.detail;
                editor.createShapes([
                    {
                        id,
                        type: "simulation-log",
                        x,
                        y,
                        props: { w, h, scope, logInstances },
                    },
                ]);
            }
        };

        EventBus.on("spawn_agent", handleSpawnAgent);

        return () => {
            EventBus.off("spawn_agent", handleSpawnAgent);
        };
    }, [editor]);

    return (
        <div className="relative h-[100vh]">
            <Tldraw
                tools={[]}
                shapeUtils={[
                    SimulationLogShapeUtil,
                    MyCounterShapeUtil,
                    SimulationCanvasShapeUtil,
                ]}
                onMount={(editor) => {
                    setEditor(editor);
                    editor.createShape({
                        type: "simulation-canvas",
                        x: 100,
                        y: 100,
                        props: {
                            w: 200,
                            h: 200,
                            scope: "global",
                            logInstances: () => object,
                        },
                    });
                }}
            >
                <div className="absolute inset-x-0 items-center flex flex-1 justify-center z-[300] p-2 pointer-events-none ">
                    {simulationState?.socket?.connected ? (
                        <>
                            <div
                                className="text-green-500 text-lg pointer-events-auto"
                                onClick={() => stopSimulation()}
                            >
                                <Wifi />
                            </div>
                            <div
                                className="text-green-500 text-lg pointer-events-auto"
                                onClick={() => connectSimulation()}
                            >
                                <PlayCircle />
                            </div>{" "}
                        </>
                    ) : (
                        <div
                            className="text-slate-800 text-lg pointer-events-auto"
                            onClick={() => startSimulation()}
                        >
                            <PowerCircle />
                        </div>
                    )}
                    <div
                        className="text-slate-800 text-lg pointer-events-auto"
                        onClick={() =>
                            dispatch(loadMap({ map_uid: "Rr7paNh" }))
                        }
                    >
                        <FolderOpen />
                    </div>
                </div>
            </Tldraw>
        </div>
    );
}
