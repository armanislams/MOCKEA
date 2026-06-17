import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router";
import { PiBookOpenBold, PiGraduationCapBold, PiClockBold, PiPlayCircleBold, PiStarBold } from "react-icons/pi";

const COURSES = [
  {
    id: "ielts-masterclass",
    title: "IELTS Ultimate Band 8+ Masterclass",
    category: "IELTS",
    duration: "40 Hours",
    lectures: "56 Lectures",
    rating: "4.9",
    price: "$129",
    tag: "Best Seller",
    bg: "from-blue-600 to-indigo-700",
    description: "Go from band 6 to 8+ with complete structured practice modules covering Writing Task 1 & 2, active Listening labs, and interactive Speaking mock interviews.",
  },
  {
    id: "pte-academic-boost",
    title: "PTE Academic Exam Booster 79+",
    category: "PTE Academic",
    duration: "30 Hours",
    lectures: "42 Lectures",
    rating: "4.8",
    price: "$99",
    tag: "Popular",
    bg: "from-purple-600 to-pink-700",
    description: "Accelerate your PTE score with real exam gapped templates, core Read Aloud analysis, automated Describe Image guidelines, and machine-graded mock logs.",
  },
  {
    id: "ielts-writing-intensive",
    title: "IELTS Writing Task 1 & 2 Specialization",
    category: "IELTS Focus",
    duration: "15 Hours",
    lectures: "20 Lectures",
    rating: "4.9",
    price: "$49",
    tag: "Skill Booster",
    bg: "from-orange-500 to-red-600",
    description: "A highly targeted program designed to unlock band 8.0 in academic composition. Contains curated band 9 structures, examiner guides, and auto-review audits.",
  }
];

export default function CoursesPage() {
  return (
    <div className="bg-[#FDFDFB] min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        {/* Decorative elements */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-100/30 rounded-full filter blur-3xl -z-10" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-100/20 rounded-full filter blur-3xl -z-10" />

        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-cta-btn bg-red-50 border border-red-100 rounded-full mb-4"
          >
            <PiGraduationCapBold className="w-3.5 h-3.5 animate-pulse text-cta-btn" />
            Standard Prep Programs
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black text-[#000f38] tracking-tight mb-4"
          >
            Succeed with Expert-Led Courses
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-600 leading-relaxed"
          >
            Accelerate your exam preparation with highly structured video masterclasses, detailed gapped prompt worksheets, and certified strategies created by native tutors.
          </motion.p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {COURSES.map((course, idx) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20, delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-white border border-slate-200/80 rounded-[2.5rem] shadow-sm hover:shadow-2xl overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Image / Header Gradient block */}
                <div className={`bg-gradient-to-r ${course.bg} h-48 p-8 flex flex-col justify-between text-white relative`}>
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    {course.tag}
                  </div>
                  <PiBookOpenBold className="text-4xl text-white/90" />
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/70 block mb-1">
                      {course.category}
                    </span>
                    <h3 className="text-xl font-bold tracking-tight leading-snug">
                      {course.title}
                    </h3>
                  </div>
                </div>

                {/* Description & metadata */}
                <div className="p-8 space-y-6">
                  <p className="text-slate-500 font-medium text-sm leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-5 text-slate-400 text-xs font-black uppercase tracking-wide border-t border-slate-100 pt-5">
                    <span className="flex items-center gap-1.5"><PiClockBold className="text-primary text-sm" /> {course.duration}</span>
                    <span className="flex items-center gap-1.5"><PiPlayCircleBold className="text-primary text-sm" /> {course.lectures}</span>
                    <span className="flex items-center gap-1"><PiStarBold className="text-amber-500 text-sm fill-amber-500" /> {course.rating}</span>
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="px-8 pb-8 flex items-center justify-between border-t border-slate-100 pt-5 bg-slate-50/20 rounded-b-[2.5rem]">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">One-time payment</span>
                  <span className="text-2xl font-black text-[#000f38]">{course.price}</span>
                </div>
                <Link
                  to="/auth/register"
                  className="bg-cta-btn hover:bg-red-600 text-white font-extrabold px-6 py-3 rounded-2xl shadow-xl shadow-red-500/20 text-xs uppercase tracking-wider active:scale-98 transition-all"
                >
                  Enroll Now →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
