import { AgentLog } from "./AgentLog";
import CollapsibleLog from "./CollapsibleLog";

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
                <CollapsibleLog
                    shape={shape}
                    scope={scope}
                    lockElement={lockElement}
                />
            )}
        </div>
    );
}
