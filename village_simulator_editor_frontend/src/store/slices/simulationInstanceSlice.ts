import { createAppSlice } from "@/lib/createAppSlice";
import type { AppThunk } from "@/store";
import SimulationService from "@/api/Simulation";
import { BaseEntity } from "./baseEntity";
import { EventBus } from "@/game/EventBus";
import { createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { socketClient } from "@/App";
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
export const buildEventThunk = (eventName: string) => {
    return createAsyncThunk(
        "socketEvent" + eventName,
        async function (_, { getState, dispatch }) {
            console.info("Creating event thunk for ", eventName);

            return await socketClient.on(eventName, (data) => {
                try {
                    // const jsonString =
                    //     typeof data === "string" ? data : data.data;
                    // console.log(jsonString);
                    const parsedMessages = JSON.parse(data);
                    //console.log(parsedMessages);

                    // Object.entries(parsedMessages).map(([key, v]) => {
                    //     console.log(key);
                    //     if (typeof parsedMessages[key] === "string") {
                    //         try {
                    //             const parsedData = JSON.parse(
                    //                 parsedMessages[key]
                    //             );
                    //             parsedMessages[key] = parsedData;
                    //         } catch (e) {
                    //             // If parsing fails, keep the original string
                    //             console.warn(`Failed to parse key ${key}:`, e);
                    //         }
                    //     }
                    // });
                    //console.log(parsedMessages);
                    dispatch({
                        type: "simulationInstance/socketEvent",
                        payload: {
                            scope: parsedMessages.scope,
                            event: eventName,
                            data: parsedMessages.data,
                            eventTime: parsedMessages.eventTime,
                        },
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
        console.log("Starting event listener ", eventThunk);
        dispatch(eventThunk());
    });
};

// export const fetchMessages = createAsyncThunk(
//     "fetchMessages",
//     async function (_, { getState, dispatch }) {
//         // console.log("state ", getState());
//         return await socketClient.on("message", (receivedMessages) => {
//             const jsonString = receivedMessages.data.replace(/'/g, '"');
//             console.log(jsonString);
//             const parsedMessages = JSON.parse(jsonString);
//             console.log(parsedMessages);
//             const scope = parsedMessages.scope;

//             dispatch({
//                 type: "simulationInstance/message",
//                 payload: { scope, message: parsedMessages },
//             });
//         });
//     }
// );
export interface SimulationInstanceSliceState {
    version: string | null;
    simulation_uid: string;
    status: null | "idle" | "loading" | "failed";
    continous: boolean;
    // logs: { [scope: string]: LogMessage[] };
    events: { [scope: string]: LogEvent[] };
}

const initialState: SimulationInstanceSliceState = {
    version: null,
    simulation_uid: "",
    status: null,
    // logs: {},
    continous: false,
    events: {},
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
// If you are not using async thunks you can use the standalone `createSlice`.
export const simulationInstanceSlice = createAppSlice({
    name: "simulationInstance",

    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        // message: (state, action) => {
        //     console.log("MESSAGE REDUCER ", state, action);

        //     const [scope, subscope] = action.payload.scope.split(":");
        //     if (!state.logs[scope]) {
        //         state.logs[scope] = [];
        //     }

        //     state.logs[scope].push(action.payload.message);
        // },
        setContinous: (state, action) => {
            state.continous = action.payload;
        },
        pauseSimulation: (state, action) => {
            state.continous = false;
            EventBus.removeAllListeners("step_ended");
        },
        socketEvent: (state, action) => {
            // console.log("SOCKET_EVENT REDUCER ", state, action);
            const event = action.payload.event;
            const data = action.payload.data.data || action.payload.data;
            const [scope, subscope] = action.payload.scope.split(":");
            if (!state.events[scope]) {
                state.events[scope] = [];
            }
            const eventTime = action.payload.eventTime;

            state.events[scope].push({
                eventTime,
                event,
                data,
                scope,
                subscope: subscope || null,
            });
            EventBus.emit("socketEvent", {});
            const eventData = { event, data, scope, subscope, eventTime };
            //console.log(event, eventData);
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
    // You can define your selectors here. These selectors receive the slice
    // state as their first argument.
    selectors: {
        selectSimulationInstance: (simulationInstance) => simulationInstance,
    },
});

// Action creators are generated for each case reducer function.
export const { setContinous, pauseSimulation } =
    simulationInstanceSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectSimulationInstance } = simulationInstanceSlice.selectors;

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
