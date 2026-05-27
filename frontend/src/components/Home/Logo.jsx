import { Link } from "react-router";

export const Logo = () => {
  return (
    <Link
      to="/"
      className=" cursor-pointer select-none group focus:outline-none"
    >
      <img
        src="/mockea-logo.png"
        alt="MOCKEA Logo"
        className="h-12 w-auto md:h-14 object-contain transition-all duration-300 ease-out group-hover:scale-105 group-hover:-translate-y-0.5 active:scale-95"
      />
    </Link>
  );
};
