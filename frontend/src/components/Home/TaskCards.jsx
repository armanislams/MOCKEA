import { forwardRef } from "react";
import { FaChartLine, FaCommentDots, FaMedal, FaRegLightbulb } from "react-icons/fa";

export const TaskCards = forwardRef((props, ref) => {
  return (
    <div
      ref={ref}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-200">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-primary mb-5">
          <FaChartLine size={24} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          Instant Feedback
        </h3>
        <p className="text-gray-600 leading-relaxed">
          Get immediate results and explanations after each practice test.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-200">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-primary mb-5">
          <FaRegLightbulb size={24} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Skill Building</h3>
        <p className="text-gray-600 leading-relaxed">
          Improve listening, reading, writing and speaking with focused modules.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-200">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-[#0028a1] mb-5">
          <FaMedal size={24} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          Performance Tracking
        </h3>
        <p className="text-gray-600 leading-relaxed">
          Monitor your progress with clear analytics and improvement
          suggestions.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-200">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-[#0028a1] mb-5">
          <FaCommentDots size={24} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">
          Expert Guidance
        </h3>
        <p className="text-gray-600 leading-relaxed">
          Access tips, resources, and task-specific support to refine your exam
          skills.
        </p>
      </div>
    </div>
  );
});