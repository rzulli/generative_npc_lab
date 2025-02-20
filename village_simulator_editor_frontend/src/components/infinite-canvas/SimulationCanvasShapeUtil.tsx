import "tldraw/tldraw.css";
/* eslint-disable react-hooks/rules-of-hooks */
import { BaseBoxShapeUtil, RecordProps, T, TLBaseShape } from "tldraw";

import {
    Lock,
    SquareArrowDownLeft,
    SquareArrowOutUpRight,
    Unlock,
} from "lucide-react";

import { PhaserSimulationCanvas } from "@/game/PhaserGame";
import { ShapeHeader } from "./ShapeHeader";

type ISimulationCanvasShape = TLBaseShape<
    "simulation-canvas",
    {
        w: number;
        h: number;
        container_w: string;
        container_h: string;
    }
>;
export default class SimulationCanvasShapeUtil extends BaseBoxShapeUtil<ISimulationCanvasShape> {
    static override type = "simulation-canvas" as const;

    static override props: RecordProps<ISimulationCanvasShape> = {
        w: T.number,
        h: T.number,
        container_h: T.string,
        container_w: T.string,
    };

    getDefaultProps(): ISimulationCanvasShape["props"] {
        return {
            w: 800,
            h: 600,
            container_w: "30vw",
            container_h: "30vh",
        };
    }

    override canResize() {
        return false;
    }

    component(shape: ISimulationCanvasShape) {
        console.log(shape);
        return (
            <div
                className="flex flex-col bg-slate-300"
                style={{ pointerEvents: "all" }}
            >
                <ShapeHeader shape={shape}>
                    <div className="flex gap-3 p-3 items-center">
                        {shape.props.w > 400 && (
                            <div
                                className=" flex"
                                onMouseDown={(e) => {
                                    e.stopPropagation();

                                    if (shape.props.w == 1920) {
                                        this.editor.updateShape({
                                            id: shape.id,
                                            type: shape.type,
                                            props: {
                                                ...shape.props,
                                                w: 800,
                                                h: 600,
                                            },
                                        });
                                    } else if (shape.props.w == 800) {
                                        this.editor.updateShape({
                                            id: shape.id,
                                            type: shape.type,
                                            props: {
                                                ...shape.props,
                                                w: 400,
                                                h: 320,
                                            },
                                        });
                                    } else if (shape.props.w == 400) {
                                        this.editor.updateShape({
                                            id: shape.id,
                                            type: shape.type,
                                            props: {
                                                ...shape.props,
                                                w: 1920,
                                                h: 1080,
                                            },
                                        });
                                    }
                                }}
                            >
                                {shape.props.w == 1920 && (
                                    <SquareArrowDownLeft className="w-4 h-4 " />
                                )}

                                {shape.props.w == 800 && (
                                    <SquareArrowDownLeft className="w-4 h-4 " />
                                )}
                            </div>
                        )}
                        {shape.props.w < 1900 && (
                            <div
                                className=" flex"
                                onMouseDown={(e) => {
                                    e.stopPropagation();

                                    if (shape.props.w == 400) {
                                        this.editor.updateShape({
                                            id: shape.id,
                                            type: shape.type,
                                            props: {
                                                ...shape.props,
                                                w: 800,
                                                h: 600,
                                            },
                                        });
                                    } else if (shape.props.w == 800) {
                                        this.editor.updateShape({
                                            id: shape.id,
                                            type: shape.type,
                                            props: {
                                                ...shape.props,
                                                w: 1920,
                                                h: 1080,
                                            },
                                        });
                                    } else if (shape.props.w == 1920) {
                                        this.editor.updateShape({
                                            id: shape.id,
                                            type: shape.type,
                                            props: {
                                                ...shape.props,
                                                w: 400,
                                                h: 320,
                                            },
                                        });
                                    }
                                }}
                            >
                                {shape.props.w == 400 && (
                                    <SquareArrowOutUpRight className="w-4 h-4 " />
                                )}

                                {shape.props.w == 800 && (
                                    <SquareArrowOutUpRight className="w-4 h-4 " />
                                )}
                            </div>
                        )}

                        <div>
                            {shape.props.w} x {shape.props.h}
                        </div>
                        <div>Simulation Panel</div>
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
                    </div>
                </ShapeHeader>
                <PhaserSimulationCanvas
                    width={shape.props.w}
                    height={shape.props.h - 26}
                />
            </div>
        );
    }

    override canScroll(shape: ISimulationCanvasShape) {
        return false;
    }
    override canEdit(_shape: ISimulationCanvasShape): boolean {
        return false;
    }
    override canBeLaidOut(_shape: ISimulationCanvasShape): boolean {
        return false;
    }

    indicator(shape: ISimulationCanvasShape) {
        return <rect width={shape.props.w} height={shape.props.h} />;
    }
}
