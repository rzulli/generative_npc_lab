import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useContext } from "react";
import { SimulationContext } from "@/hooks/useSimulationContext";
import { TilesetViewerContent } from "./TilesetViewerContent";

interface TilesetTabSelectProps {}
export function TilesetTabSelect() {
    const { mapMeta } = useContext(SimulationContext);
    return (
        <>
            <Tabs defaultValue={0}>
                <TabsList className="flex flex-wrap h-[100%] bg-white gap-3">
                    {mapMeta.mapState.layers &&
                        Object.entries(mapMeta.mapState.tileset).map(
                            ([name, layer], index) => (
                                <TabsTrigger
                                    value={index}
                                    key={`${name} ${index} trigger`}
                                    className="bg-slate-200"
                                >
                                    {index}
                                </TabsTrigger>
                            )
                        )}
                </TabsList>

                <TilesetViewerContent />
            </Tabs>
        </>
    );
}
