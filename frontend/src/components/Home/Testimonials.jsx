import { forwardRef, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const ITEMS = [
  {
    title: "From 5.5 to 7.5 in 2 weeks!",
    quote:
      "The practice material was exactly like the real exam. Mockea's feedback system helped me identify my weak spots in writing instantly.",
    name: "Priya S.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=face",
  },
  {
    title: "From 6.0 to 8.0 in 3 weeks!",
    quote:
      "I struggled with speaking for months. The live mock interviews on Mockea gave me the confidence I needed to ace the speaking part.",
    name: "Arjun K.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=face",
  },
  {
    title: "From 5.5 to 7.5 in 3 weeks!",
    quote:
      "I would highly recommend Mockea to everyone who wants to score high and achieve their dreams of studying abroad.",
    name: "Diana G.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop&crop=face",
  },
];

function TestimonialCard({ title, quote, name, image }) {
  return (
    <article
      className="relative mx-auto h-full w-full max-w-[320px] rounded-2xl bg-[#001f3f] px-6 pb-8 pt-16 shadow-lg sm:max-w-[300px] sm:rounded-3xl"
      aria-label={`Testimonial from ${name}`}
    >
      <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2">
        <img
          src={image}
          alt=""
          className="h-[88px] w-[88px] rounded-full border-[3px] border-[#001f3f] object-cover shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
          width={88}
          height={88}
          loading="lazy"
          decoding="async"
        />
      </div>
      <h3 className="text-left text-lg font-bold leading-snug text-[#ff8a80]">
        &ldquo;{title}&rdquo;
      </h3>
      <p className="mt-4 text-left text-sm italic leading-relaxed text-gray-200/90">
        &ldquo;{quote}&rdquo;
      </p>
      <p className="mt-6 text-left text-sm text-white">— {name}</p>
    </article>
  );
}

export const Testimonials = forwardRef((props, ref) => {
  const slides = useMemo(() => [...ITEMS, ...ITEMS], []);

  return (
    <div
      ref={ref}
      className="rounded-3xl border border-gray-200/80 bg-[#F8F9FA] px-4 py-10 shadow-sm sm:px-8 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 text-center sm:mb-12">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#001f3f] sm:text-3xl md:text-4xl">
            Testimonials &amp; Success Stories
          </h2>
        </header>

        <div className="testimonials-swiper-wrap pt-2">
          <Swiper
            className="testimonials-swiper pb-10!"
            modules={[Autoplay, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            loop
            loopAdditionalSlides={2}
            speed={1200}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{ clickable: true }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 28 },
              1024: { slidesPerView: 3, spaceBetween: 32 },
            }}
          >
            {slides.map((item, i) => (
              <SwiperSlide key={`${item.name}-${i}`} className="h-auto! py-2">
                <div className="flex h-full justify-center px-1 sm:px-0">
                  <TestimonialCard {...item} />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
});

Testimonials.displayName = "Testimonials";
