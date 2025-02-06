import { useAppSelector } from "@/hooks/hooks";
import { selectSimulationInstanceMetadata } from "@/store/slices/simulationInstanceSlice";
import { JsonEditor } from "json-edit-react";

export default function AgentState() {
    const simulationInstance = useAppSelector(selectSimulationInstanceMetadata);

    return (
        <div style={{ pointerEvents: "all" }}>
            <JsonEditor
                enableClipboard={true}
                restrictAdd={true}
                restrictDelete={true}
                restrictEdit={true}
                restrictDrag={true}
                data={simulationInstance}
                rootName="Agent Info"
            />
        </div>
    );
}
