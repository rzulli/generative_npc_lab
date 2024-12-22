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
import { LayerList } from "./LayersList";

interface LayersPopoverProps {}

const LayersPopover: React.FC<LayersPopoverProps> = () => {
    const { mapMeta } = useContext(SimulationContext);

    return (
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
                <LayerList />
            </PopoverContent>
        </Popover>
    );
};

export default LayersPopover;
