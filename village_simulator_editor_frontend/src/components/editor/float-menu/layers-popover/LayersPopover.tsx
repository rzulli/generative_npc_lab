import React, { useContext } from "react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { MenubarTrigger } from "@/components/ui/menubar";
import { Eye, EyeClosed, GripHorizontal, Layers, Plus } from "lucide-react";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { SimulationContext } from "@/hooks/useSimulationContext";
import { EventBus } from "@/game/EventBus";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import NewLayerDialog from "./NewLayerDialog";

interface LayersPopoverProps {}

const LayersPopover: React.FC<LayersPopoverProps> = () => {
    const { mapMeta } = useContext(SimulationContext);

    return (
        <MenubarTrigger>
            <Popover>
                <PopoverTrigger>
                    <Layers />{" "}
                </PopoverTrigger>
                <PopoverContent>
                    <div className="text-left font-bold flex justify-between items-center">
                        <div className="h-full">Layers </div>
                        <div className="rounded-md hover:bg-slate-200">
                            <NewLayerDialog />
                        </div>
                    </div>
                    <ScrollArea className="p-3 h-[50vh]">
                        {mapMeta.mapState.layers &&
                            Object.entries(mapMeta.mapState.layers).map(
                                ([name, layer], index) => (
                                    <div className="p-2 mb-3 rounded-md flex gap-5 hover:bg-slate-200 items-center justify-between">
                                        <div className="cursor-grab">
                                            <GripHorizontal className="w-4" />
                                        </div>
                                        {name}

                                        {layer.visible ? (
                                            <div
                                                className="bg-slate-100 w-5 flex items-center justify-center rounded-full "
                                                onClick={(e) => {
                                                    EventBus.emit(
                                                        "HIDE_LAYER",
                                                        name
                                                    );
                                                }}
                                            >
                                                <Eye className="w-4" />
                                            </div>
                                        ) : (
                                            <div
                                                onClick={(e) => {
                                                    EventBus.emit(
                                                        "SHOW_LAYER",
                                                        name
                                                    );
                                                }}
                                            >
                                                <EyeClosed className="w-4" />
                                            </div>
                                        )}
                                    </div>
                                )
                            )}
                    </ScrollArea>
                </PopoverContent>
            </Popover>
        </MenubarTrigger>
    );
};

export default LayersPopover;
