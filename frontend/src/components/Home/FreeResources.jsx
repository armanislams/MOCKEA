import { forwardRef } from "react";
import { FaBook, FaCheckCircle, FaRegLightbulb } from "react-icons/fa";

export const FreeResources = forwardRef((props, ref) => {
    return (
      <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-200">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-900">
            Free Resources
          </p>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            Quick resources to boost your practice
          </h2>
        </div>
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="rounded-3xl border border-gray-200 p-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-[#0028a1] mb-4">
              <FaBook size={20} />
            </div>
            <p className="font-semibold text-gray-900 mb-2">
              Free Vocabulary Ebook
            </p>
            <p className="text-gray-600">
              Download a complete ebook to improve your word choice and
              accuracy.
            </p>
          </div>
          <div className="rounded-3xl border border-gray-200 p-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-[#0028a1] mb-4">
              <FaRegLightbulb size={20} />
            </div>
            <p className="font-semibold text-gray-900 mb-2">
              Tips for Writing Task 2
            </p>
            <p className="text-gray-600">
              Learn the essential structure and scoring tips for essays.
            </p>
          </div>
          <div className="rounded-3xl border border-gray-200 p-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-[#0028a1] mb-4">
              <FaCheckCircle size={20} />
            </div>
            <p className="font-semibold text-gray-900 mb-2">
              IELTS Blog Article
            </p>
            <p className="text-gray-600">
              Read expert advice on exam strategy, time management, and test
              confidence.
            </p>
          </div>
        </div>
      </div>
    );
})