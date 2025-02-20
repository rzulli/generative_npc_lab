import { createAppSlice } from "@/lib/createAppSlice";
import type { AppThunk } from "@/store";
import SimulationService from "@/api/Simulation";
import { BaseEntity } from "./baseEntity";
import { EventBus } from "@/game/EventBus";
import {
    createAsyncThunk,
    PayloadAction,
    createSelector,
} from "@reduxjs/toolkit";
import { socketClient } from "@/App";
import { State } from "../../lib/stateMachine/StateMachine";
interface LogMessage {
    message: string;
    eventTime: Date;
    scope: string;
    level: string;
}

interface LogEvent {
    event: string;
    eventTime: Date;
    data: any;
    scope: string;
}
async function decompressBlob(blob: ArrayBuffer) {
    const uint8Array = new Uint8Array(blob);
    const ds = new DecompressionStream("gzip");
    const decompressedStream = new Response(uint8Array).body.pipeThrough(ds);
    const result = await new Response(decompressedStream).text();

    return result;
}

export const buildEventThunk = (eventName: string) => {
    return createAsyncThunk(
        "socketEvent" + eventName,
        async function (_, { getState, dispatch }) {
            console.info("Creating event thunk for ", eventName);

            return await socketClient.on(eventName, (data) => {
                try {
                    const startTime = performance.now();
                    decompressBlob(data).then((data) => {
                        const parsedMessages = JSON.parse(data);
                        // console.log(parsedMessages?.data?.state);
                        const payload = {
                            scope: parsedMessages.scope,
                            event: eventName,
                            data: parsedMessages.data,
                            eventTime: parsedMessages.eventTime,
                        };
                        dispatch({
                            type: "simulationInstance/socketEvent",
                            payload: payload,
                        });

                        dispatch({
                            type: "simulationInstance/" + eventName,
                            payload: payload,
                        });
                        const endTime = performance.now();
                        console.debug(
                            `[EVENT] - simulationInstance/${eventName} took ${Math.trunc(
                                endTime - startTime
                            )} ms`,
                            payload
                        );
                    });
                } catch (error) {
                    console.error(
                        "Error parsing JSON data for event:",
                        eventName,
                        "Error:",
                        error,
                        "Data received:",
                        data
                    );
                }
            });
        }
    );
};

const events = [
    "simulation_start",
    "simulation_end",
    "simulation_dead",
    "map_state",
    "map_metadata",
    "reverse_lookup",
    "spawn_agent",
    "agent_update",
    "message",
    "heartbeat",
    "set_state",
    "get_state",
    "step_ended",
    "step_started",
];

export const startEventListeners = (dispatch) => {
    const eventThunks = events.map(buildEventThunk);
    console.log(eventThunks);
    eventThunks.forEach((eventThunk) => {
        console.debug("Starting event listener ", eventThunk);
        dispatch(eventThunk());
    });
};

export interface SimulationInstanceSliceState {
    version: string | null;
    simulation_uid: string;
    status: null | "idle" | "loading" | "failed";
    continous: boolean;
    // logs: { [scope: string]: LogMessage[] };
    events: { [scope: string]: LogEvent[] };
    map_metadata: {};
    reverse_lookup: {};
    map_state: {};
    agents: {};
}

const initialState: SimulationInstanceSliceState = {
    version: null,
    simulation_uid: "",
    status: null,
    // logs: {},
    continous: false,
    events: {},
    map_metadata: {},
    reverse_lookup: {},
    map_state: {},
    agents: {},
};

export const spawnSimulation = createAsyncThunk(
    "spawnSimulation",
    async function (_, { getState, dispatch }) {
        return await socketClient.emit("spawn_simulation", null);
    }
);
export const stopSimulation = createAsyncThunk(
    "stopSimulation",
    async function (_, { getState, dispatch }) {
        return await socketClient.emit("stop_simulation", null);
    }
);

export const stepSimulation = createAsyncThunk(
    "stepSimulation",
    async function (_, { getState, dispatch }) {
        console.log("step_simulation");
        return await socketClient.emit("step_simulation", null);
    }
);

export const playSimulation = createAsyncThunk(
    "playSimulation",
    async function (_, { getState, dispatch }) {
        dispatch(setContinous(true));
        socketClient.emit("step_simulation", null);
        EventBus.on("step_ended", () => {
            console.log("step_ended, calling new step_simulation");
            socketClient.emit("step_simulation", null);
        });
    }
);

export const socketEvent = createAsyncThunk(
    "playSimulation",
    async function (_, { getState, dispatch }) {
        dispatch(setContinous(true));
        socketClient.emit("step_simulation", null);
        EventBus.on("step_ended", () => {
            console.log("step_ended, calling new step_simulation");
            socketClient.emit("step_simulation", null);
        });
    }
);

// If you are not using async thunks you can use the standalone `createSlice`.
export const simulationInstanceSlice = createAppSlice({
    name: "simulationInstance",

    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        reverse_lookup: (state, action) => {
            state.reverse_lookup = action.payload.data;
        },
        map_metadata: (state, action) => {
            state.map_metadata = action.payload.data;
        },
        map_state: (state, action) => {
            state.map_state = action.payload.data;
        },
        setContinous: (state, action) => {
            state.continous = action.payload;
        },
        pauseSimulation: (state, action) => {
            state.continous = false;
            EventBus.removeAllListeners("step_ended");
        },
        spawn_agent: (state, action) => {
            state.agents = {
                ...state.agents,
                [action.payload.scope]: action.payload.data,
            };
        },
        update_agent: (state, action) => {
            state.agents = {
                ...state.agents,
                [action.payload.scope]: action.payload.data,
            };
        },

        socketEvent: (state, action) => {
            console.log("SOCKET_EVENT REDUCER ", state, action);
            const event = action.payload.event;

            let data = action.payload.data;
            //TODO - make this better and more generic
            if (event == "agent_update") {
                Object.entries(data.state).map(([k, v]) => {
                    data.state[k] = JSON.parse(v);
                });
            }
            const [scope, subscope] = action.payload.scope.split(":");

            const eventTime = action.payload.eventTime;
            const eventData = {
                event,
                data,
                scope,
                subscope: subscope || null,
                eventTime,
            };

            if (!state.events[scope]) {
                state.events[scope] = [];
            }
            state.events[scope].push(eventData);
            EventBus.emit("socketEvent", eventData);
            EventBus.emit(event, eventData);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(spawnSimulation.pending, (state) => {
            state.status = "loading";
        });
        builder.addCase(spawnSimulation.fulfilled, (state) => {
            state.status = "idle";
        });
        builder.addCase(spawnSimulation.rejected, (state) => {
            state.status = "failed";
        });
        builder.addCase(stepSimulation.pending, (state) => {
            state.status = "loading";
        });
        builder.addCase(stepSimulation.fulfilled, (state) => {
            state.status = "idle";
        });
        builder.addCase(stepSimulation.rejected, (state) => {
            state.status = "failed";
        });
    },

    selectors: {
        selectSimulationInstance: (simulationInstance) => simulationInstance,
        selectSimulationAgents: (simulationInstance) =>
            simulationInstance.agents,
        selectSimulationInstanceMetadata: createSelector(
            (simulationInstance: SimulationInstanceSliceState) =>
                simulationInstance.version,
            (simulationInstance: SimulationInstanceSliceState) =>
                simulationInstance.continous,
            (simulationInstance: SimulationInstanceSliceState) =>
                simulationInstance.simulation_uid,
            (simulationInstance: SimulationInstanceSliceState) =>
                simulationInstance.status,
            (version, continuous, simulation_uid, status) => ({
                version,
                continuous,
                simulation_uid,
                status,
            })
        ),

        selectMapMetadata: (simulationInstance) =>
            simulationInstance.map_metadata,
        selectReverseLookup: (simulationInstance) =>
            simulationInstance.reverse_lookup,
    },
});

// Action creators are generated for each case reducer function.
export const { setContinous, pauseSimulation } =
    simulationInstanceSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const {
    selectSimulationInstance,
    selectSimulationInstanceMetadata,
    selectSimulationAgents,
} = simulationInstanceSlice.selectors;

// // We can also write thunks by hand, which may contain both sync and async logic.
// // Here's an example of conditionally dispatching actions based on current state.
// export const incrementIfOdd =
//     (amount: number): AppThunk =>
//     (dispatch, getState) => {
//         const currentValue = selectCount(getState());

//         if (currentValue % 2 === 1 || currentValue % 2 === -1) {
//             dispatch(incrementByAmount(amount));
//         }
//     };
