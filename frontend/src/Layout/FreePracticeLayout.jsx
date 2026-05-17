import { Outlet } from "react-router";
import Navbar from "../components/Home/Navbar";
import Footer from "../components/Home/Footer";

// Premium free‑practice layout with a subtle gradient background
const FreePracticeLayout = () => {
  return (
    <div className="min-h-screen ">
      <Navbar/>
      <main className=" ">
        {/* Outlet renders the child routes (library, test env) */}
        <Outlet />
      </main>
      <Footer/>
    </div>
  );
};

export default FreePracticeLayout;
