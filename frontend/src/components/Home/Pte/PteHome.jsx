import PteHero from './PteHero';
import { PteLandingStack } from './PteLandingStack';

const PteHome = () => {
  return (
    <div id='pte-home' className="flex flex-col bg-[#FAF9F6] relative">
      <main className="grow">
        {/* PTE Hero Section */}
        <PteHero />

        {/* PTE Landing Stack */}
        <PteLandingStack />
      </main>
    </div>
  );
};

export default PteHome;
