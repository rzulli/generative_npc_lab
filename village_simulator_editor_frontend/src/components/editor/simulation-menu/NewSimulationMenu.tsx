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
import { useCallback, useContext, useEffect, useState } from "react";
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
    name: z.string().min(2).max(50),
    map_uid: z.string().min(2).max(50),
});
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useSimulationContext } from "@/hooks/useSimulationContext";
type MapItem = {
    uid: string;
    name: string;
};
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import SimulationService from "@/api/Simulation";
import { toast } from "@/hooks/use-toast";

export function MapSelectorCombobox({ onChange }) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<MapItem>({ uid: "", name: "" });
    const [list, setList] = useState([]);
    const { listMapMeta } = useContext(SimulationContext);

    useEffect(() => {
        listMapMeta().then((response) =>
            setList(() => {
                return response?.data ?? [];
            })
        );
    }, []);

    return (
        <div>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-[100%] justify-between"
                    >
                        {value.uid != "" ? value.name : "Select Map..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[100%] p-0">
                    <Command>
                        <CommandInput placeholder="Search Map..." />
                        <CommandList>
                            <CommandEmpty>No Map found.</CommandEmpty>
                            <CommandGroup>
                                {list.map((l) => (
                                    <CommandItem
                                        key={l.name}
                                        value={l.name}
                                        onSelect={() => {
                                            const newValue = {
                                                name: l.name,
                                                uid: l.uid,
                                            };
                                            setValue(
                                                newValue === value
                                                    ? ""
                                                    : newValue
                                            );
                                            onChange(
                                                newValue.uid === value.uid
                                                    ? ""
                                                    : newValue.uid
                                            );
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value.uid === l.uid
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        {l.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}

const NewSimulationMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { simulationMeta, loadMap, newSimulation, loadSimulationMeta } =
        useContext(SimulationContext);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "New Simulation",
            map_uid: "",
        },
    });
    async function onSubmit(values: z.infer<typeof formSchema>) {
        await SimulationService()
            .createSimulation(values)
            .then((response) => {
                if (response.data.uid) {
                    toast({
                        title: "Success",
                        description: "Simulation created. Loading map...",
                    });
                    loadSimulationMeta(response.data.uid);
                } else {
                    throw new Error("Invalid server response");
                }
            })
            .catch((e) =>
                toast({
                    variant: "destructive",
                    title: "Error",
                    description:
                        "Error creating simulation " +
                        e.message +
                        " try again later",
                })
            );
        setIsOpen(false);
    }
    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
                <MenubarItem
                    onSelect={(e) => {
                        e.preventDefault();
                        setIsOpen(true);
                    }}
                >
                    New
                </MenubarItem>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>New Simulation</DrawerTitle>{" "}
                    <div className="p-4 pb-0">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-8"
                            >
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="New Simulation"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Simulation Name
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="map_uid"
                                    render={({
                                        field: {
                                            onChange,
                                            onBlur,
                                            value,
                                            name,
                                            ref,
                                        },
                                    }) => (
                                        <FormItem>
                                            <FormLabel>Map</FormLabel>

                                            <MapSelectorCombobox
                                                onChange={onChange}
                                            />

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit">Submit</Button>
                            </form>
                        </Form>
                    </div>
                </DrawerHeader>
            </DrawerContent>
        </Drawer>
    );
};

export default NewSimulationMenu;
