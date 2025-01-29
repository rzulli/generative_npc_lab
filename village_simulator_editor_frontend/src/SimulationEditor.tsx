import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useContext, useRef } from "react";
import EditorMainMenu from "./components/editor/EditorMainMenu";
import BottomFloatMenu from "./components/editor/float-menu/BottomFloatMenu";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { SimulationContext } from "./hooks/useSimulationContext";
import { useAppSelector } from "./hooks/hooks";
import { selectMapMeta } from "./slices/mapMetaSlice";
interface SimulationEditorProps {}

export default function SimulationEditor() {
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const mapMeta = useAppSelector(selectMapMeta);

    return (
        <div className="absolute left-[50%]">
            <div className="relative overflow-hidden h-[30vh] w-[30vw]">
                <span className="bg-slate-500 font-semibold text-sm text-slate-100 p-3 rounded-md">
                    {mapMeta?.name ?? "Empty Map"}
                </span>

                <ContextMenu>
                    <ContextMenuTrigger>
                        <PhaserGame ref={phaserRef} />
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                        <ContextMenuItem>Profile</ContextMenuItem>
                        <ContextMenuItem>Billing</ContextMenuItem>
                        <ContextMenuItem>Team</ContextMenuItem>
                        <ContextMenuItem>Subscription</ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>

                <BottomFloatMenu />
            </div>
        </div>
    );
}
