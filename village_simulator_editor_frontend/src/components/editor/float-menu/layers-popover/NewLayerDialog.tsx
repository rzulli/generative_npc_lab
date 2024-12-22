import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { SimulationContext } from "@/hooks/useSimulationContext";
import { EventBus } from "@/game/EventBus";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { Database, Map, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import { FormField } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";

interface NewLayerDialogProps {}

const NewLayerFormSchema = z.object({
    is_data_layer: z.boolean().default(false),
    layer_name: z.string().default(""),
    layer_depth: z.number().default(0).optional(),
    layer_offset_x: z.number().default(0).optional(),
    layer_offset_y: z.number().default(0).optional(),
});

const NewLayerDialog: React.FC<NewLayerDialogProps> = () => {
    const form = useForm<z.infer<typeof NewLayerFormSchema>>({
        resolver: zodResolver(NewLayerFormSchema),
        defaultValues: {},
    });

    function onSubmit() {}

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Plus />{" "}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Layer</DialogTitle>
                    <DialogDescription>Create new layer</DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <div className="grid gap-4 py-4">
                            <FormField
                                control={form.control}
                                name="is_data_layer"
                                render={({ field }) => (
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label
                                            htmlFor="name"
                                            className="text-right"
                                        >
                                            Type
                                        </Label>
                                        <div className="col-span-3 flex gap-3 items-center ">
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                            {field.value ? (
                                                <>
                                                    <Database /> Data Layer
                                                </>
                                            ) : (
                                                <>
                                                    <Map /> Tile Layer
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="layer_name"
                                render={({ field }) => (
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label
                                            htmlFor="name"
                                            className="text-right"
                                        >
                                            Name
                                        </Label>
                                        <Input
                                            value={field.value}
                                            className="col-span-3"
                                            onChange={field.onChange}
                                        />
                                    </div>
                                )}
                            />
                            {!form.watch("is_data_layer") && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="layer_depth"
                                        render={({ field }) => (
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label
                                                    htmlFor="name"
                                                    className="text-right"
                                                >
                                                    Layer Depth
                                                </Label>
                                                <Input
                                                    type="number"
                                                    value={field.value}
                                                    className="col-span-3"
                                                    onChange={field.onChange}
                                                />
                                            </div>
                                        )}
                                    />
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label
                                            htmlFor="name"
                                            className="text-right"
                                        >
                                            Offset
                                        </Label>
                                        <FormField
                                            control={form.control}
                                            name="layer_offset_x"
                                            render={({ field }) => (
                                                <div className="col-span-1 flex items-center gap-2">
                                                    x:
                                                    <Input
                                                        type="number"
                                                        value={field.value}
                                                        onChange={
                                                            field.onChange
                                                        }
                                                    />
                                                </div>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="layer_offset_y"
                                            render={({ field }) => (
                                                <div className="col-span-1 flex items-center gap-2">
                                                    y:
                                                    <Input
                                                        type="number"
                                                        value={field.value}
                                                        onChange={
                                                            field.onChange
                                                        }
                                                    />
                                                </div>
                                            )}
                                        />
                                    </div>
                                </>
                            )}{" "}
                        </div>
                    </form>
                </Form>

                <DialogFooter>
                    <Button type="submit">Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default NewLayerDialog;
