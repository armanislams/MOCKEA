import { forwardRef } from "react";

export const Testimonials = forwardRef((props, ref) => {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-200">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-900">
            Testimonials
          </p>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            Success stories from our learners
          </h2>
        </div>
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="rounded-3xl bg-blue-50 p-6">
            <p className="text-gray-900 font-semibold mb-3">
              From 5.5 to 7.5 in 2 weeks
            </p>
            <p className="text-gray-600">
              “The mock tests and analytics helped me focus on the right skills
              fast.”
            </p>
          </div>
          <div className="rounded-3xl bg-blue-50 p-6">
            <p className="text-gray-900 font-semibold mb-3">
              From 5.5 to 7.5 in 3 weeks
            </p>
            <p className="text-gray-600">
              “I loved the structure and instant feedback on every practice
              section.”
            </p>
          </div>
          <div className="rounded-3xl bg-blue-50 p-6">
            <p className="text-gray-900 font-semibold mb-3">
              From 5.5 to 7.5 in 5 weeks
            </p>
            <p className="text-gray-600">
              “The learning path kept me motivated and improved my confidence.”
            </p>
          </div>
        </div>
      </div>
    );
})