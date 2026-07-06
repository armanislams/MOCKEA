import { FaBook } from "react-icons/fa";
import { MdLogin } from "react-icons/md";
import { IoAnalytics } from "react-icons/io5";

const StepCardShell = ({ children, variant }) => {
  const isBlue = variant === "blue";
  return (
    <div
      className={
        isBlue
          ? "flex h-52 w-40 shrink-0 flex-col items-center justify-center rounded-lg bg-[#0028a2] p-4 shadow-sm"
          : "flex h-52 w-40 shrink-0 flex-col items-center justify-center gap-4 rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
      }
    >
      {children}
    </div>
  );
};

const DottedRule = () => (
  <div
    className="hidden h-0 min-w-6 flex-1 border-t-2 border-dotted border-gray-300 md:block"
    aria-hidden
  />
);

export const PteHowItWorks = () => {
  return (
    <div className="rounded-[3rem] bg-white py-16 px-6 sm:px-12 border border-gray-100 shadow-md">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#0028a2] bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
          Simple Stepper
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          How It Works
        </h2>
        <p className="mt-4 text-gray-500 font-medium">
          Start your preparation journey with Mockea in three simple, streamlined steps.
        </p>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 md:grid-cols-3 md:gap-6 lg:gap-10">
        {/* Step 1 */}
        <div className="flex flex-col items-center">
          <div className="flex w-full max-w-44 items-center justify-center md:max-w-none">
            <StepCardShell>
              <MdLogin size={60} className="text-[#E30613]" />
              <div className="w-full space-y-2 px-1">
                <div className="mx-auto h-2 w-[85%] rounded-full bg-gray-200" />
                <div className="mx-auto h-2 w-[55%] rounded-full bg-gray-200" />
              </div>
            </StepCardShell>
            <DottedRule />
          </div>
          <h3 className="mt-6 text-center text-base font-bold text-[#000f38]">
            1. Register &amp; Login
          </h3>
          <p className="mt-2 max-w-xs text-center text-sm leading-relaxed text-[#6B7280]">
            Create your Mockea account in just a few seconds and gain access to the full practice suite.
          </p>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-center">
          <div className="flex w-full max-w-44 items-center justify-center md:max-w-none">
            <DottedRule />
            <StepCardShell variant="blue">
              <FaBook size={60} className="text-white" />
            </StepCardShell>
            <DottedRule />
          </div>
          <h3 className="mt-6 text-center text-base font-bold text-[#000f38]">
            2. Practice PTE Layouts
          </h3>
          <p className="mt-2 max-w-xs text-center text-sm leading-relaxed text-[#6B7280]">
            Focus on specific PTE question types (e.g. Write From Dictation, Fill in the Blanks) inside an exact Pearson interface clone.
          </p>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center">
          <div className="flex w-full max-w-44 items-center justify-center md:max-w-none">
            <DottedRule />
            <StepCardShell>
              <IoAnalytics size={70} className="text-[#E30613]" />
            </StepCardShell>
          </div>
          <h3 className="mt-6 text-center text-base font-bold text-[#000f38]">
            3. AI Scoring (10-90)
          </h3>
          <p className="mt-2 max-w-xs text-center text-sm leading-relaxed text-[#6B7280]">
            Submit your answers and get instantaneous diagnostic score updates mapped directly to Pearson global scoring standards.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PteHowItWorks;
