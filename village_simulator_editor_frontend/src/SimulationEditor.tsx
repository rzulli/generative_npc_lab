import {
    useContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import { MainMenu } from "./game/scenes/MainMenu";
import axios from "axios";
import { useToast } from "./hooks/use-toast";
import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarShortcut,
    MenubarTrigger,
} from "@/components/ui/menubar";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "src/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import useSimulation from "./context/SimulationContext";
import { SimulationContext } from "./hooks/useSimulationContext";
import EditorMainMenu from "./components/editor/EditorMainMenu";
import { MapSelectorCombobox } from "./components/editor/simulation-menu/NewSimulationMenu";
import {
    Box,
    Brain,
    Eye,
    EyeClosed,
    GripHorizontal,
    Layers,
    PersonStanding,
    SwatchBook,
} from "lucide-react";
import { map } from "zod";
import { ScrollArea } from "./components/ui/scroll-area";
import { EventBus } from "./game/EventBus";
import LayersPopover from "./components/editor/float-menu/layers-popover/LayersPopover";
import TilesetPopover from "./components/editor/float-menu/tiles-popover/TilesetPopover";
import BottomFloatMenu from "./components/editor/float-menu/BottomFloatMenu";
interface SimulationEditorProps {}

export default function SimulationEditor() {
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
