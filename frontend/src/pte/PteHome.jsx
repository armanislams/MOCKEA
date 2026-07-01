import PteHero from './PteHero';
import { PteLandingStack } from './PteLandingStack';
import PteModules from './PteModules';
import PteScoreConverter from './PteScoreConverter';

const PteHome = () => {
  return (
    <div id='pte-home' className="flex flex-col bg-[#FAF9F6] relative">
      <main className="grow">
        {/* PTE Hero Section */}
        <PteHero />

        {/* PTE Modules Structure Section */}
        <PteModules />

        {/* PTE Landing Stack (How It Works, Task Cards, Pricing) */}
        <PteLandingStack />

        {/* PTE to IELTS Score Conversion Reference */}
        <PteScoreConverter />
      </main>
    </div>
  );
};

export default PteHome;
