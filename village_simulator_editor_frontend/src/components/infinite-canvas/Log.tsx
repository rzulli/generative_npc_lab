import { EventBus } from "@/game/EventBus";
import { useAppSelector } from "@/hooks/hooks";
import { selectSimulationInstance } from "@/store/slices/simulationInstanceSlice";
import { LazyLog } from "@melloware/react-logviewer";
import { useEffect, useState } from "react";

interface LogProps {
    scope: string;
}

export default function Log({ scope }: LogProps) {
    const simulationInstance = useAppSelector(selectSimulationInstance);

    const parseEvents = (events) => {
        return events
            .map((msg) => {
                const subscopePrefix = msg.subscope ? `[${msg.subscope}] ` : "";
                const message = msg.data.message
                    ? msg.data.message
                    : JSON.stringify(msg.data, null, 1);

                let color = "";
                let eventLabel = msg.event.toUpperCase();
                if (msg.event === "message") {
                    switch (msg.data.level) {
                        //debug
                        case 10:
                            color = "\x1b[36m";
                            eventLabel = "DEBUG";
                            break;
                        //info
                        case 20:
                            color = "\x1b[32m";
                            eventLabel = "INFO";
                            break;
                        //warning
                        case 30:
                            color = "\x1b[43m";
                            eventLabel = "WARN";
                            break;
                        // error
                        case 40:
                            color = "\x1b[31m";
                            eventLabel = "ERROR";
                            break;
                        // critical
                        case 50:
                            color = "\x1b[41m";
                            eventLabel = "CRITICAL";
                            break;
                        default:
                            color = "";
                    }
                } else {
                    color = "\x1b[34m";
                }
                let formattedMessage =
                    message.length > 120
                        ? message.substring(0, 120) + "..."
                        : message;
                formattedMessage = formattedMessage
                    .split("\n")
                    .map((line) => `${color}${line}\x1b[0m`)
                    .join("\n");
                return `${msg.eventTime.substring(
                    0,
                    10
                )} ${subscopePrefix} ${color}${eventLabel} - ${formattedMessage}\x1b[0m`;
            })
            .reverse()
            .join("\n");
    };
    const [log, setLog] = useState("");

    useEffect(() => {
        const fn = (data: any) => {
            if (data.scope != scope) {
                return;
            }
            setLog(parseEvents(simulationInstance.events[scope]));
        };
        EventBus.on("socketEvent", fn);
        return () => {
            EventBus.removeListener("socketEvent", fn);
        };
    }, [scope, simulationInstance.events]);
    // const log = useMemo(() => {
    //     if (!simulationInstance) return;
    //     console.log("BBBBBBBBBBBBBBBBBBBBBBBBBBBB");
    //     const events = simulationInstance?.events[scope];
    //     if (!events) {
    //         return "";
    //     }
    //     console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

    //     return parseEvents(events || []);
    // }, [simulationInstance, scope]);
    return (
        <div
            className="h-full"
            onPointerDown={(e) => {
                e.stopPropagation();
            }}
        >
            <LazyLog
                caseInsensitive
                enableHotKeys
                enableSearch
                extraLines={1}
                selectableLines
                text={log}
            />
        </div>
    );
}
