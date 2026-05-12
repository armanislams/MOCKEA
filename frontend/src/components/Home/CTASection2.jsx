import { Link } from "react-router";

export const CTASection2 = () => {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-200">
        <div className="flex flex-col items-center text-center gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-900">
              Start your IELTS journey
            </p>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-gray-900">
              Practice with real IELTS-style tests and build confidence faster
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              Choose your module, access free resources, and track your progress
              through structured training designed for real exam success.
            </p>
          </div>

          <div className="flex sm:flex-row gap-4">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-full border-2 font-bold border-bc-navy px-8 py-3 shadow-sm btn-animated"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full border  bg-cta-btn px-8 py-3 text-white font-bold shadow-sm btn-animated"
            >
              Try For Free...
            </Link>
          </div>
        </div>
      </div>
    );
}