import { T } from "@tldraw/validate";
import {
    TLBaseShape,
    BaseBoxShapeUtil,
    RecordProps,
    HTMLContainer,
} from "tldraw";
import CollapsibleLog from "@/components/infinite-canvas/CollapsibleLog";
import { MainShape } from "./MainShapeProps";
import { Lock, Unlock } from "lucide-react";

type ISimulationLogShape = TLBaseShape<
    "simulation-log",
    {
        w: number;
        h: number;
        previousW: number;
        previousH: number;
        scope: string;
        shapeType: "eventLog" | "simulationShape" | "agentShape";
        isCollapsed: boolean;
    }
>;
export class SimulationLogShapeUtil extends BaseBoxShapeUtil<ISimulationLogShape> {
    static override type = "simulation-log" as const;

    static override props: RecordProps<ISimulationLogShape> = {
        w: T.number,
        h: T.number,
        previousW: T.number,
        previousH: T.number,
        scope: T.string,
        shapeType: T.string,
        isCollapsed: T.boolean,
    };
    getDefaultProps(): ISimulationLogShape["props"] {
        const calculatedWidth = window.innerWidth * 0.3;
        const calculatedHeight = window.innerHeight * 0.3;
        return {
            w: calculatedWidth,
            h: calculatedHeight,
            previousW: calculatedWidth,
            previousH: calculatedHeight,
            scope: "global",
            isCollapsed: true,
            shapeType: "eventLog",
        };
    }

    override canResize() {
        return true;
    }
    override canEdit(_shape: ISimulationLogShape): boolean {
        return true;
    }
    override canBeLaidOut(_shape: ISimulationLogShape): boolean {
        return false;
    }
    override canScroll(_shape: ISimulationLogShape): boolean {
        return true;
    }
    override canSnap(_shape: ISimulationLogShape): boolean {
        return true;
    }

    component(shape: ISimulationLogShape) {
        const lockElement = (
            <div
                onMouseDown={(e) => {
                    e.stopPropagation();
                    this.editor.updateShape({
                        id: shape.id,
                        type: shape.type,
                        isLocked: !shape.isLocked,
                        props: {
                            ...shape.props,
                        },
                    });
                }}
            >
                {shape.isLocked ? (
                    <Lock className="stroke-slate-800 stroke-1" />
                ) : (
                    <Unlock className="stroke-slate-800 stroke-1" />
                )}
            </div>
        );
        return (
            <MainShape
                shape={shape}
                shapeType={shape.props.shapeType}
                key={shape.props.scope}
                scope={shape.props.scope}
                lockElement={lockElement}
                collapseFunction={() => {
                    this.editor.updateShape({
                        id: shape.id,
                        type: shape.type,
                        isLocked: shape.isLocked,

                        props: {
                            ...shape.props,
                            w: shape.props.isCollapsed
                                ? 300
                                : shape.props.previousW,
                            h: shape.props.isCollapsed
                                ? 200
                                : shape.props.previousH,
                            previousW:
                                shape.props.w != 300
                                    ? shape.props.w
                                    : shape.props.previousW,

                            previousH:
                                shape.props.h != 200
                                    ? shape.props.h
                                    : shape.props.previousH,
                            isCollapsed: !shape.props.isCollapsed,
                        },
                    });
                }}
            />
        );
    }

    // [5]
    indicator(shape: ISimulationLogShape) {
        return (
            <rect
                width={shape.props.w}
                height={shape.props.h}
                stroke="rgba(100,100,0,0.8)"
            />
        );
    }
    override hideRotateHandle(_shape: ISimulationLogShape): boolean {
        return true;
    }
}
