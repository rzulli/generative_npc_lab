import { SwatchBook } from "lucide-react";
import React, { memo, useContext } from "react";
import { MenubarTrigger } from "@/components/ui/menubar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { SimulationContext } from "@/hooks/useSimulationContext";
import { tile_width } from "../../../../game/consts";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { TilesetTabSelect } from "./TilesetTabSelect";
const TilesetPopover: React.FC = memo(() => {
    const { mapMeta } = useContext(SimulationContext);

    return (
        <Sheet>
            <SheetTrigger>
                <SwatchBook />{" "}
            </SheetTrigger>
            <SheetContent className=" ">
                <div className="text-left font-bold flex justify-between items-center">
                    <div className="">Tileset </div>
                    <div className="rounded-md hover:bg-slate-200"></div>
                </div>

                <TilesetTabSelect mapMeta={mapMeta} />
            </SheetContent>
        </Sheet>
    );
});

export default TilesetPopover;
