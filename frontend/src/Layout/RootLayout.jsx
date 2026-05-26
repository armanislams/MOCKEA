import { Outlet } from "react-router";
import ScrollToTop from "../hooks/ScrollToTop";

export default function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}
