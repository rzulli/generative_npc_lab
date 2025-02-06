import { EventBus } from "@/game/EventBus";
import { toast } from "@/hooks/use-toast";
import { io, Socket } from "socket.io-client";

class SocketClient {
    socket: Socket | null = null;

    connect() {
        this.socket = io("http://localhost:5000/simulation/instance/", {
            transports: ["websocket"],
            upgrade: false,
        });
        return new Promise<void>((resolve, reject) => {
            this.socket?.on("connected", (data) => {
                console.debug(data);
                toast({ title: "Connected to backend" });
            });

            this.socket?.on("connect_error", (e) => {
                console.debug(JSON.stringify(e));
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Error connecting to simulation: " + e.message,
                });
                this.socket?.disconnect();
                reject(e);
            });
            this.socket?.on("connect", () => resolve());
        });
    }

    disconnect() {
        return new Promise<void>((resolve) => {
            this.socket?.disconnect();
            this.socket = null;
            resolve();
        });
    }

    emit(event: string, data: any) {
        return new Promise<void>((resolve, reject) => {
            if (!this.socket) return reject("No socket connection.");

            return this.socket.emit(event, { data }, (response: any) => {
                console.log(event, data, response);
                // Response is the optional callback that you can use with socket.io in every request. See 1 above.
                if (response?.error) {
                    console.error(response.error);
                    return reject(response.error);
                }

                return resolve();
            });
        });
    }

    on(event: string, fun: (...args: any[]) => void) {
        // No promise is needed here, but we're expecting one in the middleware.
        return new Promise<void>((resolve, reject) => {
            if (!this.socket) return reject("No socket connection.");
            console.debug("on", event, fun);
            this.socket.on(event, fun);
            resolve();
        });
    }
}

export default SocketClient;
