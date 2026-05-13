
import { Hero } from './Hero';
import { lazy } from 'react';
import Hero2 from './Hero2';

const LandingStack = lazy(() => import('./LandingStack').then(module => ({ default: module.LandingStack })))

const Home = () => {
return (
    <div id='home' className="flex flex-col bg-white">
      <main className="grow">

        {/* Hero Section */}
        {/* <Hero /> */}
        <Hero2/>

        {/* New Landing Stack */}
        <LandingStack />
        
       </main>

      
    </div>
  );
};

export default Home;