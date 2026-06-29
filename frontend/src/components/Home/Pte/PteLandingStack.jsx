import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PteHowItWorks } from "./PteHowItWorks";
import { PteTaskCards } from "./PteTaskCards";
import { PtePricing } from "./PtePricing";

gsap.registerPlugin(ScrollTrigger);

export const PteLandingStack = () => {
    const cardsRef = useRef(null);
    const featureCardsRef = useRef(null);

    useEffect(() => {
        // task cards animation
        if (cardsRef.current) {
             gsap.fromTo(
               cardsRef.current.children,
               { opacity: 0, y: 50 },
               {
                 opacity: 1,
                 y: 0,
                 duration: 0.6,
                 stagger: 0.2,
                 ease: "power3.out",
                 scrollTrigger: {
                   trigger: cardsRef.current,
                   start: "top 85%",
                 },
               },
             );
        }

        // feature cards animation
        if (featureCardsRef.current) {
            gsap.fromTo(
                featureCardsRef.current.children,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: featureCardsRef.current,
                        start: 'top 85%',
                    },
                }
            );
        }
    }, []);

    return (
        <div className="space-y-16 py-12">
            <PteHowItWorks />
            
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6">
                <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-[#001529] md:mb-14 md:text-4xl">
                    Why Choose MOCKEA for PTE?
                </h2>
                <PteTaskCards ref={cardsRef} />
            </div>

            <PtePricing />
        </div>
    );
};

export default PteLandingStack;
