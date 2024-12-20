import axios from "axios";
import { useState, useCallback } from "react";
import { toast } from "../hooks/use-toast";
import SimulationService from "../api/Simulation";
import { EventBus } from "@/game/EventBus";

interface SimulationProperties {
    object_uid: string;
    record_uid: string;
    name: string;
    version: string | null;
    map_uid: string;
}
export enum mapState {
    NO_DATA,
}

interface MapChange {
    command: string;
}
interface MapProperties {
    object_uid: string;
    record_uid: string;
    name: string;
    version: string | null;
    mapState: Object | mapState;
    updateStack: [MapChange] | [];
}

export const emptyMap: MapProperties = {
    object_uid: "",
    name: "Empty Map",
    version: null,
    mapState: mapState.NO_DATA,
    updateStack: [],
};

export const emptySimulation: SimulationProperties = {
    object_uid: "",
    version: null,
    map_uid: "",
    name: "New Simulation",
};

function useSimulation(initialSimulation: SimulationProperties | null) {
    const [simulationMeta, setSimulationMeta] = useState(initialSimulation);
    const [mapMeta, setMapMeta] = useState(emptyMap);
    const [changes, setChanges] = useState({});

    // const newSimulation = useCallback(() => {
    //     setSimulationMeta(emptySimulation);
    //     setMapMeta(emptyMap);
    // }, []);

    const listMapMeta = useCallback(() => {
        return SimulationService().listMapMeta();
    }, []);

    const listSimulationMeta = useCallback(() => {
        return SimulationService().listSimulationMeta();
    }, []);

    const loadSimulationMeta = useCallback(
        (simulation_uid: string, version = null) => {
            return SimulationService()
                .getSimulationMeta(simulation_uid, version)
                .then((response) => {
                    setSimulationMeta(response);

                    loadMap(response.map_uid);
                    setChanges({});
                    return response;
                });
        },
        [simulationMeta.map_uid]
    );

    const loadMap = useCallback(
        (map_uid: string, version = null) => {
            SimulationService()
                .getMap(map_uid, version)
                .then((response) => {
                    console.log(response.data);
                    setMapMeta(response.data);
                    EventBus.emit(
                        "ON_LOAD_MAP_DATA_SUCCESS",
                        response.data.mapState
                    );
                });
            setChanges({});
        },
        [simulationMeta.map_uid]
    );

    return {
        simulationMeta,
        mapMeta,
        changes,
        loadMap,
        listMapMeta,
        listSimulationMeta,
        loadSimulationMeta,
    };
}

export default useSimulation;
