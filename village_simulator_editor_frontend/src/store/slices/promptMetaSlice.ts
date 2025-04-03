import { EventBus } from "@/game/EventBus";
import { createAppSlice } from "@/lib/createAppSlice";
import { nanoid } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { Descendant } from "slate";
import { toast } from "@/hooks/use-toast";
import { object } from "zod";
const preambleInitialValue: Descendant[] = [
    {
        type: "paragraph",
        children: [
            {
                text: "Prompt Header",
            },
        ],
    },
];
const contentInitialValue: Descendant[] = [
    {
        type: "paragraph",
        children: [
            {
                text: "Prompt Content",
            },
        ],
    },
];
const outputInitialValue: Descendant[] = [
    {
        type: "paragraph",
        children: [
            {
                text: "Output format: JSON - {answer}",
            },
        ],
    },
];
const initalPromptState = {
    name: "New Prompt",
    preamble: {
        variables: {},
        text: "Prompt Header",
        structure: [...preambleInitialValue],
        type: "custom",
    },
    content: {
        variables: {},
        text: "Prompt Content",
        structure: [...contentInitialValue],
    },
    output: {
        type: "custom",
        variables: {},
        text: "Output format: JSON - {answer}",
        structure: [...outputInitialValue],
    },
    unsavedChanges: true,
    record_uid: "temp",
    object_uid: "temp",
    version: null,
};

const initialState = {
    prompts: {},
    loading: false,
    error: null,
};

// Async thunks
export const createPromptAsync = createAsyncThunk(
    "promptMeta/createPrompt",
    async (
        promptData: { prompt: typeof initalPromptState; shape_id: string },
        { getState, dispatch }
    ) => {
        try {
            const response = await axios.post(
                "http://localhost:5000/api/v1/prompt/meta/",
                promptData.prompt,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            const record_uid = response.data.record_uid;
            const object_uid = response.data.object_uid;

            dispatch(
                editPromptProperties({
                    shape_id: promptData.shape_id,
                    properties: { record_uid: record_uid },
                })
            );

            return {
                record_uid: record_uid,
                object_uid: object_uid,
                ...promptData,
                unsavedChanges: false,
            }; // Assuming the API returns the new prompt with ID
        } catch (e: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error creating prompt: " + e.message,
            });
            throw e;
        }
    }
);

export const fetchPromptsAsync = createAsyncThunk(
    "promptMeta/fetchPrompts",
    async () => {
        try {
            const response = await axios.get(
                "http://localhost:5000/api/v1/prompt/meta/"
            );
            console.log(response.data);
            return response.data; // Assuming the API returns an array of prompts
        } catch (e: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error fetching prompts: " + e.message,
            });
            throw e;
        }
    }
); 

export const updatePromptAsync = createAsyncThunk(
    "promptMeta/updatePrompt",
    async ({ shape_id, promptData }: { shape_id: string; promptData: any }) => {
        try {
            console.log(shape_id, promptData);
            const response = await axios.put(
                `http://localhost:5000/api/v1/prompt/meta/`,

                promptData,
                { params: { object_uid: promptData.object_uid } }
            );
            return { shape_id, ...promptData, ...response.data };
        } catch (e: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error updating prompt: " + e.message,
            });
            throw e;
        }
    }
);

export const deletePromptAsync = createAsyncThunk(
    "promptMeta/deletePrompt",
    async (id: string) => {
        try {
            await axios.delete(
                `http://localhost:5000/api/v1/prompt/meta/${id}`
            );
            return id; // Return the id to remove from the state
        } catch (e: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error deleting prompt: " + e.message,
            });
            throw e;
        }
    }
);

export const instantiatePromptAsync = createAsyncThunk(
    "promptMeta/instantiatePrompt",
    async ({ shape_id, promptData }: { shape_id: string; promptData: any }) => {
        try {
            console.log(shape_id, promptData);
            const response = await axios.post(
                `http://localhost:5000/api/v1/prompt/instance/`,
                {
                    meta_object_uid: promptData.object_uid,
                    meta_version: promptData.version ?? 0,
                    ...promptData,
                }
            );
            return { shape_id, ...promptData, ...response.data };
        } catch (e: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error updating prompt: " + e.message,
            });
            throw e;
        }
    }
);

export const promptMetaSlice = createAppSlice({
    name: "promptMeta",
    initialState,
    reducers: {
        createNewPrompt: (state, action) => {
            const id = "temp" + nanoid(4);
            state.prompts[id] = {
                ...initalPromptState,
                ...action.payload,
                shape_id: id,
            };
            const res = {
                ...state.prompts[id],
            };
            console.log(
                "createNewPrompt",
                res,
                JSON.parse(JSON.stringify(state.prompts))
            );
            EventBus.emit("addNewPrompt", res);
        },
        editPromptProperties: (state, action) => {
            const { shape_id, properties } = action.payload;
            if (shape_id in state.prompts) {
                state.prompts[shape_id] = {
                    ...state.prompts[shape_id],
                    ...properties,
                    unsavedChanges: true,
                };
            }
        },
        addPrompt: (state, action) => {
            state.prompts[action.payload.record_uid] = action.payload;
        },
        saveNewPrompt: (state, action) => {
            if (action.payload in state.prompts) {
                console.log(state.prompts[action.payload]);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createPromptAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPromptAsync.fulfilled, (state, action) => {
                state.loading = false;
                console.log(action);
                console.log(action.payload.prompt, action.payload);
                state.prompts[action.payload.shape_id] = {
                    ...action.payload.prompt,
                    record_uid: action.payload.record_uid,
                    object_uid: action.payload.object_uid,
                    unsavedChanges: false,
                    version: 0,
                };
            })
            .addCase(createPromptAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to create prompt";
            })
            .addCase(fetchPromptsAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPromptsAsync.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchPromptsAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to fetch prompts";
            })
            .addCase(updatePromptAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePromptAsync.fulfilled, (state, action) => {
                state.loading = false;
                const id = action.payload.shape_id;
                console.log(action.payload, id, state.prompts[id]);
                state.prompts[id] = {
                    ...action.payload,
                    unsavedChanges: false,
                };
            })
            .addCase(updatePromptAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to update prompt";
            })
            .addCase(instantiatePromptAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(instantiatePromptAsync.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(instantiatePromptAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to update prompt";
            })
            .addCase(deletePromptAsync.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deletePromptAsync.fulfilled, (state, action) => {
                state.loading = false;
                delete state.prompts[action.payload];
            })
            .addCase(deletePromptAsync.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || "Failed to delete prompt";
            });
    },
    selectors: {
        selectAllPrompts: (state) => state.prompts,
    },
});

export const {
    createNewPrompt,
    editPromptProperties,
    saveNewPrompt,
    addPrompt,
} = promptMetaSlice.actions;
export const { selectAllPrompts } = promptMetaSlice.selectors;

export default promptMetaSlice.reducer;
