import { useState } from "react";
import { CollapsibleProps } from "./CollapsibleLog";
import { ShapeHeader } from "./ShapeHeader";
import { AgentTabs } from "./AgentTabs";

export function AgentLog({
    scope,
    headerElement,
    lockElement,
    collapseFunction,
    shape,
}: CollapsibleProps) {
    const [selectedTab, setSelectedTab] = useState(0);
    const agentId = scope.includes("-")
        ? scope.split(":")[0].split("-")[1]
        : "null";

    return (
        <>
            <ShapeHeader shape={shape}>
                <div className="p-3">
                    {lockElement}{" "}
                    <div
                        onPointerDown={(e) => {
                            e.stopPropagation();
                        }}
                        onClick={(e) => {
                            e.stopPropagation();

                            collapseFunction();
                        }}
                        className="absolute -top-0 left-[50%] translate-x-[-50%] translate-y-[-50%] bg-slate-600 w-16 h-16 rounded-full flex flex-col items-center justify-center text-slate-50 cursor-pointer"
                    >
                        <img
                            src="assets\simulation\characters\profile\Abigail_Chen.png"
                            draggable={false}
                        />
                        {agentId}
                    </div>
                </div>
            </ShapeHeader>

            <AgentTabs
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
            />
        </>
    );
}
