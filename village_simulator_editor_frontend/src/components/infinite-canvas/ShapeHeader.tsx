import { CollapsibleProps } from "./CollapsibleLog";

interface ShapeHeaderProps {
    agentId: string;
    collapseElement: CollapsibleProps["collapseElement"];
    lockElement: CollapsibleProps["lockElement"];
    shape: CollapsibleProps["shape"];
}

export function ShapeHeader({ children, shape }: ShapeHeaderProps) {
    return (
        <div
            className={`w-full flex items-center gap-5 ${
                !shape.isLocked ? "cursor-move" : "cursor-no-drop"
            }`}
        >
            {children}
        </div>
    );
}
