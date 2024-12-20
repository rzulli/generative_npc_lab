import axios from "axios";
import { emptyMap } from "@/context/SimulationContext";
import { toast } from "@/hooks/use-toast";

export default function SimulationService() {
    const createSimulation = (values) => {
        return axios.post(
            "http://localhost:5000/api/v1/simulation/meta",
            values
        );
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
    };
}
