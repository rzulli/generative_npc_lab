import { T } from "@tldraw/validate";
import { BaseBoxShapeUtil, RecordProps, TLBaseShape } from "tldraw";

type IPromptShape = TLBaseShape<
    "prompt-editor",
    {
        w: number;
        h: number;
        id: string;
    }
>;

import { useAppSelector } from "@/hooks/hooks";
import {
    createPromptAsync,
    instantiatePromptAsync,
    selectAllPrompts,
    selectPromptByKey,
    updatePromptAsync,
} from "@/store/slices/promptMetaSlice";
import { isKeyHotkey } from "is-hotkey";
import {
    CircleDashed,
    Ellipsis,
    FolderOpenIcon,
    Play,
    ReceiptText,
    SaveIcon,
    SquareChevronLeft,
    SquareChevronRight,
    TextSelect,
    VariableIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    createEditor,
    Descendant,
    Editor,
    Range,
    Element as SlateElement,
    Transforms,
} from "slate";
import { withHistory } from "slate-history";
import { Editable, Slate, useSelected, useSlate, withReact } from "slate-react";
import { Input } from "../ui/input";
import { ShapeHeader } from "./ShapeHeader";
import { LockElement } from "./SimulationLogShapeUtil";
import promptMetaSlice from "../../store/slices/promptMetaSlice";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef } from "react";

const SHORTCUTS = {
    "*": "list-item",
};
const initialValue: Descendant[] = [
    {
        type: "paragraph",
        children: [
            {
                text: "This is a new prompt",
            },
        ],
    },
];

const InlineChromiumBugfix = () => (
    <span contentEditable={false} className="text-[0px]">
        {String.fromCodePoint(160) /* Non-breaking space */}
    </span>
);
const withInlines = (editor) => {
    const {
        insertData,
        insertText,
        isInline,
        isElementReadOnly,
        isSelectable,
    } = editor;
    editor.isInline = (element) =>
        ["link", "button", "badge"].includes(element.type) || isInline(element);

    return editor;
};
const Element = (props) => {
    const { attributes, children, element } = props;
    switch (element.type) {
        // case "link":
        //     return <LinkComponent {...props} />;
        // case "button":
        //     return <EditableButtonComponent {...props} />;
        case "badge":
            return <BadgeComponent {...props} />;
        default:
            return <p {...attributes}>{children}</p>;
    }
};
const BadgeComponent = ({ attributes, children, element }) => {
    const selected = useSelected();
    console.log(selected);
    return (
        <span
            {...attributes}
            className={`bg-green-500 text-white p-1 rounded text-sm ${
                selected ? "border-1" : ""
            }`}
            data-playwright-selected={selected}
        >
            <InlineChromiumBugfix />
            {children}

            <InlineChromiumBugfix />
        </span>
    );
};
const insertButton = (editor) => {
    if (editor.selection) {
        wrapButton(editor);
    }
};
const isButtonActive = (editor) => {
    const [button] = Editor.nodes(editor, {
        match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            n.type === "badge",
    });
    return !!button;
};
const unwrapButton = (editor) => {
    Transforms.unwrapNodes(editor, {
        match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            n.type === "badge",
    });
};
const ToggleEditableButtonButton = () => {
    const editor = useSlate();
    return (
        <div
            onMouseDown={(event) => {
                event.preventDefault();
                if (isButtonActive(editor)) {
                    unwrapButton(editor);
                } else {
                    insertButton(editor);
                }
            }}
            className="hover:bg-slate-100/50 rounded-sm cursor-pointer p-1"
        >
            <VariableIcon className="stroke-slate-800" />
        </div>
    );
};
const wrapButton = (editor) => {
    if (isButtonActive(editor)) {
        unwrapButton(editor);
    }
    const { selection } = editor;
    const isCollapsed = selection && Range.isCollapsed(selection);

    const badge = {
        type: "badge",
        children: isCollapsed ? [{ text: "@INPUT" }] : [],
    };
    if (isCollapsed) {
        Transforms.insertNodes(editor, badge);
    } else {
        console.log(selection);
        Transforms.wrapNodes(editor, badge, { split: true });
        Transforms.collapse(editor, { edge: "end" });
    }
};

function PromptNameInput({ prompt, shape }) {
    const dispatch = useDispatch();
    return (
        <div className="h-10 p-2 " onPointerDown={(e) => e.stopPropagation()}>
            <Input
                placeholder="Prompt Name"
                value={prompt.name}
                onChange={(e) => {
                    dispatch({
                        type: "promptMeta/editPromptProperties",
                        payload: {
                            shape_id: shape.props.id,
                            properties: { name: e.target.value },
                        },
                    });
                }}
            />
        </div>
    );
}
function VariableInputsToggle({ shape, prompt, isCollapsed, setIsCollapsed }) {
    return (
        <div
            className="cursor-pointer"
            onClick={() => setIsCollapsed(!isCollapsed)}
        >
            {isCollapsed ? (
                <SquareChevronRight className="mx-auto stroke-slate-700" />
            ) : (
                <SquareChevronLeft className="mx-auto stroke-slate-700" />
            )}
        </div>
    );
}
function VariableInputs({ shape, prompt }) {
    const dispatch = useDispatch();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div
            className={`min-w-[20%] flex flex-col items-center justify-between p-2 overflow-hidden transition-all duration-300 ease-spring ${
                isCollapsed ? "p-0 m-0 min-w-0 w-[2rem]" : "w-[20%]"
            }`}
        >
            {" "}
            <div className="flex items-center">
                <VariableInputsToggle
                    shape={shape}
                    prompt={prompt}
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                />
                {!isCollapsed && <div className="font-semibold">Variables</div>}
            </div>
            {!isCollapsed && (
                <div className="flex flex-col flex-1">
                    {["preamble", "content", "output"].map((key) => (
                        <div key={key}>
                            <div className="capitalize py-3">{key}</div>
                            {prompt &&
                            Object.keys(prompt[key]?.variables || {}).length ===
                                0 ? (
                                <div className="font-thin  text-xs">---</div>
                            ) : null}
                            {prompt &&
                                Object.entries(
                                    prompt[key]?.variables || {}
                                ).map(([k, v]) => {
                                    return (
                                        <div key={k}>
                                            {k}:
                                            <Input
                                                value={v}
                                                onChange={(e) => {
                                                    dispatch({
                                                        type: "promptMeta/editPromptProperties",
                                                        payload: {
                                                            shape_id:
                                                                shape.props.id,
                                                            properties: {
                                                                [key]: {
                                                                    ...prompt[
                                                                        key
                                                                    ],
                                                                    variables: {
                                                                        ...prompt[
                                                                            key
                                                                        ]
                                                                            .variables,
                                                                        [k]: e
                                                                            .target
                                                                            .value,
                                                                    },
                                                                },
                                                            },
                                                        },
                                                    });
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function SlateMenu() {
    return (
        <div className="text-sm flex ">
            <ToggleEditableButtonButton />
        </div>
    );
}

function SubPromptContentSlateEditor({ subprompt, updateVariables }) {
    const editor = useMemo(
        () => withInlines(withHistory(withReact(createEditor()))),
        []
    );
    const onKeyDown = (event) => {
        const { selection } = editor;
        if (selection && Range.isCollapsed(selection)) {
            const { nativeEvent } = event;
            if (isKeyHotkey("left", nativeEvent)) {
                event.preventDefault();
                Transforms.move(editor, { unit: "offset", reverse: true });
                return;
            }
            if (isKeyHotkey("right", nativeEvent)) {
                event.preventDefault();
                Transforms.move(editor, { unit: "offset" });
                return;
            }
        }
    };
    return (
        <Slate
            editor={editor}
            initialValue={
                subprompt.structure?.length > 0
                    ? subprompt.structure
                    : initialValue
            }
            onChange={(result) => updateVariables(result)}
        >
            <SlateMenu />
            <div className="mt-2 h-full">
                <Editable
                    className="p-1 rounded-sm bg-slate-200 max-h-[85%] min-h-[20%] overflow-y-scroll"
                    renderElement={(props) => <Element {...props} />}
                    placeholder=""
                    onKeyDown={onKeyDown}
                />
            </div>
        </Slate>
    );
}

function PromptEditor({ isLocked, setIsLocked, shape }) {
    const dispatch = useDispatch();

    const prompt = useSelector(
        (state: any) => state.promptMeta.prompts?.[shape.props.id] ?? null
    );

    const state = useSelector((state) => state.promptMeta.prompts);
    console.log(Object.entries(state), shape, prompt);

    const updateVariables = (subprompt) => (editorChildren) => {
        console.log(subprompt);
        console.log(prompt);
        const types = editorChildren.reduce((acc, node) => {
            if (SlateElement.isElement(node)) {
                node.children.forEach((value) => {
                    if (value.type === "badge") {
                        const key = value.children
                            .map((item) => item.text)
                            .join("");
                        acc[key] = "value";
                    }
                });
            }
            return acc;
        }, {});
        dispatch({
            type: "promptMeta/editPromptProperties",
            payload: {
                shape_id: shape.props.id,
                properties: {
                    [subprompt]: {
                        variables: types,
                        structure: editorChildren,
                        text: editorChildren
                            .map((node) => {
                                function parseNode(node): string {
                                    if (SlateElement.isElement(node)) {
                                        if (node.type === "paragraph") {
                                            return node.children
                                                .map((child) =>
                                                    parseNode(child)
                                                )
                                                .join("");
                                        } else if (node.type === "badge") {
                                            return `{${node.children
                                                .map((child) => child.text)
                                                .join("")}}`;
                                        } else {
                                            return node.children
                                                .map((child) =>
                                                    parseNode(child)
                                                )
                                                .join("");
                                        }
                                    } else {
                                        return node.text;
                                    }
                                }
                                return parseNode(node);
                            })
                            .join(""),
                    },
                },
            },
        });
    };

    const savePrompt = () => {
        if (!state.isLoading && prompt?.unsavedChanges) {
            if (prompt.object_uid.includes("temp")) {
                dispatch(
                    createPromptAsync({
                        prompt,
                        shape_id: shape.props.id,
                    })
                );
                console.log("new");
            } else {
                dispatch(
                    updatePromptAsync({
                        promptData: prompt,
                        shape_id: shape.props.id,
                    })
                );
                console.log("update");
            }
        }
    };
    return (
        <div
            className={`${
                prompt?.unsavedChanges ? "border-2 border-red-500" : ""
            } w-full rounded-lg h-full bg-slate-200 p-3 flex flex-col overflow-hidden`}
            style={{ pointerEvents: "all" }}
        >
            <ShapeHeader shape={shape}>
                <LockElement shape={shape} />
                <div className="flex items-center">
                    <ReceiptText /> Prompt Editor{" "}
                </div>
                <div
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        savePrompt();
                    }}
                    className={`hover:bg-slate-50 rounded-sm p-2 ${
                        state.isLoading
                            ? "text-slate-500 cursor-not-allowed"
                            : ""
                    }`}
                >
                    {!state.isLoading && (
                        <SaveIcon className="stroke-slate-800 stroke-1" />
                    )}
                </div>
                <div
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        if (!state.isLoading) {
                            savePrompt();
                            dispatch(
                                instantiatePromptAsync({
                                    promptData: prompt,
                                    shape_id: shape.props.id,
                                })
                            );
                            console.log("playing prompt", prompt);
                        }
                    }}
                    className={`hover:bg-slate-50 rounded-sm p-2 ${
                        state.isLoading
                            ? "text-slate-500 cursor-not-allowed"
                            : ""
                    }`}
                >
                    {!state.isLoading && (
                        <Play className="stroke-slate-800 stroke-1" />
                    )}
                </div>
            </ShapeHeader>
            <PromptNameInput prompt={prompt} shape={shape} />
            <div
                className="relative mt-3 p-1 max-h-[90%] h-full min-h-[20%] bg-slate-300 rounded-md flex"
                onPointerDown={(e) => e.stopPropagation()}
            >
                <VariableInputs shape={shape} prompt={prompt} />
                <div className=" flex-1 flex-col p-2 rounded-lg bg-slate-400">
                    <div>
                        <div className="">Preeamble</div>
                        <SubPromptContentSlateEditor
                            subprompt={prompt.preamble}
                            updateVariables={updateVariables("preamble")}
                        />
                    </div>
                    <div>
                        <div className="">Prompt</div>
                        <SubPromptContentSlateEditor
                            subprompt={prompt.content}
                            updateVariables={updateVariables("content")}
                        />
                    </div>
                    <div>
                        <div className="">Output</div>
                        <SubPromptContentSlateEditor
                            subprompt={prompt.output}
                            updateVariables={updateVariables("output")}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
export class PromptShapeUtil extends BaseBoxShapeUtil<IPromptShape> {
    static override type = "prompt-editor" as const;

    static override props: RecordProps<IPromptShape> = {
        w: T.number,
        h: T.number,
        id: T.string,
    };

    getDefaultProps(): IPromptShape["props"] {
        const calculatedWidth = window.innerWidth * 0.6;
        const calculatedHeight = window.innerHeight * 0.6;
        return {
            w: calculatedWidth,
            h: calculatedHeight,
            id: "global",
        };
    }

    override canResize(_shape) {
        return !_shape.props.isLocked;
    }
    override canEdit(_shape: IPromptShape): boolean {
        return false;
    }
    override canBeLaidOut(_shape: IPromptShape): boolean {
        return !_shape.props.isLocked;
    }
    override canScroll(_shape: IPromptShape): boolean {
        return !_shape.props.isLocked;
    }
    override canSnap(_shape: IPromptShape): boolean {
        return !_shape.props.isLocked;
    }

    component(shape: IPromptShape) {
        return (
            <PromptEditor
                shape={shape}
                isLocked={shape.isLocked}
                setIsLocked={() => {
                    this.editor.updateShape({
                        id: shape.id,
                        type: shape.type,
                        isLocked: !shape.isLocked,
                        props: {
                            ...shape.props,
                        },
                    });
                }}
            />
        );
    }

    indicator(shape: IPromptShape) {
        return (
            <rect
                width={shape.props.w}
                height={shape.props.h}
                stroke="rgba(100,100,0,0.8)"
            />
        );
    }
    override hideRotateHandle(_shape: IPromptShape): boolean {
        return true;
    }
}
