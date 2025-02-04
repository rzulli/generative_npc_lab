import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { socketClient } from "@/App";
import { toast } from "@/hooks/use-toast";
import { EventBus } from "@/game/EventBus";
import {
    fetchMessages,
    simulationStartEvent,
    spawnAgentEvent,
    startEventListeners,
} from "./simulationInstanceSlice";

const initialState = {
    connectionStatus: "",
};

export const connectToSocket = createAsyncThunk(
    "connectToSocket",
    async function (_, { getState, dispatch }) {
        const res = await socketClient.connect();
        startEventListeners(dispatch);

        return res;
    }
);

export const disconnectFromSocket = createAsyncThunk(
    "disconnectFromSocket",
    async function () {
        return await socketClient.disconnect();
    }
);

const socketSlice = createSlice({
    name: "socket",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(connectToSocket.pending, (state) => {
            state.connectionStatus = "connecting";
        });
        builder.addCase(connectToSocket.fulfilled, (state) => {
            state.connectionStatus = "connected";
        });
        builder.addCase(connectToSocket.rejected, (state) => {
            state.connectionStatus = "connection failed";
        });
        builder.addCase(disconnectFromSocket.pending, (state) => {
            state.connectionStatus = "disconnecting";
        });
        builder.addCase(disconnectFromSocket.fulfilled, (state) => {
            state.connectionStatus = "disconnected";
        });
        builder.addCase(disconnectFromSocket.rejected, (state) => {
            state.connectionStatus = "disconnection failed";
        });
    },
});
export default socketSlice;
