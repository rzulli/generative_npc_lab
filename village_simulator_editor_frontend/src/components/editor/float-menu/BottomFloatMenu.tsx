import { MenubarMenu } from "@radix-ui/react-menubar";
import { Menubar, MenubarTrigger } from "@/components/ui/menubar";
import LayersPopover from "./layers-popover/LayersPopover";
import TilesetPopover from "./tiles-popover/TilesetPopover";
import { Box, Brain } from "lucide-react";

export default function BottomFloatMenu() {
    return (
        <div
            className="fixed bottom-0 right-[50%] translate-x-[50%] p-4
            "
        >
            <Menubar>
                <MenubarMenu>
                    <LayersPopover />
                    <TilesetPopover />
                    <MenubarTrigger>
                        <Brain />
                    </MenubarTrigger>
                    <MenubarTrigger>
                        <Box />
                    </MenubarTrigger>
                </MenubarMenu>
            </Menubar>{" "}
        </div>
    );
}
