import { Outlet } from "react-router";
import Navbar from "../components/Home/Navbar";
import Footer from "../components/Home/Footer";

export default function HomeLayout() {
    return (
        <>
        <Navbar/>
        <Outlet/>
        <Footer/>
        </>
    )
}