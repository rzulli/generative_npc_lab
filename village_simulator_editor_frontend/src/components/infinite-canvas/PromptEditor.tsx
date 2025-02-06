import React, { useState, useMemo } from "react";
import { Transforms, createEditor, Descendant, Range } from "slate";
import {
    Slate,
    Editable,
    useSlateStatic,
    withReact,
    useSelected,
} from "slate-react";
import { withHistory } from "slate-history";
import { isKeyHotkey } from "is-hotkey";

import { Button } from "@/components/ui/button";
import { ArrowDownWideNarrowIcon } from "lucide-react";

const EditableVoidsExample = () => {
    const editor = useMemo(
        () => withInlines(withHistory(withReact(createEditor()))),
        []
    );
    const onKeyDown = (event) => {
        const { selection } = editor;
        // Default left/right behavior is unit:'character'.
        // This fails to distinguish between two cursor positions, such as
        // <inline>foo<cursor/></inline> vs <inline>foo</inline><cursor/>.
        // Here we modify the behavior to unit:'offset'.
        // This lets the user step into and out of the inline without stepping over characters.
        // You may wish to customize this further to only use unit:'offset' in specific cases.
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
        <Slate editor={editor} initialValue={initialValue}>
            <div></div>

            <Editable
                renderElement={(props) => <Element {...props} />}
                placeholder="Enter some text..."
                onKeyDown={onKeyDown}
            />
        </Slate>
    );
};
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
    editor.isElementReadOnly = (element) =>
        element.type === "badge" || isElementReadOnly(element);
    editor.isSelectable = (element) =>
        element.type !== "badge" && isSelectable(element);
    editor.insertText = (text) => {
        console.log(text);
        insertText(text);
    };

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
    return (
        <span
            {...attributes}
            contentEditable={false}
            className={`bg-green-500 text-white px-2 py-1 rounded text-sm ${
                selected ? "shadow-outline" : ""
            }`}
            data-playwright-selected={selected}
        >
            <InlineChromiumBugfix />
            {children}
            <InlineChromiumBugfix />
        </span>
    );
};

const initialValue: Descendant[] = [
    {
        type: "paragraph",
        children: [
            {
                text: "In addition to nodes that contain editable text, you can insert void nodes, which can also contain editable elements, inputs, or an entire other Slate editor.",
            },
        ],
    },
    {
        type: "editable-void",
        children: [{ text: "" }],
    },
    {
        type: "paragraph",
        children: [
            {
                text: "",
            },
        ],
    },
];

export default EditableVoidsExample;
