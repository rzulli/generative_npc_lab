import SimulationService from "@/api/Simulation";
import { EventBus } from "@/game/EventBus";
import { startSimulation } from "@/store/slices/simulationInstanceSlice";
import { createListenerMiddleware } from "@reduxjs/toolkit";

const listenerMiddleware = createListenerMiddleware();
listenerMiddleware.startListening({
    actionCreator: startSimulation,
    effect: async (action, listenerApi) => {
        listenerApi.cancelActiveListeners();

        listenerApi.dispatch(
            updateSimulationInstance({ status: "connecting" })
        );

        const socket = SimulationService().getSimulationInstanceSocketIO(
            action.payload.simulation_uid,
            action.payload.version,
            (data: any) => EventBus.emit("ON_SIMULATION_EVENT", data)
        );

        socket.on("connected", () => {});
    },
});
export const createMySocketMiddleware = () => {
    let socket;
    const timeout = 5000;
    return (storeAPI) => (next) => (action) => {
        console.log(storeAPI, action);
        switch (action.type) {
            case "LOGIN":
                socket = SimulationService().getSimulationInstanceSocketIO(
                    action.payload.simulation_uid,
                    action.payload.version,
                    (data: any) => EventBus.emit("ON_SIMULATION_EVENT", data)
                );

                socket.on("connected", () => {});
                break;

            case "SEND_WEBSOCKET_MESSAGE": {
                socket.send(action.payload);
                return;
            }
        }

        return next(action);
    };
};
