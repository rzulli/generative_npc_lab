import { SwatchBook } from "lucide-react";
import React, { memo, useContext } from "react";
import { MenubarTrigger } from "@/components/ui/menubar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SimulationContext } from "@/hooks/useSimulationContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tile_width } from "../../../../game/consts";
import { EventBus } from "@/game/EventBus";
import { ScrollBar } from "@/components/ui/scroll-area";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
const TilesetPopover: React.FC = memo(() => {
    const { mapMeta } = useContext(SimulationContext);

    return (
        <MenubarTrigger>
            <Sheet>
                <SheetTrigger>
                    <SwatchBook />{" "}
                </SheetTrigger>
                <SheetContent className=" ">
                    <div className="text-left font-bold flex justify-between items-center">
                        <div className="">Tileset </div>
                        <div className="rounded-md hover:bg-slate-200"></div>
                    </div>

                    <Tabs defaultValue={0}>
                        <TabsList className="flex flex-wrap h-[100%] bg-white gap-3">
                            {mapMeta.mapState.layers &&
                                Object.entries(mapMeta.mapState.tileset).map(
                                    ([name, layer], index) => (
                                        <TabsTrigger
                                            value={index}
                                            className="bg-slate-200"
                                        >
                                            {index}
                                        </TabsTrigger>
                                    )
                                )}
                        </TabsList>
                        <ScrollArea className="h-[90vh] max-w-full overflow-clip">
                            {mapMeta.mapState.tileset &&
                                Object.entries(mapMeta.mapState.tileset).map(
                                    ([name, layer], index) => (
                                        <TabsContent value={index}>
                                            <div
                                                className="grid "
                                                style={{
                                                    gridTemplateColumns: `repeat(${layer.columns}, ${layer.tileWidth}px)`,
                                                    gridTemplateRows: `repeat(${layer.rows}, ${layer.tileHeight}px)`,
                                                    backgroundImage: `url(${layer.url})`,
                                                }}
                                            >
                                                {new Array(layer.columns)
                                                    .fill(null)
                                                    .map((_, rowIndex) => (
                                                        <>
                                                            {new Array(
                                                                layer.rows
                                                            )
                                                                .fill(null)
                                                                .map(
                                                                    (
                                                                        _,
                                                                        colIndex
                                                                    ) => {
                                                                        const id =
                                                                            parseInt(
                                                                                layer.firstgid
                                                                            ) +
                                                                            colIndex +
                                                                            rowIndex *
                                                                                layer.rows;
                                                                        return (
                                                                            <div
                                                                                key={
                                                                                    id +
                                                                                    Math.random()
                                                                                }
                                                                                className={
                                                                                    "border border-opacity-50 bg-opacity-0 border-slate-200 hover:bg-slate-600 hover:bg-opacity-10"
                                                                                }
                                                                                onClick={(
                                                                                    e
                                                                                ) => {
                                                                                    e.stopPropagation();
                                                                                    EventBus.emit(
                                                                                        "ON_SELECT_TILE",
                                                                                        {
                                                                                            tile_id:
                                                                                                id,
                                                                                            tileset:
                                                                                                layer.name,
                                                                                        }
                                                                                    );
                                                                                }}
                                                                            >
                                                                                {
                                                                                    id
                                                                                }
                                                                            </div>
                                                                        );
                                                                    }
                                                                )}
                                                        </>
                                                    ))}
                                            </div>
                                        </TabsContent>
                                    )
                                )}
                            <ScrollBar orientation="vertical" />
                            <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                    </Tabs>
                </SheetContent>
            </Sheet>
        </MenubarTrigger>
    );
});

export default TilesetPopover;
