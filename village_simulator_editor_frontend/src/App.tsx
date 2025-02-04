import { useState } from "react";
import { useToast } from "./hooks/use-toast";
import SimulationEditor from "./SimulationEditor";

import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./Home";
import About from "./About";
import SimulationPlayer from "./SimulationPlayer";
import { store } from "@/store";
import { Provider } from "react-redux";
import SocketClient from "@/store/socket-client/index";

export const socketClient = new SocketClient();

export default function App() {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<SimulationEditor />} />
                    <Route path="/run" element={<SimulationPlayer />} />
                </Routes>
            </BrowserRouter>
        </Provider>
    );
}

