import gsap from "gsap";
import { useEffect, useRef } from "react";
import { Link } from "react-router";

export const Hero = () => {
    const heroRef = useRef(null);
    
    useEffect(() => {
      // Hero animation (staggered fade up)
      gsap.fromTo(
        heroRef.current.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          delay: 0.2,
        },
      );
    },[])
    return (
      <section className="bg-bc-navy text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl" ref={heroRef}>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight tracking-wider">
              YOUR REAL IELTS EXPERIENCE STARTS HERE
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed tracking-wider">
              Experience a realistic IELTS listening environment. Improve your
              comprehension and typing skills with our interactive module
              designed to simulate the official test conditions.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to={"/dashboard"}
                className="bg-white text-bc-navy hover:bg-gray-100 px-8 py-3 rounded-md font-bold text-lg btn-animated shadow-lg"
              >
                Start Practice
              </Link>
              <a href="/#testFormats" className="border-2 border-white text-white hover:bg-white hover:text-[#0028a1] px-8 py-3 rounded-md font-bold text-lg btn-animated shadow-lg">
                View Test Format
              </a>
            </div>
          </div>
        </div>
      </section>
    );
}