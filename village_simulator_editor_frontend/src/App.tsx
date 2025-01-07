import { useState } from "react";
import { useToast } from "./hooks/use-toast";
import SimulationEditor from "./SimulationEditor";

import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./Home";
import About from "./About";
import SimulationPlayer from "./SimulationPlayer";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<SimulationEditor />} />
                <Route path="/run" element={<SimulationPlayer />} />
            </Routes>
        </BrowserRouter>
    );
}

