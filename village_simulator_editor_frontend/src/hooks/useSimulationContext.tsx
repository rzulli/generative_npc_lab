import React, { createContext, useContext } from "react";
import useSimulation, { emptySimulation } from "../context/SimulationContext";

export const SimulationContext = createContext(null);

// Provedor do contexto
export function SimulationProvider({ children }) {
    const simulationState = useSimulation(emptySimulation);

    return (
        <SimulationContext.Provider value={simulationState}>
            {children}
        </SimulationContext.Provider>
    );
}
export function useSimulationContext() {
    const context = useContext(SimulationContext);
    if (!context) {
        throw new Error(
            "useTileMapContext must be used within a TileMapProvider"
        );
    }
    return context;
}
