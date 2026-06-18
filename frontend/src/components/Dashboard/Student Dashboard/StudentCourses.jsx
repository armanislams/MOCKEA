import { motion } from "framer-motion";
import { PiNotebookBold, PiPlayCircleBold, PiCheckCircleBold, PiClockBold, PiVideoCameraBold } from "react-icons/pi";

const ENROLLED_COURSES = [
  {
    id: "active-ielts",
    title: "IELTS Premium Band 8.0 Comprehensive Prep",
    modules: "Module 3 of 12: Advanced Writing Layouts",
    progress: 35,
    instructor: "Trainer Sarah Jenkins (Ex-Examiner)",
    nextLive: "June 4, 2026 - 10:00 AM UTC",
    lessons: [
      { id: "l1", title: "Introduction to Task 1 Report Writing", duration: "12m", completed: true },
      { id: "l2", title: "Structuring Task 2 Essay Contexts", duration: "25m", completed: true },
      { id: "l3", title: "Coherence & Cohesion Cohesion Rules", duration: "18m", completed: false },
      { id: "l4", title: "Lexical Resources & High-Band Vocabulary", duration: "22m", completed: false }
    ]
  }
];

export default function StudentCourses() {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-2 pb-20 font-sans text-slate-800">
      {/* Header */}
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
          <PiNotebookBold /> Enrolled Student Courses
        </div>
        <h2 className="text-5xl font-black tracking-tighter text-slate-800">Your <span className="text-primary italic">Learning Portal</span></h2>
        <p className="text-slate-400 font-medium text-lg">Master standardized grammar, vocabulary, and exam strategies.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Side: Active Course Player and Lessons */}
        <div className="lg:col-span-8 space-y-8">
          {ENROLLED_COURSES.map(course => (
            <div key={course.id} className="card bg-white p-8 rounded-[3rem] border border-base-300 shadow-sm space-y-8">
              {/* Course Title and details */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">{course.title}</h3>
                  <p className="text-xs font-semibold text-slate-400">{course.instructor}</p>
                </div>
                <div className="text-left md:text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 block mb-1">Current Position</span>
                  <span className="text-xs font-black text-slate-700 bg-primary/5 border border-primary/10 rounded-xl px-3 py-1.5">{course.modules}</span>
                </div>
              </div>

              {/* Video Player Placeholder */}
              <div className="rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-inner relative aspect-video bg-slate-900 flex items-center justify-center text-white">
                <div className="absolute inset-0 bg-cover bg-center opacity-40 blur-xs" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80')` }}></div>
                <div className="relative z-10 flex flex-col items-center justify-center gap-4 text-center p-6">
                  <PiPlayCircleBold className="text-7xl text-white hover:scale-105 active:scale-95 cursor-pointer transition-all shadow-xl shadow-primary/20" />
                  <div>
                    <h4 className="text-lg font-black tracking-tight leading-none mb-1">Lecture 3.3: Coherence & Cohesion</h4>
                    <p className="text-xs font-semibold text-white/70">Up Next · 18 Minutes</p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider text-slate-400">
                  <span>Course Progress</span>
                  <span className="text-primary">{course.progress}% Completed</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${course.progress}%` }}
                    className="absolute inset-y-0 left-0 bg-primary rounded-full shadow-[0_0_12px_rgba(99,102,241,0.2)]"
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>

              {/* Lesson Items */}
              <div className="space-y-4 pt-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Module Lessons Checklist</h4>
                <div className="grid gap-3">
                  {course.lessons.map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${
                        lesson.completed
                          ? "bg-emerald-50/20 border-emerald-500/10 text-slate-700"
                          : "bg-slate-50/50 border-slate-200/80 hover:border-primary/20 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          lesson.completed ? "bg-emerald-500 text-white" : "bg-white border border-slate-300 text-slate-500"
                        }`}>
                          {lesson.completed ? <PiCheckCircleBold className="text-lg" /> : idx + 1}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${lesson.completed ? "text-slate-500 line-through" : "text-slate-800"}`}>
                            {lesson.title}
                          </p>
                          <span className="text-[10px] font-black uppercase tracking-wide text-slate-400 flex items-center gap-1 mt-0.5"><PiClockBold /> {lesson.duration}</span>
                        </div>
                      </div>
                      <button className={`btn btn-sm rounded-xl px-4 font-black text-[10px] uppercase tracking-wider ${
                        lesson.completed ? "btn-ghost text-slate-400" : "btn-primary shadow-md"
                      }`}>
                        {lesson.completed ? "Review" : "Start Video"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Tutor Session and live schedule */}
        <div className="lg:col-span-4 space-y-8">
          {/* Live Session Schedule */}
          <div className="card bg-slate-900 p-8 rounded-[3rem] text-white relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 text-white/5 text-9xl pointer-events-none select-none">
              <PiVideoCameraBold />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                  <PiVideoCameraBold className="text-xl" />
                </div>
                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Live Virtual Session</h4>
                  <p className="font-black tracking-tight leading-none mt-0.5">IELTS Speaking Practice Slot</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">Live Zoom Meeting</span>
                <p className="text-sm font-bold text-white leading-relaxed">{ENROLLED_COURSES[0].nextLive}</p>
              </div>

              <p className="text-xs text-white/60 font-semibold leading-relaxed">
                Meet your expert IELTS reviewer live on video call. We will go through speaking Part 1, Part 2, and Part 3 prompts with real-time corrections.
              </p>

              <button className="btn btn-block rounded-2xl h-14 bg-primary text-white border-none font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
                Join Classroom
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
