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
    GripHorizontal,
    Layers,
    PersonStanding,
    SwatchBook,
} from "lucide-react";
import { map } from "zod";
import { ScrollArea } from "./components/ui/scroll-area";
import { EventBus } from "./game/EventBus";
function App() {
    const { mapMeta } = useContext(SimulationContext);
    // The sprite can only be moved in the MainMenu Scene
    const [canMoveSprite, setCanMoveSprite] = useState(true);

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });

    // const changeScene = () => {

    //     if(phaserRef.current)
    //     {
    //         const scene = phaserRef.current.scene as MainMenu;

    //         if (scene)
    //         {
    //             scene.changeScene();
    //         }
    //     }
    // }

    // const moveSprite = () => {

    //     if(phaserRef.current)
    //     {

    //         const scene = phaserRef.current.scene as MainMenu;

    //         if (scene && scene.scene.key === 'MainMenu')
    //         {
    //             // Get the update logo position
    //             scene.moveLogo(({ x, y }) => {

    //                 setSpritePosition({ x, y });

    //             });
    //         }
    //     }

    // }

    // const addSprite = () => {

    //     if (phaserRef.current)
    //     {
    //         const scene = phaserRef.current.scene;

    //         if (scene)
    //         {
    //             // Add more stars
    //             const x = Phaser.Math.Between(64, scene.scale.width - 64);
    //             const y = Phaser.Math.Between(64, scene.scale.height - 64);

    //             //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
    //             const star = scene.add.sprite(x, y, 'star');

    //             //  ... which you can then act upon. Here we create a Phaser Tween to fade the star sprite in and out.
    //             //  You could, of course, do this from within the Phaser Scene code, but this is just an example
    //             //  showing that Phaser objects and systems can be acted upon from outside of Phaser itself.
    //             scene.add.tween({
    //                 targets: star,
    //                 duration: 500 + Math.random() * 1000,
    //                 alpha: 0,
    //                 yoyo: true,
    //                 repeat: -1
    //             });
    //         }
    //     }
    // }

    // // Event emitted from the PhaserGame component
    // const currentScene = (scene: Phaser.Scene) => {

    //     setCanMoveSprite(scene.scene.key !== 'MainMenu');

    // }
    const { toast } = useToast();

    return (
        <div className="overflow-hidden min-h-[100vh] max-h-[100vh] bg-slate-700">
            <EditorMainMenu />
            {/* <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
            <div>
                <div>
                    <button className="button" onClick={changeScene}>Change Scene</button>
                </div>
                <div>
                    <button disabled={canMoveSprite} className="button" onClick={moveSprite}>Toggle Movement</button>
                </div>
                <div className="spritePosition">Sprite Position:
                    <pre>{`{\n  x: ${spritePosition.x}\n  y: ${spritePosition.y}\n}`}</pre>
                </div>
                <div>
                    <button className="button" onClick={addSprite}>Add New Sprite</button>
                </div>
            </div> */}
            <div className="px-2 relative">
                <span className="bg-slate-50 font-semibold text-sm text-slate-600 p-3 rounded-md">
                    {mapMeta.name}
                </span>

                <ContextMenu>
                    <ContextMenuTrigger>
                        {" "}
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
            <div
                className="fixed bottom-0 right-[50%] translate-x-[50%] p-4
            "
            >
                <Menubar>
                    <MenubarMenu>
                        <MenubarTrigger>
                            <Popover>
                                <PopoverTrigger>
                                    <Layers />
                                </PopoverTrigger>
                                <PopoverContent>
                                    <div className="text-left font-bold">
                                        Layers
                                    </div>
                                    <ScrollArea className="p-3 h-[50vh]">
                                        {mapMeta.mapState.layers &&
                                            mapMeta.mapState.layers.map(
                                                (layer) => (
                                                    <div
                                                        className="p-2 mb-3 rounded-md flex gap-5 hover:bg-slate-200 items-center"
                                                        onClick={() =>
                                                            EventBus.emit(
                                                                "SELECT_LAYER",
                                                                layer.name
                                                            )
                                                        }
                                                    >
                                                        <GripHorizontal className="w-4" />
                                                        {layer.name}
                                                    </div>
                                                )
                                            )}
                                    </ScrollArea>
                                </PopoverContent>
                            </Popover>
                        </MenubarTrigger>
                        <MenubarTrigger>
                            <SwatchBook />
                        </MenubarTrigger>
                        <MenubarTrigger>
                            <Brain />
                        </MenubarTrigger>
                        <MenubarTrigger>
                            <Box />
                        </MenubarTrigger>
                    </MenubarMenu>
                </Menubar>{" "}
            </div>
        </div>
    );
}

export default App;

