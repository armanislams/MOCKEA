// import { Hero } from './Hero';
import Hero2 from './Hero2';
import { LandingStack } from './LandingStack';



const Home = () => {
  

  return (
    <div id='home' className="flex flex-col bg-[#FAF9F6] relative">
     
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