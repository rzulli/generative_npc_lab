import {
    CollapsibleContent,
    CollapsibleTrigger,
    Collapsible as UICollapsible,
} from "@/components/ui/collapsible";
import { LazyLog } from "@melloware/react-logviewer";
import { TabsContent, TabsTrigger } from "@radix-ui/react-tabs";
import { Maximize2 } from "lucide-react";
import { useState } from "react";
import Draggable from "react-draggable"; // The default
import { Tabs, TabsList } from "@/components/ui/tabs";
interface SimulationEditorProps {}

import "tldraw/tldraw.css";
import {
    selectSimulationInstance,
    simulationInstanceSlice,
} from "../../store/slices/simulationInstanceSlice";
/* eslint-disable react-hooks/rules-of-hooks */

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "tldraw/tldraw.css";
import { useSelector } from "react-redux";
import { useAppSelector } from "@/hooks/hooks";
import { useMemo } from "react";

interface CollapsibleProps {
    scope: string;
    eventLogger: boolean;
}

export default function CollapsibleLog({
    scope,
    eventLogger,
}: CollapsibleProps) {
    const simulationInstance = useAppSelector(selectSimulationInstance);

    const parseEvents = (events) => {
        return events
            .map((msg) => {
                const subscopePrefix = msg.subscope ? `[${msg.subscope}] ` : "";
                const message = msg.data.message
                    ? msg.data.message
                    : JSON.stringify(msg.data, null, 2);
                const formattedMessage =
                    message.length > 500
                        ? message.substring(0, 500) + "..."
                        : message;
                const color =
                    msg.level === 10
                        ? "\x1b[31m"
                        : msg.level === 20
                        ? "\x1b[33m"
                        : "\x1b[0m";
                return `${color}${msg.event.toUpperCase()} ${msg.eventTime.substring(
                    0,
                    10
                )} ${subscopePrefix}${formattedMessage}\x1b[0m`;
            })
            .reverse()
            .join("\n");
    };
    const log = useMemo(() => {
        return parseEvents(simulationInstance?.events[scope]);
    }, [simulationInstance.events, scope]);

    return (
        <div
            className={`border rounded-sm w-full h-full ${
                eventLogger ? "bg-blue-100" : "bg-white"
            }`}
        >
            {/* <UICollapsible open={open} onOpenChange={setOpen}>
                <CollapsibleTrigger className="flex justify-between w-full p-2"> */}
            <div>
                {scope}
                {eventLogger && <> events</>}
            </div>{" "}
            {/* </CollapsibleTrigger>
                <CollapsibleContent> */}
            {/* <Tabs defaultValue="orchestrator">
                            <TabsList className=" w-full flex items-center gap-5">
                                {simulationInstance?.logs[scope].messages.map(
                                    (instance, index) => (
                                        <TabsTrigger
                                            className="bg-slate-300 p-1 rounded-md"
                                            value={instance.scope}
                                            key={index}
                                        >
                                            {instance.scope}
                                        </TabsTrigger>
                                    )
                                )}
                            </TabsList> */}
            {/* {simulationInstance?.logs[scope].map(
                            (instance, index) => ( */}
            <div className="h-full p-3">
                <LazyLog
                    caseInsensitive
                    enableHotKeys
                    enableSearch
                    extraLines={1}
                    selectableLines
                    text={log}
                />
            </div>
            {/* )
                        )} */}
            {/* </Tabs> */}
            {/* </CollapsibleContent>
            </UICollapsible> */}
        </div>
    );
}
