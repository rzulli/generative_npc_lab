import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "@/lib/createAppSlice";
import type { AppThunk } from "@/store";
import SimulationService from "@/api/Simulation";
import { EventBus } from "@/game/EventBus";

export interface MapMetaSliceState {
    map_uid: string;
    map_meta: object | null;
    map_data: object | null;
    status: "idle" | "loading" | "failed";
}

const initialState: MapMetaSliceState = {
    map_uid: "",
    map_meta: null,
    map_data: null,
    status: "idle",
};

let loadMapLock = false;

export const mapMetaSlice = createAppSlice({
    name: "mapMeta",
    initialState,
    reducers: (create) => ({
        loadMap: create.asyncThunk(
            async ({
                map_uid,
                version,
            }: Partial<{
                map_uid: string;
                version: string | null;
            }>) => {
                if (loadMapLock) {
                    throw new Error("Load map is already in progress");
                }
                loadMapLock = true;
                const map = await SimulationService().getMap(map_uid, version);
                return map.data;
            },
            {
                pending: (state) => {
                    state.status = "loading";
                },
                fulfilled: (state, action) => {
                    state.status = "idle";
                    console.log(action.payload);
                    state.map_meta = action.payload;
                    loadMapLock = false;

                    EventBus.emit(
                        "ON_LOAD_MAP_DATA_SUCCESS",
                        action.payload.mapState
                    );
                },
                rejected: (state) => {
                    state.status = "failed";
                    loadMapLock = false;
                },
            }
        ),
    }),
    selectors: {
        selectStatus: (counter) => counter.status,
        selectMapMeta: (mapMeta) => mapMeta.map_meta,
    },
});

export const { loadMap } = mapMetaSlice.actions;
export const { selectStatus, selectMapMeta } = mapMetaSlice.selectors;
