import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "@/lib/createAppSlice";
import type { AppThunk } from "@/store";
import SimulationService from "@/api/Simulation";
import { BaseEntity } from "./baseEntity";

export interface SimulationMetaSliceState extends BaseEntity {
    version: string | null;
    map_uid: string;
    status: "idle" | "loading" | "failed";
}

const initialState: SimulationMetaSliceState = {
    version: null,
    map_uid: "",
    status: "idle",
    deleted: false,
    deleted_at: null,
    created_at: null,
    updated_at: null,
    record_uid: "",
    object_uid: "",
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const simulationMetaSlice = createAppSlice({
    name: "simulationMeta",

    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: (create) => ({
        loadSimulationMeta: create.asyncThunk(
            async ({
                simulation_uid,
                version,
            }: {
                simulation_uid: string;
                version: string | null;
            }) => {
                const response = await SimulationService().getSimulationMeta(
                    simulation_uid,
                    version
                );
                // The value we return becomes the `fulfilled` action payload
                return response;
            },
            {
                pending: (state) => {
                    state.status = "loading";
                },
                fulfilled: (state, action) => {
                    state.status = "idle";
                    state = Object.assign(state, action.payload);
                },
                rejected: (state) => {
                    state.status = "failed";
                },
            }
        ),
    }),
    // You can define your selectors here. These selectors receive the slice
    // state as their first argument.
    selectors: {
        selectSimulationMeta: (simulationMeta) => simulationMeta,
    },
});

// Action creators are generated for each case reducer function.
export const { loadSimulationMeta } = simulationMetaSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectSimulationMeta } = simulationMetaSlice.selectors;

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
