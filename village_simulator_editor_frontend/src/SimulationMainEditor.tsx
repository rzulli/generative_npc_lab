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
interface SimulationEditorProps {}

export default function SimulationMainEditor() {
    const { mapMeta } = useContext(SimulationContext);
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    return (
        <div className="overflow-hidden min-h-[100vh] max-h-[100vh] bg-slate-700">
            <EditorMainMenu />
            <div className="px-2 relative">
                <span className="bg-slate-50 font-semibold text-sm text-slate-600 p-3 rounded-md">
                    {mapMeta.name}
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
            </div>

            <BottomFloatMenu />
        </div>
    );
}
