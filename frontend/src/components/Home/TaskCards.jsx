import { forwardRef } from "react";
import { FaChartLine, FaCommentDots, FaMedal, FaRegLightbulb } from "react-icons/fa";

export const TaskCards = forwardRef((props, ref) => {
  return (
    <div
      ref={ref}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <style>{`
        .flip-card {
          perspective: 1000px;
          height: 260px;
          background-color: transparent;
        }
        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }
        .flip-card:hover .flip-card-inner {
          transform: rotateY(180deg);
        }
        .flip-card-front, .flip-card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 2rem; /* rounded-3xl */
          box-shadow: 0 4px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
        }
        .flip-card-front {
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
          transition: border-color 0.3s ease;
        }
        .flip-card:hover .flip-card-front {
          border-color: transparent;
        }
        .flip-card-back {
          transform: rotateY(180deg);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
          border: 1px solid transparent;
        }
      `}</style>

      {/* Card 1 */}
      <div className="flip-card group">
        <div className="flip-card-inner">
          <div className="flip-card-front p-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-primary shadow-inner transition-colors group-hover:bg-white/10">
              <FaChartLine size={28} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Instant Feedback
            </h3>
          </div>
          <div className="flip-card-back bg-cta-btn text-white p-8">
            <div className="h-10 w-10 rounded-xl bg-white/20 text-white flex items-center justify-center mb-4 backdrop-blur-md">
              <FaChartLine size={20} />
            </div>
            <h3 className="text-xl font-black mb-2 tracking-tight">
              Instant Feedback
            </h3>
            <p className="text-white/90 text-sm font-semibold leading-relaxed">
              Get immediate results and explanations after each practice test.
            </p>
          </div>
        </div>
      </div>

      {/* Card 2 */}
      <div className="flip-card group">
        <div className="flip-card-inner">
          <div className="flip-card-front p-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-primary shadow-inner">
              <FaRegLightbulb size={28} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Skill Building
            </h3>
          </div>
          <div className="flip-card-back bg-cta-btn text-white p-8">
            <div className="h-10 w-10 rounded-xl bg-white/20 text-white flex items-center justify-center mb-4 backdrop-blur-md">
              <FaRegLightbulb size={20} />
            </div>
            <h3 className="text-xl font-black mb-2 tracking-tight">
              Skill Building
            </h3>
            <p className="text-white/90 text-sm font-semibold leading-relaxed">
              Improve listening, reading, writing and speaking with focused modules.
            </p>
          </div>
        </div>
      </div>

      {/* Card 3 */}
      <div className="flip-card group">
        <div className="flip-card-inner">
          <div className="flip-card-front p-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0028a1] shadow-inner">
              <FaMedal size={28} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Performance Tracking
            </h3>
          </div>
          <div className="flip-card-back bg-cta-btn text-white p-8">
            <div className="h-10 w-10 rounded-xl bg-white/20 text-white flex items-center justify-center mb-4 backdrop-blur-md">
              <FaMedal size={20} />
            </div>
            <h3 className="text-xl font-black mb-2 tracking-tight">
              Performance Tracking
            </h3>
            <p className="text-white/90 text-sm font-semibold leading-relaxed">
              Monitor your progress with clear analytics and improvement suggestions.
            </p>
          </div>
        </div>
      </div>

      {/* Card 4 */}
      <div className="flip-card group">
        <div className="flip-card-inner">
          <div className="flip-card-front p-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0028a1] shadow-inner">
              <FaCommentDots size={28} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Expert Guidance
            </h3>
          </div>
          <div className="flip-card-back bg-cta-btn text-white p-8">
            <div className="h-10 w-10 rounded-xl bg-white/20 text-white flex items-center justify-center mb-4 backdrop-blur-md">
              <FaCommentDots size={20} />
            </div>
            <h3 className="text-xl font-black mb-2 tracking-tight">
              Expert Guidance
            </h3>
            <p className="text-white/90 text-sm font-semibold leading-relaxed">
              Access tips, resources, and task-specific support to refine your exam skills.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});