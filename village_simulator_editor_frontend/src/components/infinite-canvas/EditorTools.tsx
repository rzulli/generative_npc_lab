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
    FolderOpen,
    HardDriveDownload,
    LoaderCircle,
    PauseCircle,
    PlayCircle,
    Plug,
    ReceiptText,
    RedoDot,
    Unplug,
} from "lucide-react";
import { useSelector } from "react-redux";
import "tldraw/tldraw.css";
import { useEditor } from "tldraw";
import { Menubar } from "../ui/menubar";

import { addPrompt, createNewPrompt } from "@/store/slices/promptMetaSlice";
import { EventBus } from "@/game/EventBus";

import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fetchPromptsAsync } from "@/store/slices/promptMetaSlice";

import { useEffect, useState } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";

export function EditorTools() {
    const editor = useEditor();
    const simulationInstance = useAppSelector(selectSimulationInstance);
    const state = useSelector((state) => state.socket);

    const dispatch = useAppDispatch();

    const handleStart = () => {
        if (editor) {
            console.log("simulation_start", editor, simulationInstance);
            // const { id, x, y, w, h, scope, logInstances } = event.detail;
            editor.createShapes([
                {
                    id: "shape:canvas",
                    type: "simulation-canvas",
                    x: 0,
                    y: 0,
                },
            ]);
            editor.createShape({
                id: "shape:simulation-screen",
                type: "simulation-log",
                x: 0,
                y: 650,
                props: {
                    h: 400,
                    w: 600,
                    scope: "Simulation",
                    shapeType: "simulationShape",
                },
            });
        }
    };
    useEffect(() => {
        const handleAddNewPrompt = (data) => {
            if (editor) {
                console.log(
                    data,
                    "shape:prompt" + (data.shape_id ?? data.record_uid)
                );
                editor.createShapes([
                    {
                        id: "shape:prompt" + (data.shape_id ?? data.record_uid),
                        type: "prompt-editor",
                        x: 0,
                        y: 0,
                        props: {
                            id: data.shape_id ?? data.record_uid,
                        },
                    },
                ]);

                editor.zoomToFit();
            }
        };

        EventBus.on("addNewPrompt", (data) => handleAddNewPrompt(data));

        return () => {
            EventBus.off("addNewPrompt", (data) => handleAddNewPrompt(data));
        };
    }, [editor]);

    return (
        <div className="absolute inset-x-0 items-center flex flex-1 justify-around z-[300] p-2 pointer-events-none ">
            <Menubar className="text-lg pointer-events-auto cursor-pointer">
                <div
                    onClick={() => {
                        dispatch(createNewPrompt());
                    }}
                >
                    <ReceiptText />
                </div>
                <div>
                    <PromptSelectorModal />
                </div>
            </Menubar>
            <Menubar className="cursor-pointer">
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
                                        onClick={() =>
                                            dispatch(pauseSimulation())
                                        }
                                    >
                                        <PauseCircle />
                                    </div>
                                )}
                                {!simulationInstance.continous && (
                                    <div
                                        className="text-green-500 text-lg pointer-events-auto"
                                        onClick={() =>
                                            dispatch(playSimulation())
                                        }
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
            </Menubar>
        </div>
    );
}

function PromptSelectorModal() {
    const [open, setOpen] = useState(false);
    const [prompts, setPrompts] = useState([]);
    const dispatch = useAppDispatch();
    const [selectedPromptId, setSelectedPromptId] = useState<string | null>(
        null
    );

    useEffect(() => {
        dispatch(fetchPromptsAsync()).then((result) => {
            if (fetchPromptsAsync.fulfilled.match(result)) {
                setPrompts(result.payload);
            }
        });
    }, [dispatch]);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSelectPrompt = (id: string) => {
        console.log(id);
        setSelectedPromptId(id);
    };

    const handleOpenPrompt = () => {
        if (selectedPromptId) {
            console.log("Opening prompt with ID:", selectedPromptId, prompts);
            const selectedPrompt = prompts.find(
                (prompt) => prompt.record_uid === selectedPromptId
            );
            console.log(selectedPrompt);
            dispatch(addPrompt(selectedPrompt));
            if (selectedPrompt) {
                EventBus.emit("addNewPrompt", selectedPrompt);
            }
            handleClose();
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <FolderOpen />
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Select a Prompt</AlertDialogTitle>
                    <AlertDialogDescription>
                        Choose a prompt from the list to open.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <ScrollArea className="h-72 w-full">
                    {prompts
                        .filter((prompt) => !prompt.deleted)
                        .map((prompt) => (
                            <div
                                key={prompt.record_uid}
                                className={`p-2 rounded-md hover:bg-secondary cursor-pointer ${
                                    selectedPromptId === prompt.record_uid
                                        ? "bg-secondary"
                                        : ""
                                }`}
                                onClick={() =>
                                    handleSelectPrompt(prompt.record_uid)
                                }
                            >
                                {prompt.name}

                                <Badge className="ml-2">
                                    Created:{" "}
                                    {new Date(
                                        prompt.created_at.$date
                                    ).toLocaleDateString("en-US", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </Badge>
                                <Badge className="ml-2">
                                    Updated:{" "}
                                    {timeAgo(new Date(prompt.updated_at.$date))}
                                </Badge>
                            </div>
                        ))}
                </ScrollArea>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={!selectedPromptId}
                        onClick={handleOpenPrompt}
                    >
                        Open
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
