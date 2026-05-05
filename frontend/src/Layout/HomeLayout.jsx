import { Outlet, useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../components/Home/Navbar";
import Footer from "../components/Home/Footer";

export default function HomeLayout() {
    const location = useLocation();

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <AnimatePresence mode="wait">
                <motion.main
                    key={location.pathname}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="grow"
                >
                    <Outlet />
                </motion.main>
            </AnimatePresence>
            <Footer />
        </div>
    )
}