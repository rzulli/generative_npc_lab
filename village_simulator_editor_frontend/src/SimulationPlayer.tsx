import {
    useContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { MainMenu } from "./game/scenes/MainMenu";
import axios from "axios";
import { useToast } from "./hooks/use-toast";
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger,
} from "@/components/ui/menubar";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "src/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import useSimulation from "./context/SimulationContext";
import { SimulationContext } from "./hooks/useSimulationContext";
import EditorMainMenu from "./components/editor/EditorMainMenu";
import { MapSelectorCombobox } from "./components/editor/simulation-menu/NewSimulationMenu";
import {
    Box,
    Brain,
    Eye,
    EyeClosed,
    GripHorizontal,
    Layers,
    PersonStanding,
    SwatchBook,
} from "lucide-react";
import { map } from "zod";
import { ScrollArea, ScrollBar } from "./components/ui/scroll-area";
import { EventBus } from "./game/EventBus";
import LayersPopover from "./components/editor/float-menu/layers-popover/LayersPopover";
import TilesetPopover from "./components/editor/float-menu/tiles-popover/TilesetPopover";
import BottomFloatMenu from "./components/editor/float-menu/BottomFloatMenu";
import { Button } from "@/components/ui/button";
interface SimulationEditorProps {}
import { JSONTree } from "react-json-tree";
import {
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent,
} from "@/components/ui/collapsible";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { nanoid } from "nanoid";
import { LazyLog } from "@melloware/react-logviewer";

export default function SimulationPlayer() {
    const { mapMeta, startSimulation } = useContext(SimulationContext);
    const [logDict, setLogDict] = useState({ main: [] });

    useEffect(() => {
        const handleSimulationEvent = (data) => {
            setLogDict((prevLogDict) => {
                const newLogDict = { ...prevLogDict };
                if (!newLogDict[data.scope]) {
                    newLogDict[data.scope] = [];
                }

                let messageContent;
                try {
                    if (data.message.eventType) {
                        switch (data.message.eventType) {
                            case "setState":
                                messageContent =
                                    "[4;1m" +
                                    data.message.key +
                                    " - " +
                                    JSON.stringify(data.message.value);
                                // messageContent = (
                                //     <div className="flex flex-row">
                                //         <div>
                                //             {data.message.key} {"<-"}{" "}
                                //         </div>
                                //         <JSONTree
                                //             getItemString={(
                                //                 type,
                                //                 data,
                                //                 itemType,
                                //                 itemString,
                                //                 keyPath
                                //             ) => (
                                //                 <span>
                                //                     asdas
                                //                     {itemType} {itemString}
                                //                 </span>
                                //             )}
                                //             data={data.message.value}
                                //         />
                                //         )
                                //     </div>
                                // );
                                break;
                            case "getState":
                                messageContent = (
                                    <div>
                                        getState({data.message.key},{" "}
                                        <JSONTree data={data.message.value} />)
                                    </div>
                                );
                                break;
                            default:
                                messageContent = <div></div>;
                        }
                    } else {
                        messageContent = <div></div>;
                    }
                } catch (e) {
                    messageContent = <div>{JSON.stringify(data.message)}</div>;
                }

                newLogDict[data.scope].push({
                    eventTime: data.eventTime,
                    message: messageContent,
                });
                return newLogDict;
            });
        };

        EventBus.on("ON_SIMULATION_EVENT", handleSimulationEvent);

        return () => {
            EventBus.off("ON_SIMULATION_EVENT", handleSimulationEvent);
        };
    }, []);

    const phaserRef = useRef<IRefPhaserGame | null>(null);
    return (
        <>
            <Button onClick={() => startSimulation("uFVuQ", 0)}>Start</Button>
            <ResizablePanelGroup
                direction="horizontal"
                className="h-[100vh] w-full"
            >
                {logDict &&
                    Object.entries(logDict).map(([scope, value]) => (
                        <div key={scope}>
                            <ResizablePanel
                                defaultSize={100 / Object.keys(logDict).length}
                                className="p-1 bg-slate-100 border border-slate-500 rounded-sm  "
                            >
                                {scope}

                                <LazyLog
                                    caseInsensitive
                                    enableHotKeys
                                    enableSearch
                                    extraLines={1}
                                    height="520"
                                    loadingComponent={{}}
                                    selectableLines
                                    text={value
                                        .map((obj) => {
                                            return (
                                                obj.eventTime.substring(0, 11) +
                                                " " +
                                                obj.message
                                            );
                                        })
                                        .join("\n")}
                                />
                            </ResizablePanel>
                            <ResizableHandle />
                        </div>
                    ))}
            </ResizablePanelGroup>{" "}
        </>
        // <div className="overflow-hidden min-h-[100vh] max-h-[100vh] bg-slate-700">
        //     <EditorMainMenu />
        //     <div className="px-2 relative">
        //         <span className="bg-slate-50 font-semibold text-sm text-slate-600 p-3 rounded-md">
        //             {mapMeta.name}
        //         </span>

        //         <ContextMenu>
        //             <ContextMenuTrigger>
        //                 <PhaserGame ref={phaserRef} />
        //             </ContextMenuTrigger>
        //             <ContextMenuContent>
        //                 <ContextMenuItem>Profile</ContextMenuItem>
        //                 <ContextMenuItem>Billing</ContextMenuItem>
        //                 <ContextMenuItem>Team</ContextMenuItem>
        //                 <ContextMenuItem>Subscription</ContextMenuItem>
        //             </ContextMenuContent>
        //         </ContextMenu>
        //     </div>

        //     <BottomFloatMenu />
        // </div>
    );
}
