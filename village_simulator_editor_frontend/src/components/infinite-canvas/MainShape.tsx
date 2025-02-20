import { useState } from "react";
import { AgentLog } from "./AgentLog";
import CollapsibleLog from "./CollapsibleLog";
import { ShapeHeader } from "./ShapeHeader";
import { SimulationTabs } from "./SimulationTabs";

interface MainShapeProps {
    scope: string;
    lockElement: React.Component;
    collapseFunction: () => void;
    shapeType: "eventLog" | "simulationShape" | "agentShape";
}

export function MainShape({
    scope,
    lockElement,
    collapseFunction,
    shapeType,
    shape,
}: MainShapeProps) {
    return (
        <div
            style={{ pointerEvents: "all" }}
            className={`border rounded-sm w-full h-full bg-slate-300 overflow-hidden`}
        >
            {shapeType === "agentShape" && (
                <AgentLog
                    scope={scope}
                    shape={shape}
                    lockElement={lockElement}
                    collapseFunction={collapseFunction}
                />
            )}
            {shapeType === "eventLog" && (
                <CollapsibleLog
                    shape={shape}
                    scope={scope}
                    lockElement={lockElement}
                />
            )}
            {shapeType === "simulationShape" && (
                <SimulationLog
                    shape={shape}
                    scope={scope}
                    lockElement={lockElement}
                />
            )}
        </div>
    );
}

function SimulationLog({ shape, lockElement, scope }) {
    const [selectedTab, setSelectedTab] = useState(0);
    return (
        <div className="h-full p-2">
            <ShapeHeader shape={shape}>
                {" "}
                <div className="p-3 flex gap-5">
                    {lockElement}
                    <div>{scope} </div>
                </div>
            </ShapeHeader>
            <SimulationTabs
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
            />
        </div>
    );
}
