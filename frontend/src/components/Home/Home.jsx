// import { Hero } from './Hero';
import Hero2 from './Hero2';
import { lazy } from 'react';

const LandingStack = lazy(() => import('./LandingStack').then(module => ({ default: module.LandingStack })))



const Home = () => {
  

  return (
    <div id='home' className="flex flex-col bg-white relative">
     
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