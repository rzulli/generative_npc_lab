import { Toaster } from "./components/ui/toaster";
import "./index.css";
export default function RootLayout({ children }) {
    return (
        <>
            <main>{children}</main>
            <Toaster />
        </>
    );
}
