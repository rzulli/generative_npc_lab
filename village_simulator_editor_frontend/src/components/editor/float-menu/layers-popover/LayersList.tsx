import { EyeClosed, GripHorizontal } from "lucide-react";
import { useContext } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EventBus } from "@/game/EventBus";
import { SimulationContext } from "@/hooks/useSimulationContext";

interface LayerListProps {}

export function LayerList() {
    const { mapMeta } = useContext(SimulationContext);

    return (
        <ScrollArea className="p-3 h-[50vh]">
            {mapMeta.mapState.layers &&
                Object.entries(mapMeta.mapState.layers).map(
                    ([name, layer], index) => (
                        <div
                            key={name + index}
                            className="p-2 mb-3 rounded-md flex gap-5 hover:bg-slate-200 items-center justify-between"
                        >
                            <div className="cursor-grab">
                                <GripHorizontal className="w-4" />
                            </div>
                            {name}

                            {layer.visible ? (
                                <div
                                    className="bg-slate-100 w-5 flex items-center justify-center rounded-full "
                                    onClick={(e) => {
                                        EventBus.emit("HIDE_LAYER", name);
                                    }}
                                >
                                    <Eye className="w-4" />
                                </div>
                            ) : (
                                <div
                                    onClick={(e) => {
                                        EventBus.emit("SHOW_LAYER", name);
                                    }}
                                >
                                    <EyeClosed className="w-4" />
                                </div>
                            )}
                        </div>
                    )
                )}
        </ScrollArea>
    );
}
