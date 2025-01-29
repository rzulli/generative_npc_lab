import { Toaster } from "./components/ui/toaster";
import "./index.css";
export default function RootLayout({ children }) {
    return (
        <>
            <main className="min-h-[100vh]">{children}</main>
            <Toaster />
        </>
    );
}
