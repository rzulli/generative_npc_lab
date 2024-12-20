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
} from "@/components/ui/dialog";
import { SimulationContext } from "@/hooks/useSimulationContext";
import { useContext, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
    username: z.string().min(2).max(50),
});
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Calendar, House, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const OpenSimulationMenu = () => {
    const [objectList, setObjectList] = useState([]);
    const [open, setOpen] = useState(false);
    const { listSimulationMeta, loadSimulationMeta } =
        useContext(SimulationContext);

    useEffect(() => {
        listSimulationMeta().then((response) => {
            setObjectList(response.data);
        });
    }, []);

    const loadSimulation = (object_uid, version) => {
        loadSimulationMeta(object_uid, version).then((response) => {
            toast({
                title: "Loaded",
                description: response.name + " loaded",
            });
            setOpen(false);
        });
    };
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <MenubarItem onSelect={(e) => e.preventDefault()}>
                    Open
                </MenubarItem>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Open Simulation</DialogTitle>
                    <DialogDescription>
                        <ScrollArea className="h-[50vh] ">
                            <div className="space-y-5 p-3">
                                {objectList &&
                                    objectList.map((object, index) => (
                                        <div
                                            className="p-5 flex gap-3 items-center justify-between border rounded-md hover:bg-slate-300"
                                            onClick={() =>
                                                loadSimulation(
                                                    object.object_uid,
                                                    object.version
                                                )
                                            }
                                        >
                                            <Sparkles />{" "}
                                            <div className="flex flex-col">
                                                <span className="text-lg">
                                                    {object.name}
                                                </span>
                                                <span className="text-xs text-gray-500 flex items-center gap-3">
                                                    <Calendar className="w-3" />
                                                    {object.updated_at[
                                                        "$date"
                                                    ] &&
                                                        new Date(
                                                            Date.parse(
                                                                object
                                                                    .updated_at[
                                                                    "$date"
                                                                ]
                                                            )
                                                        ).toLocaleDateString(
                                                            "pt-BR",
                                                            {
                                                                day: "2-digit",
                                                                month: "2-digit",
                                                                year: "numeric",
                                                            }
                                                        )}
                                                </span>
                                            </div>
                                            <div className="flex gap-1 ">
                                                <House className="w-4" />
                                                {object.map_name}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                            <ScrollBar orientation="vertical" />
                        </ScrollArea>
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};

export default OpenSimulationMenu;
