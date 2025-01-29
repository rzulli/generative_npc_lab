import axios from "axios";
import { emptyMap } from "@/context/SimulationContext";
import { toast } from "@/hooks/use-toast";
import { io } from "socket.io-client";
import { EventBus } from "@/game/EventBus";

function escapeUnicode(str) {
    return str.replace(/[^\0-~]/g, function (ch) {
        return "\\u" + ("0000" + ch.charCodeAt().toString(16)).slice(-4);
    });
}
function parsePythonJsonDict(str: string) {
    const jsonString = str.replace(/'/g, '"');
    return JSON.parse(jsonString);
}

export default function SimulationService() {
    const createSimulation = (values) => {
        return axios.post(
            "http://localhost:5000/api/v1/simulation/meta",
            values
        );
    };

    const getSimulationInstance = (uid, version, callback) => {
        const eventSource = new EventSource(
            `http://localhost:5000/api/v1/simulation/instance?uid=${uid}&version=${version}`
        );

        eventSource.onmessage = (event) => {
            console.log(parsePythonJsonDict(event.data));
            const data = parsePythonJsonDict(event.data);
            callback(data);
        };

        eventSource.onerror = (e) => {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error receiving simulation events: " + e.message,
            });
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    };
    const getSimulationInstanceSocketIO = (uid, version, callback) => {
        const socket = io("http://localhost:5000/simulation/instance/", {
            transports: ["websocket"],

            upgrade: false,
        });

        socket.on("connected", (data) => {
            console.log(data);
            toast({ title: "Connected to backend" });
        });

        socket.on("spawn_agent", (data) => {
            console.log("spawn_agent", data);
            EventBus.emit("spawn_agent", data);
        });

        socket.on("connect_error", (e) => {
            console.log(JSON.stringify(e));
            toast({
                variant: "destructive",
                title: "Error",
                description: "Error connecting to simulation: " + e.message,
            });
            socket.disconnect();
        });

        return socket;
    };
    const getMap = async (map_uid, version) => {
        return await axios
            .get("http://localhost:5000/api/v1/map/meta", {
                params: { uid: map_uid, version: version },
            })
            .catch((e) => {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Error ao localizar mapa " + e.message,
                });
            });
    };

    const getSimulationMeta = async (uid, version) => {
        console.log(uid, version);
        return await axios
            .get("http://localhost:5000/api/v1/simulation/meta", {
                params: { uid: uid, version: version },
            })
            .then((response) => {
                return response.data;
            })
            .catch((e) => {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Error locating simulation " + e.message,
                });
            });
    };

    const listMapMeta = async () => {
        return await axios
            .get("http://localhost:5000/api/v1/map/meta/list")
            .catch((e) => {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Error listing maps: " + e.message,
                });
            });
    };

    const listSimulationMeta = async () => {
        return await axios
            .get("http://localhost:5000/api/v1/simulation/meta/list")
            .catch((e) => {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Error listing simulation: " + e.message,
                });
            });
    };

    return {
        createSimulation,
        getMap,
        listMapMeta,
        listSimulationMeta,
        getSimulationMeta,
        getSimulationInstance,
        getSimulationInstanceSocketIO,
    };
}
