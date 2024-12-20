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
import { SimulationContext } from "@/hooks/useSimulationContext";
import { useContext } from "react";
import OpenMapMenu from "./main-menu/OpenMapMenu";
import NewMapMenu from "./main-menu/NewMapMenu";
import NewSimulationMenu from "./simulation-menu/NewSimulationMenu";
import OpenSimulationMenu from "./simulation-menu/OpenSimulationMenu";
import { Sparkle, Sparkles } from "lucide-react";

const EditorMainMenu = () => {
    const { simulationMeta, loadMap, newSimulation } =
        useContext(SimulationContext);

    return (
        <>
            <div className="p-4 bg-slate-700 rounded-t-2xl flex gap-5 ">
                <div className="text-slate-50 flex items-center gap-5">
                    <span className="text-lg flex gap-2 items-center">
                        <Sparkles /> Village Simulator Editor
                    </span>{" "}
                    <span className="text-sm font-light">
                        {simulationMeta.name}
                    </span>
                </div>{" "}
                <Menubar>
                    {" "}
                    <MenubarMenu>
                        <MenubarTrigger>Simulation</MenubarTrigger>
                        <MenubarContent>
                            <NewSimulationMenu />
                            <OpenSimulationMenu />
                            <MenubarSeparator />
                            <MenubarItem>Save</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Save as</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger>Map</MenubarTrigger>
                        <MenubarContent>
                            <NewMapMenu />
                            <OpenMapMenu />

                            <MenubarSeparator />
                            <MenubarItem>Save</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Save as</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                    <MenubarMenu>
                        <MenubarTrigger>Tool</MenubarTrigger>
                        <MenubarContent></MenubarContent>
                    </MenubarMenu>
                </Menubar>
            </div>
        </>
    );
};

export default EditorMainMenu;
