import "tldraw/tldraw.css";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import {
    pauseSimulation,
    playSimulation,
    selectSimulationInstance,
    spawnSimulation,
    stepSimulation,
} from "@/store/slices/simulationInstanceSlice";
import {
    connectToSocket,
    disconnectFromSocket,
} from "@/store/slices/socketSlice";
import {
    CircleOff,
    HardDriveDownload,
    LoaderCircle,
    PauseCircle,
    PlayCircle,
    Plug,
    RedoDot,
    Unplug,
} from "lucide-react";
import { useSelector } from "react-redux";
import "tldraw/tldraw.css";

export function EditorTools(editor) {
    const simulationInstance = useAppSelector(selectSimulationInstance);
    const state = useSelector((state) => state.socket);
    const dispatch = useAppDispatch();

    const handleStart = (event: any) => {
        if (editor.editor) {
            console.log("simulation_start", editor, event);
            // const { id, x, y, w, h, scope, logInstances } = event.detail;
            editor.editor.createShapes([
                {
                    id: "shape:canvas",
                    type: "simulation-canvas",
                    x: 400,
                    y: 300,
                },
            ]);
        }
    };
    return (
        <div className="absolute inset-x-0 items-center flex flex-1 justify-center z-[300] p-2 pointer-events-none ">
            {state.connectionStatus == "connected" ? (
                <>
                    <div
                        className="text-green-500 text-lg pointer-events-auto"
                        onClick={() => dispatch(disconnectFromSocket())}
                    >
                        <Unplug />
                    </div>{" "}
                    {simulationInstance.status == "failed" && (
                        <div className="text-red-500 text-lg pointer-events-auto">
                            <CircleOff />
                        </div>
                    )}
                    {simulationInstance.status == "loading" && (
                        <div className="text-green-500 text-lg pointer-events-auto">
                            <LoaderCircle />
                        </div>
                    )}
                    {!simulationInstance.status && (
                        <div
                            className="text-green-500 text-lg pointer-events-auto"
                            onClick={() =>
                                dispatch(
                                    spawnSimulation({
                                        record_uid: "uFVuQ",
                                        version: null,
                                    })
                                )
                            }
                        >
                            <HardDriveDownload />
                        </div>
                    )}
                    {simulationInstance.status == "idle" && (
                        <>
                            <div
                                className="text-green-500 text-lg pointer-events-auto"
                                onClick={() =>
                                    dispatch(
                                        stepSimulation({
                                            record_uid: "uFVuQ",
                                            version: null,
                                        })
                                    )
                                }
                            >
                                <RedoDot />
                            </div>
                            {simulationInstance.continous && (
                                <div
                                    className="text-green-500 text-lg pointer-events-auto"
                                    onClick={() => dispatch(pauseSimulation())}
                                >
                                    <PauseCircle />
                                </div>
                            )}
                            {!simulationInstance.continous && (
                                <div
                                    className="text-green-500 text-lg pointer-events-auto"
                                    onClick={() => dispatch(playSimulation())}
                                >
                                    <PlayCircle />
                                </div>
                            )}
                        </>
                    )}
                </>
            ) : (
                <div
                    className="text-slate-800 text-lg pointer-events-auto"
                    onClick={() => {
                        dispatch(connectToSocket());
                        handleStart();
                    }}
                >
                    <Plug />
                </div>
            )}
            {/* <div
            className="text-slate-800 text-lg pointer-events-auto"
            onClick={() =>
                dispatch(loadMap({ map_uid: "Rr7paNh" }))
            }
        >
            <FolderOpen />
        </div> */}
        </div>
    );
}
