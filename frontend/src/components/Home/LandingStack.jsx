import { HowItWorks } from "./HowItWorks";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Pricing } from "./Pricing";
import { TaskCards } from "./TaskCards";
import { Testimonials } from "./Testimonials";
import { FreeResources } from "./FreeResources";
import { CTASection2 } from "./CTASection2";
import CTASection from "./CTASection";

gsap.registerPlugin(ScrollTrigger);

export const LandingStack = () => {
     const cardsRef = useRef(null);
    const featureCardsRef = useRef(null);
    const testimonialsRef = useRef(null);
    const resourcesRef = useRef(null);

    useEffect(() => {

        // cta section 1
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



        // task cards animation
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

        // Testimonials animation
        if (testimonialsRef.current) {
            gsap.fromTo(
                testimonialsRef.current.children,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: testimonialsRef.current,
                        start: 'top 85%',
                    },
                }
            );
        }

        // Resources animation
        if (resourcesRef.current) {
            gsap.fromTo(
                resourcesRef.current.children,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: resourcesRef.current,
                        start: 'top 85%',
                    },
                }
            );
        }
    }, []);
    return (
      <section className=" bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* cta section 1 */}
          <CTASection ref={cardsRef} />

          {/* cta section 2 */}
          <CTASection2 />

          {/* how it works */}
          <HowItWorks />

          {/* card section */}
          <TaskCards ref={featureCardsRef} />

          {/* testimonials */}
          <Testimonials ref={testimonialsRef} />

          {/* free resources */}
          <FreeResources ref={resourcesRef} />

          {/* pricing */}
          <Pricing />
        </div>
      </section>
    );
}