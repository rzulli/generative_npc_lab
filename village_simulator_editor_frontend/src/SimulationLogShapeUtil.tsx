import { T } from "@tldraw/validate";
import {
    TLBaseShape,
    BaseBoxShapeUtil,
    RecordProps,
    HTMLContainer,
} from "tldraw";
import CollapsibleLog from "@/components/infinite-canvas/CollapsibleLog";

type ISimulationLogShape = TLBaseShape<
    "simulation-log",
    {
        w: number;
        h: number;
        scope: string;
    }
>;
export class SimulationLogShapeUtil extends BaseBoxShapeUtil<ISimulationLogShape> {
    static override type = "simulation-log" as const;

    static override props: RecordProps<ISimulationLogShape> = {
        w: T.number,
        h: T.number,
        scope: T.string,
    };
    getDefaultProps(): ISimulationLogShape["props"] {
        const calculatedWidth = window.innerWidth * 0.3;
        const calculatedHeight = window.innerHeight * 0.3;
        return {
            w: calculatedWidth,
            h: calculatedHeight,
            scope: "global",
        };
    }

    override canResize() {
        return true;
    }

    component(shape: ISimulationLogShape) {
        return (
            <HTMLContainer
                style={{
                    padding: 16,
                    height: shape.props.h,
                    width: shape.props.w,
                    // [a] This is where we allow pointer events on our shape
                    pointerEvents: "all",

                    overflow: "hidden",
                }}
            >
                <CollapsibleLog
                    key={shape.props.scope}
                    scope={shape.props.scope}
                />
            </HTMLContainer>
        );
    }

    // [5]
    indicator(shape: ISimulationLogShape) {
        return <rect width={shape.props.w} height={shape.props.h} />;
    }
}
