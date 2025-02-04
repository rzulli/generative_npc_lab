import { useState, useEffect, useContext } from "react";
import { EventBus } from "./game/EventBus";
import CollapsibleLog from "./components/infinite-canvas/CollapsibleLog";
import { SimulationContext } from "./hooks/useSimulationContext";

export default function SimulationLog({ editor }) {
    const { mapMeta, startSimulation, simulationState, stopSimulation } =
        useContext(SimulationContext);
    const [logDict, setLogDict] = useState({});

    useEffect(() => {
        if (simulationState?.socket && editor) {
            const handleSimulationEvent = (event: any) => {
                const { data } = event;
                if (data.scope) {
                    setLogDict((prevLogDict) => {
                        const newLogDict = addToLog(prevLogDict, data);
                        const [scopeGroup, scopeInstance] =
                            data.scope.split(":");
                        if (
                            !prevLogDict[scopeGroup] ||
                            prevLogDict[scopeGroup].findIndex(
                                (item: { scope: string; messages: any[] }) =>
                                    item.scope === scopeInstance
                            ) === -1
                        ) {
                            editor.createShape({
                                type: "my-interactive-shape",
                                x: Math.random() * 500,
                                y: Math.random() * 500,
                                scope: scopeInstance,
                                logInstances: () => logDict[scopeGroup],
                            });
                        }
                        return newLogDict;
                    });
                }
            };

            simulationState.socket.on("message", handleSimulationEvent);

            return () => {
                simulationState.socket.off("message", handleSimulationEvent);
            };
        }
    }, [simulationState?.socket]);

    return <></>;
}

function addToLog(
    prevLogDict: {},
    data: { scope: string; message: any; level: number; eventTime: string }
) {
    const newLogDict = { ...prevLogDict };
    const [scopeGroup, scopeInstance] = data.scope.split(":");
    if (!newLogDict[scopeGroup]) {
        newLogDict[scopeGroup] = [];
    }
    const scopeIndex = newLogDict[scopeGroup].findIndex(
        (item: { scope: string; messages: any[] }) =>
            item.scope === scopeInstance
    );
    if (scopeIndex === -1) {
        newLogDict[scopeGroup].push({
            scope: scopeInstance,
            messages: [],
        });
    }
    let messageContent;
    console.log(data);
    if (typeof data.message === "object" && data.message !== null) {
        const { eventType, key, value } = data.message;
        switch (eventType) {
            case "setState":
                messageContent = `🔑 ${key} ➡️ ${value}`;
                break;
            case "getState":
                messageContent = `🔍 ${key} ➡️ ${value}`;
                break;
            default:
                messageContent = JSON.stringify(data.message);
        }
    } else {
        messageContent = data.message;
    }
    switch (data.level) {
        case 10: // Debug
            messageContent = `[34m${messageContent}[0m`; // Blue
            break;
        case 20: // Info
            messageContent = `[32m${messageContent}[0m`; // Green
            break;
        case 30: // Warning
            messageContent = `[33m${messageContent}[0m`; // Yellow
            break;
        case 40: // Error
            messageContent = `[31m${messageContent}[0m`; // Red
            break;
        case 50: // Critical
            messageContent = `[41m${messageContent}[0m`; // Red background
            break;
        default:
            break;
    }

    const group = newLogDict[scopeGroup].find(
        (item: { scope: string; messages: any[] }) =>
            item.scope === scopeInstance
    );
    if (group) {
        group.messages.push({
            eventTime: data.eventTime,
            message: messageContent,
        });
    }
    return newLogDict;
}
