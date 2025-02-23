import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import RootLayout from "./Layout.tsx";
import { SimulationProvider } from "./hooks/useSimulationContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
    <RootLayout>
        <React.StrictMode>
            <SimulationProvider>
                <App />
            </SimulationProvider>
        </React.StrictMode>
    </RootLayout>
);

