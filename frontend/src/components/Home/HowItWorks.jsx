import { FaBook } from "react-icons/fa";
import { MdLogin } from "react-icons/md";
import { IoAnalytics } from "react-icons/io5";

const StepCardShell = ({ children, variant }) => {
  const isNavy = variant === "navy";
  return (
    <div
      className={
        isNavy
          ? "flex h-52 w-40 shrink-0 flex-col items-center justify-center rounded-lg bg-primary p-4 shadow-sm"
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

export const HowItWorks = () => {
  return (
    <div className="rounded-2xl bg-[#F9FAFB] py-12 px-4 sm:px-8">
      <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-[#001529] md:mb-14 md:text-4xl">
        How It Works
      </h2>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 md:grid-cols-3 md:gap-6 lg:gap-10">
        {/* Step 1 */}
        <div className="flex flex-col items-center">
          <div className="flex w-full max-w-44 items-center justify-center md:max-w-none">
            <StepCardShell>
              <MdLogin size={60} />
              <div className="w-full space-y-2 px-1">
                <div className="mx-auto h-2 w-[85%] rounded-full bg-gray-200" />
                <div className="mx-auto h-2 w-[55%] rounded-full bg-gray-200" />
              </div>
            </StepCardShell>
            <DottedRule />
          </div>
          <h3 className="mt-6 text-center text-base font-bold text-[#001529]">
            1. Register &amp; Login
          </h3>
          <p className="mt-2 max-w-xs text-center text-sm leading-relaxed text-[#6B7280]">
            Register and create a Mockea account in just a few seconds.
          </p>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col items-center">
          <div className="flex w-full max-w-44 items-center justify-center md:max-w-none">
            <DottedRule />
            <StepCardShell variant="navy">
              <FaBook size={60} color="white"/>
            </StepCardShell>
            <DottedRule />
          </div>
          <h3 className="mt-6 text-center text-base font-bold text-[#001529]">
            2. Choose a Module
          </h3>
          <p className="mt-2 max-w-xs text-center text-sm leading-relaxed text-[#6B7280]">
            Take a full mock test or focus on specific modules to double your
            chances.
          </p>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center">
          <div className="flex w-full max-w-44 items-center justify-center md:max-w-none">
            <DottedRule />
            <StepCardShell>
              <IoAnalytics size={70} color="red" />
            </StepCardShell>
          </div>
          <h3 className="mt-6 text-center text-base font-bold text-[#001529]">
            3. Get Results &amp; Improve
          </h3>
          <p className="mt-2 max-w-xs text-center text-sm leading-relaxed text-[#6B7280]">
            Receive detailed feedback for specific and progressive results.
          </p>
        </div>
      </div>
    </div>
  );
};
