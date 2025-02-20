import { useState } from "react";
import { CollapsibleProps } from "./CollapsibleLog";
import { ShapeHeader } from "./ShapeHeader";
import { AgentTabs } from "./AgentTabs";

export function ShapeComponent({
    scope,
    headerElement,
    lockElement,
    collapseElement,
    shape,
}: CollapsibleProps) {
    const [selectedTab, setSelectedTab] = useState(0);
    const agentId = scope.includes("-")
        ? scope.split(":")[0].split("-")[1]
        : "null";

    return (
        <div
            style={{ pointerEvents: "all" }}
            className={`border rounded-sm w-full h-full bg-slate-300 `}
        >
            <ShapeHeader lockElement={lockElement}>
                {lockElement}{" "}
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        collapseElement();
                    }}
                    className="absolute -top-2 left-[50%] translate-x-[-50%] translate-y-[-50%] bg-slate-600 w-16 h-16 rounded-full flex flex-col items-center justify-center text-slate-50"
                >
                    <img src="assets\simulation\characters\profile\Abigail_Chen.png" />
                    {agentId}
                </div>
            </ShapeHeader>

            <AgentTabs
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
            />
        </div>
    );
}
