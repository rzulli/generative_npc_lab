import { useAppSelector } from "@/hooks/hooks";
import {
    selectSimulationAgents,
    selectSimulationInstance,
    selectSimulationInstanceMetadata,
} from "@/store/slices/simulationInstanceSlice";
import { JsonEditor } from "json-edit-react";

export default function SimulationState({ scope }) {
    const simulation = useAppSelector(selectSimulationInstanceMetadata);

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
                data={simulation}
                rootName="Simulation Metadata"
            />
        </div>
    );
}
