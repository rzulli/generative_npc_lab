import { ScrollArea } from "@/components/ui/scroll-area";
import { ScrollBar } from "@/components/ui/scroll-area";
import { TabsContent } from "@/components/ui/tabs";
import { EventBus } from "@/game/EventBus";
import { SimulationContext } from "@/hooks/useSimulationContext";
import React, { useContext } from "react";

interface TilesetViewerContentProps {}
export function TilesetViewerContent() {
    const { mapMeta } = useContext(SimulationContext);
    return (
        <ScrollArea className="h-[90vh] max-w-full overflow-clip">
            {mapMeta.mapState.tileset &&
                Object.entries(mapMeta.mapState.tileset).map(
                    ([name, layer], index) => (
                        <div key={`${name} ${index} tab`}>
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
                                            <span
                                                className="w-full h-full"
                                                key={`${name} ${index} row ${rowIndex}`}
                                            >
                                                {new Array(layer.rows)
                                                    .fill(null)
                                                    .map((_, colIndex) => {
                                                        const id =
                                                            parseInt(
                                                                layer.firstgid
                                                            ) +
                                                            colIndex +
                                                            rowIndex *
                                                                layer.rows;
                                                        return (
                                                            <div
                                                                key={`
                                                                                    ${id}
                                                                                    ${index}
                                                                                    ${name}
                                                                                    row 
                                                                                    ${rowIndex}
                                                                                    col
                                                                                    ${colIndex}
                                                                                `}
                                                                className={
                                                                    "border h-full text-slate-100 w-full border-opacity-50 bg-opacity-0 border-slate-200 hover:bg-slate-600 hover:bg-opacity-10"
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
                                                                {id}
                                                            </div>
                                                        );
                                                    })}
                                            </span>
                                        ))}
                                </div>
                            </TabsContent>
                        </div>
                    )
                )}
            <ScrollBar orientation="vertical" />
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}
