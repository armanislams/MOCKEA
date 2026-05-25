import { Outlet } from "react-router";
import Navbar from "../components/Home/Navbar";
import Footer from "../components/Home/Footer";

export default function HomeLayout() {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}