import { Link } from "react-router"

export const Logo =()=>{
    return (
        <Link
          to={"/"}
          className="text-xl font-extrabold text-cta-btn tracking-tight flex items-center gap-2 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full  flex items-center justify-center">
            <img src="/mockea-logo.png" alt="mockea logo" />
          </div>
          <span className="hidden sm:inline">MOCKEA</span>
        </Link>
    )
}