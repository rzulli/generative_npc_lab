interface SimulationEditorProps {}

import "tldraw/tldraw.css";
/* eslint-disable react-hooks/rules-of-hooks */

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "tldraw/tldraw.css";
import Log from "./Log";
import { ShapeHeader } from "./ShapeHeader";

export interface CollapsibleLogProps {
    scope: string;
}

export default function CollapsibleLog({
    shape,
    scope,
    lockElement,
}: CollapsibleLogProps) {
    return (
        <div className="overflow-hidden h-full">
            <ShapeHeader shape={shape}>
                <div className="p-3 flex gap-5">
                    {lockElement}
                    <div>{scope} </div>
                </div>
            </ShapeHeader>
            <Log scope={scope} />
        </div>
    );
}
