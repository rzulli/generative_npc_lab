import { useAppSelector } from "@/hooks/hooks";
import {
    selectSimulationAgents,
    selectSimulationInstance,
    selectSimulationInstanceMetadata,
} from "@/store/slices/simulationInstanceSlice";
import { JsonEditor } from "json-edit-react";

export default function AgentState({ scope }) {
    const agents = useAppSelector(selectSimulationAgents);
    const agentExists = scope in agents;
    if (!agentExists) {
        return <div>Agent {scope} does not exist</div>;
    }
    return (
        <div
            style={{ pointerEvents: "all" }}
            className="h-full overflow-y-scroll"
        >
            <JsonEditor
                enableClipboard={true}
                restrictAdd={true}
                restrictDelete={true}
                restrictEdit={true}
                restrictDrag={true}
                data={agents[scope]}
                rootName="Agent Info"
            />
        </div>
    );
}
