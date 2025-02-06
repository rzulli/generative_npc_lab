import { T } from "@tldraw/validate";
import {
    TLBaseShape,
    BaseBoxShapeUtil,
    RecordProps,
    HTMLContainer,
} from "tldraw";
import CollapsibleLog from "@/components/infinite-canvas/CollapsibleLog";
import { MainShape } from "./MainShapeProps";
import { Textarea } from "../ui/textarea";

type IPromptShape = TLBaseShape<
    "prompt-editor",
    {
        w: number;
        h: number;
        scope: string;
    }
>;

import React, { useCallback, useMemo, useRef, useState } from "react";
import EditableVoidsExample, { EditableVoid } from "./PromptEditor";
import {
    createEditor,
    Descendant,
    Editor,
    Range,
    Transforms,
    Element as SlateElement,
    Node as SlateNode,
} from "slate";
import {
    Editable,
    ReactEditor,
    Slate,
    useSelected,
    useSlate,
    withReact,
} from "slate-react";
import { withHistory } from "slate-history";
import {
    Lock,
    ReceiptText,
    Unlock,
    Variable,
    VariableIcon,
} from "lucide-react";
import { isKeyHotkey } from "is-hotkey";
import { Button } from "../ui/button";
const SHORTCUTS = {
    "*": "list-item",
};
const initialValue: Descendant[] = [
    {
        type: "paragraph",
        children: [
            {
                text: "New Prompt",
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
function PromptEditor({ isLocked, setIsLocked }) {
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
        <div
            className="w-full h-full bg-slate-400 flex flex-col"
            style={{ pointerEvents: "all" }}
        >
            <div className="flex p-1 text-sm justify-between items-center">
                <div className="flex items-center">
                    <ReceiptText /> Prompt Editor{" "}
                </div>
                <div
                    className="cursor-pointer hover:bg-slate-100/50 rounded-sm "
                    style={{ pointerEvents: "all" }}
                    onMouseDown={(e) => {
                        e.stopPropagation();

                        setIsLocked();
                    }}
                >
                    {isLocked ? (
                        <Lock className="stroke-slate-800 stroke-1" />
                    ) : (
                        <Unlock className="stroke-slate-800 stroke-1" />
                    )}
                </div>
            </div>
            <Slate editor={editor} initialValue={initialValue}>
                <div className="p-1 text-sm flex ">
                    <ToggleEditableButtonButton />
                </div>
                <Editable
                    className="w-full h-full bg-slate-200"
                    renderElement={(props) => <Element {...props} />}
                    placeholder="Enter some text..."
                    onKeyDown={onKeyDown}
                />
            </Slate>
        </div>
    );
}
export class PromptShapeUtil extends BaseBoxShapeUtil<IPromptShape> {
    static override type = "prompt-editor" as const;

    static override props: RecordProps<IPromptShape> = {
        w: T.number,
        h: T.number,
        scope: T.string,
    };

    getDefaultProps(): IPromptShape["props"] {
        const calculatedWidth = window.innerWidth * 0.3;
        const calculatedHeight = window.innerHeight * 0.3;
        return {
            w: calculatedWidth,
            h: calculatedHeight,
            scope: "global",
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
                isLocked={shape.isLocked}
                setIsLocked={() => {
                    console.log("aloo");

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
