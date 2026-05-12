
import { Hero } from './Hero';
import { lazy } from 'react';

const LandingStack = lazy(() => import('./LandingStack').then(module => ({ default: module.LandingStack })))

const Home = () => {
return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="grow">

        {/* Hero Section */}
        <Hero />

        {/* New Landing Stack */}
        <LandingStack />
        
       </main>

      
    </div>
  );
};

export default Home;