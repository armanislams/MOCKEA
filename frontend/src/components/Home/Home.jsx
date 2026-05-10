import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CTASection from './CTASection';
import { LandingStack } from './LandingStack';
import { Hero } from './Hero';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  
  const cardsRef = useRef(null);

  useEffect(() => {
    

    // Cards animation (scroll triggered staggered fade up)
    gsap.fromTo(
      cardsRef.current.children,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardsRef.current,
          start: 'top 85%',
        },
      }
    );
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="grow">
        {/* Hero Section */}
        <Hero />

        <CTASection ref={cardsRef} />

        {/* New Landing Stack */}
        <LandingStack />
        
        {/* how it works */}
        {/* <HowItWorks/> */}
      </main>

      
    </div>
  );
};

export default Home;