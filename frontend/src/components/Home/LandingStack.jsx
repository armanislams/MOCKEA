import { FaBook, FaChartLine, FaCheckCircle, FaCommentDots, FaMedal, FaRegLightbulb } from "react-icons/fa";
import { Link } from "react-router";
import { HowItWorks } from "./HowItWorks";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Pricing } from "./Pricing";

gsap.registerPlugin(ScrollTrigger);

export const LandingStack = () => {
    const featureCardsRef = useRef(null);
    const testimonialsRef = useRef(null);
    const resourcesRef = useRef(null);

    useEffect(() => {
        // Feature cards animation
        if (featureCardsRef.current) {
            gsap.fromTo(
                featureCardsRef.current.children,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: featureCardsRef.current,
                        start: 'top 85%',
                    },
                }
            );
        }

        // Testimonials animation
        if (testimonialsRef.current) {
            gsap.fromTo(
                testimonialsRef.current.children,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: testimonialsRef.current,
                        start: 'top 85%',
                    },
                }
            );
        }

        // Resources animation
        if (resourcesRef.current) {
            gsap.fromTo(
                resourcesRef.current.children,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.6,
                    stagger: 0.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: resourcesRef.current,
                        start: 'top 85%',
                    },
                }
            );
        }
    }, []);
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-200">
            <div className="flex flex-col items-center text-center gap-6">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-900">
                  Start your IELTS journey
                </p>
                <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-gray-900">
                  Practice with real IELTS-style tests and build confidence
                  faster
                </h2>
                <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                  Choose your module, access free resources, and track your
                  progress through structured training designed for real exam
                  success.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-full border-2 font-bold border-bc-navy px-8 py-3 shadow-sm transition hover:bg-[#e2e8f0] "
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-full border border-primary bg-cta-btn px-8 py-3 text-white font-bold shadow-sm transition hover:bg-[#e2e8f0]"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
          {/* how it works */}
          <HowItWorks />
          {/* card section */}
          <div
            ref={featureCardsRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <div className="rounded-3xl bg-white p-8 shadow-sm border border-gray-200">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-[#0028a1] mb-5">
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
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-[#0028a1] mb-5">
                <FaRegLightbulb size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Skill Building
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Improve listening, reading, writing and speaking with focused
                modules.
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
                Access tips, resources, and task-specific support to refine your
                exam skills.
              </p>
            </div>
          </div>

          {/* testimonials */}
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
              ref={testimonialsRef}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="rounded-3xl bg-blue-50 p-6">
                <p className="text-gray-900 font-semibold mb-3">
                  From 5.5 to 7.5 in 2 weeks
                </p>
                <p className="text-gray-600">
                  “The mock tests and analytics helped me focus on the right
                  skills fast.”
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
                  “The learning path kept me motivated and improved my
                  confidence.”
                </p>
              </div>
            </div>
          </div>

          {/* free resources */}
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
              ref={resourcesRef}
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

          {/* pricing */}
         <Pricing/>
        </div>
      </section>
    );
}