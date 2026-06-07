import { Link } from "react-router-dom";

const schools = [
  "Scholastica",
  "Mastermind School",
  "Maple Leaf International School",
  "Sunnydale School",
  "Oxford International School",
  "South Breeze School",
  "DPS STS School Dhaka",
  "Playpen School",
  "Manarat Dhaka International School & College"
];

const proofNotes = [
  "Built for full school schedules",
  "Progress visibility for parents",
  "Structured revision from home",
  "Less fatigue, stronger focus"
];

const outcomes = [
  { value: "2-3 hrs", label: "saved daily from Dhaka traffic routines" },
  { value: "Weekly", label: "plan, practice, and progress monitoring" },
  { value: "On time", label: "syllabus completion with assessment rhythm" }
];

const teacherProfile = {
  name: "Md Jahid Hasan",
  degree: "BRAC University, Major in CSE",
  expertise: ["Mathematics", "Physics", "Chemistry", "Computer Science"],
  experience: "10 years of teaching experience",
  mobile: "01303074749",
  email: "mdjahidhasan6544@gmail.com"
};

const primaryContactNumber = "01303074749";
const primaryWhatsAppNumber = "8801303074749";

const problems = [
  {
    icon: "traffic",
    title: "Time lost in traffic",
    copy:
      "Students leave school and then spend hours more commuting to coaching instead of recovering, revising, or sleeping properly."
  },
  {
    icon: "monitor",
    title: "No proper coaching monitoring",
    copy:
      "Most coaching systems are too batch-heavy to detect who is slipping, who is distracted, and who needs sharper correction."
  },
  {
    icon: "energy",
    title: "Student exhaustion after school",
    copy:
      "By the time students return home, the best mental energy of the day is already gone."
  },
  {
    icon: "routine",
    title: "Poor home study consistency",
    copy:
      "Without a weekly system, practice, revision, and past paper work remain incomplete even when families are trying hard."
  }
];

const systemPillars = [
  "Structured weekly plans aligned with school workload",
  "Guided online classes with practice and correction",
  "Parent-facing progress visibility and accountability",
  "Clear syllabus completion targets and regular assessment checkpoints"
];

const steps = [
  {
    icon: "plan",
    number: "01",
    title: "Structured Weekly Plan",
    copy:
      "Students receive a disciplined weekly study structure built around school, revision, homework, and exam prep."
  },
  {
    icon: "lesson",
    number: "02",
    title: "Guided Classes + Practice",
    copy:
      "Every class connects directly to focused practice, review, and follow-through instead of passive attendance."
  },
  {
    icon: "parents",
    number: "03",
    title: "Progress Tracking for Parents",
    copy:
      "Parents see what is complete, what is pending, and where the student needs tighter support."
  }
];

const benefits = [
  "Save 2-3 hours daily otherwise lost in traffic",
  "Learn from home in a calmer routine",
  "Reduce fatigue and improve concentration",
  "Stay aligned with the Cambridge syllabus",
  "Complete the syllabus on time",
  "Give parents clearer academic confidence"
];

const testimonials = [
  {
    quote:
      "My daughter stopped wasting evenings in traffic and finally began revising with a clear system. That changed everything.",
    by: "Guardian of an O Level student, Dhaka"
  },
  {
    quote:
      "It felt lighter than coaching but much more disciplined. I always knew what came next and what I had to finish.",
    by: "Student from a Cambridge school in Dhaka"
  },
  {
    quote:
      "For the first time we could actually see progress instead of hoping the preparation was enough.",
    by: "Parent of a Grade 9 learner"
  }
];

const faqs = [
  {
    question: "Will this work alongside a full Cambridge school schedule?",
    answer:
      "Yes. The system is designed specifically for students already enrolled in Cambridge schools. The weekly structure supports school learning instead of competing with it."
  },
  {
    question: "How do parents know whether real progress is happening?",
    answer:
      "Parents get visibility into study plans, completion, revision flow, and assessment checkpoints so progress is clearer and easier to discuss at home."
  },
  {
    question: "Is the syllabus different from school or coaching?",
    answer:
      "No. The syllabus remains the same Cambridge syllabus. The difference is the system: less wasted time, better discipline, and stronger monitoring."
  },
  {
    question: "Who is this best for?",
    answer:
      "Cambridge O Level students in Dhaka who want a smarter, more efficient alternative to the school-plus-coaching-plus-traffic routine."
  }
];

function SectionTitle({ eyebrow, title, copy }) {
  return (
    <div className="max-w-3xl text-left">
      <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.28em] text-sky-300">{eyebrow}</p>
      <h2 className="font-[var(--font-display)] text-4xl leading-none tracking-[-0.03em] text-white md:text-6xl">
        {title}
      </h2>
      {copy ? <p className="mt-5 text-base leading-8 text-slate-100 md:text-lg">{copy}</p> : null}
    </div>
  );
}

function IconBadge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-sky-100 ${className}`}
    >
      {children}
    </span>
  );
}

function MarketingIcon({ name, className = "h-5 w-5" }) {
  const sharedProps = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 1.8,
    viewBox: "0 0 24 24"
  };

  switch (name) {
    case "teacher":
      return (
        <svg {...sharedProps}>
          <path d="M12 4 4 8l8 4 8-4-8-4Z" />
          <path d="M7 10.5V14c0 1.7 2.2 3 5 3s5-1.3 5-3v-3.5" />
          <path d="M20 9v5" />
        </svg>
      );
    case "degree":
      return (
        <svg {...sharedProps}>
          <path d="M3 7h18v10H3z" />
          <path d="m7 11 3 3 7-7" />
        </svg>
      );
    case "experience":
      return (
        <svg {...sharedProps}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v5l3 2" />
        </svg>
      );
    case "mobile":
      return (
        <svg {...sharedProps}>
          <rect x="8" y="3" width="8" height="18" rx="2" />
          <path d="M11 18h2" />
        </svg>
      );
    case "email":
      return (
        <svg {...sharedProps}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="m4 8 8 6 8-6" />
        </svg>
      );
    case "traffic":
      return (
        <svg {...sharedProps}>
          <path d="M5 16h14" />
          <path d="M7 16V9l3-2h4l3 2v7" />
          <circle cx="9" cy="17" r="1" />
          <circle cx="15" cy="17" r="1" />
        </svg>
      );
    case "monitor":
      return (
        <svg {...sharedProps}>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8" />
          <path d="M12 16v4" />
          <path d="m8 10 2.5 2.5L16 7" />
        </svg>
      );
    case "energy":
      return (
        <svg {...sharedProps}>
          <path d="M13 2 6 13h5l-1 9 8-12h-5l0-8Z" />
        </svg>
      );
    case "routine":
      return (
        <svg {...sharedProps}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 7v5l4 2" />
          <path d="M8 3v3" />
          <path d="M16 3v3" />
        </svg>
      );
    case "plan":
      return (
        <svg {...sharedProps}>
          <rect x="5" y="4" width="14" height="16" rx="2" />
          <path d="M8 8h8" />
          <path d="M8 12h8" />
          <path d="M8 16h5" />
        </svg>
      );
    case "lesson":
      return (
        <svg {...sharedProps}>
          <path d="M4 6.5 12 4l8 2.5v11L12 20l-8-2.5v-11Z" />
          <path d="M12 4v16" />
        </svg>
      );
    case "parents":
      return (
        <svg {...sharedProps}>
          <circle cx="9" cy="9" r="3" />
          <circle cx="16.5" cy="10.5" r="2.5" />
          <path d="M4.5 19a5 5 0 0 1 9 0" />
          <path d="M14.5 19a4 4 0 0 1 5 0" />
        </svg>
      );
    default:
      return null;
  }
}

export default function MarketingHome() {
  return (
    <div className="relative overflow-hidden bg-[#07111d] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(75,159,197,0.16),transparent_22%),radial-gradient(circle_at_90%_10%,rgba(31,110,169,0.18),transparent_18%),linear-gradient(180deg,#07111d_0%,#0a1727_48%,#07111d_100%)]" />
      <div className="pointer-events-none absolute left-[-12rem] top-24 h-80 w-80 rounded-full bg-sky-400/15 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-16 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />

      <header className="sticky top-0 z-30 border-b border-white/8 bg-[#07111d]/80 backdrop-blur-xl">
        <div className="mx-auto flex w-[min(1280px,calc(100vw-2rem))] flex-wrap items-center justify-between gap-4 py-4 lg:flex-nowrap">
          <Link className="flex items-center gap-4" to="/">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,#0a2745,#1f6ea9)] font-[var(--font-display)] text-xl font-bold text-white shadow-[0_18px_38px_rgba(10,39,69,0.22)]">
              SS
            </span>
            <div>
              <strong className="block text-base font-semibold text-white">OLevelStarsBD</strong>
              <small className="block text-sm text-slate-200">Cambridge O Level Online Program</small>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-100 lg:flex">
            <a href="#program">Program</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#comparison">Comparison</a>
            <a href="#parents">For Parents</a>
            <a href="#faq">FAQ</a>
          </nav>

          <div className="flex items-center gap-3 sm:ml-auto lg:ml-0">
            <Link
              className="hidden rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-white/20 md:inline-flex"
              to="/login"
            >
              Log in
            </Link>
            <a
              className="inline-flex rounded-full bg-[linear-gradient(135deg,#103d68,#1f6ea9)] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_38px_rgba(10,39,69,0.18)] transition hover:-translate-y-0.5"
              href="#consultation"
            >
              Book a Free Consultation
            </a>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid min-h-[calc(100svh-88px)] w-[min(1280px,calc(100vw-2rem))] items-center gap-8 py-10 lg:grid-cols-[0.84fr_1.16fr] lg:gap-12">
          <div className="pb-4 text-left lg:pb-10">
            <span className="inline-flex rounded-full border border-sky-300/18 bg-sky-300/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.24em] text-sky-200">
              Best online platform in Bangladesh
            </span>
            <h1 className="mt-6 max-w-[8ch] font-[var(--font-display)] text-6xl leading-[0.84] tracking-[-0.05em] text-white md:text-7xl lg:text-[6.7rem]">
              Same Cambridge Syllabus. Better System. Better Results.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-100 md:text-lg">
              The best online platform in Bangladesh for Cambridge students who want structure,
              sharper guidance, and real progress visibility. No traffic. No wasted hours. Just
              focused learning from home with a disciplined academic system.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                className="inline-flex rounded-full bg-[linear-gradient(135deg,#103d68,#1f6ea9)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_38px_rgba(10,39,69,0.18)] transition hover:-translate-y-0.5"
                href="#consultation"
              >
                Book a Free Consultation
              </a>
              <a
                className="inline-flex rounded-full border border-white/12 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-white/20"
                href="#program"
              >
                Explore the Program
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {proofNotes.map((item) => (
                <span
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white shadow-sm"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative self-stretch">
            <div className="rounded-[2rem] bg-[linear-gradient(180deg,rgba(10,39,69,0.98),rgba(16,61,104,0.94))] p-6 shadow-[0_34px_110px_rgba(10,39,69,0.22)] md:p-8">
              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-6 text-white">
                  <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-sky-100/80">
                    Home-based learning model
                  </p>
                  <h3 className="mt-4 font-[var(--font-display)] text-3xl leading-none tracking-[-0.03em]">
                    A calmer routine with stronger academic control.
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/90">
                    Weekly plans, guided classes, revision blocks, and parent visibility sit in one
                    clean system instead of being scattered across school, coaching, and traffic.
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white p-5">
                    <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-800">
                      Parent dashboard
                    </p>
                    <p className="mt-3 font-[var(--font-display)] text-2xl leading-none text-slate-950">
                      Plan completion, revision flow, and assessment rhythm in one place.
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white p-5 text-slate-950">
                    <p className="text-sm font-semibold text-slate-900">Built around home-based focus</p>
                    <p className="mt-3 text-sm leading-7 text-slate-700">
                      Students keep energy for real study instead of losing it on commuting between school,
                      coaching, and home.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {outcomes.map((item) => (
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/8 p-5 text-white" key={item.label}>
                    <strong className="block font-[var(--font-display)] text-3xl leading-none tracking-[-0.03em]">
                      {item.value}
                    </strong>
                    <span className="mt-3 block text-sm leading-6 text-white/90">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-1 w-[min(1280px,calc(100vw-2rem))] rounded-[2rem] border border-white/8 bg-white p-6 text-left shadow-[0_18px_56px_rgba(0,0,0,0.22)] md:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-sky-300">
            Built for Dhaka&apos;s Cambridge ecosystem
          </p>
          <h3 className="mt-4 font-[var(--font-display)] text-3xl leading-none tracking-[-0.03em] text-slate-950 md:text-4xl">
            Designed for students from Dhaka&apos;s top Cambridge schools.
          </h3>
          <p className="mt-4 max-w-4xl text-base leading-8 text-slate-700">
            This platform is shaped for students from schools such as {schools.slice(0, -1).join(", ")},
            and {schools[schools.length - 1]}.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {schools.map((school) => (
              <span
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900"
                key={school}
              >
                {school}
              </span>
            ))}
          </div>
        </section>

        <section className="mx-auto grid w-[min(1280px,calc(100vw-2rem))] items-start gap-8 py-24 lg:grid-cols-[0.86fr_1.14fr]">
          <div>
            <SectionTitle
              eyebrow="Teacher profile"
              title={`${teacherProfile.name} leads the academic system behind OLevelStarsBD.`}
              copy={`${teacherProfile.degree}. Expert in teaching ${teacherProfile.expertise.join(", ")} with ${teacherProfile.experience.toLowerCase()}.`}
            />
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-100">
              The platform is built around one teacher-led structure so students get continuity in
              explanation, practice direction, and correction across core Cambridge science subjects.
            </p>
          </div>

          <div className="rounded-[2rem] bg-[linear-gradient(180deg,#0a2745,#103d68)] p-8 text-white shadow-[0_28px_90px_rgba(10,39,69,0.18)]">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/8 p-6">
                <IconBadge className="mb-4">
                  <MarketingIcon name="degree" />
                </IconBadge>
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-100/80">
                  Academic background
                </p>
                <p className="mt-4 font-[var(--font-display)] text-3xl leading-none tracking-[-0.03em]">
                  {teacherProfile.degree}
                </p>
              </div>
              <div className="rounded-[1.6rem] border border-white/10 bg-white/8 p-6">
                <IconBadge className="mb-4">
                  <MarketingIcon name="experience" />
                </IconBadge>
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-100/80">
                  Experience
                </p>
                <p className="mt-4 font-[var(--font-display)] text-3xl leading-none tracking-[-0.03em]">
                  {teacherProfile.experience}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-[1.6rem] border border-white/10 bg-white p-6 text-slate-950">
              <div className="mb-4 flex items-center gap-3">
                <IconBadge className="h-11 w-11 border-slate-200 bg-slate-50 text-sky-700">
                  <MarketingIcon name="teacher" className="h-5 w-5" />
                </IconBadge>
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-800">Subject expertise</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {teacherProfile.expertise.map((subject) => (
                  <span
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900"
                    key={subject}
                  >
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <a
                className="rounded-[1.4rem] border border-white/10 bg-white/8 p-5 text-white transition hover:-translate-y-0.5"
                href={`tel:${teacherProfile.mobile}`}
              >
                <IconBadge className="mb-4">
                  <MarketingIcon name="mobile" />
                </IconBadge>
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-100/80">Mobile</p>
                <strong className="mt-3 block text-lg">{teacherProfile.mobile}</strong>
              </a>
              <a
                className="rounded-[1.4rem] border border-white/10 bg-white/8 p-5 text-white transition hover:-translate-y-0.5"
                href={`mailto:${teacherProfile.email}`}
              >
                <IconBadge className="mb-4">
                  <MarketingIcon name="email" />
                </IconBadge>
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-100/80">Email</p>
                <strong className="mt-3 block text-lg break-all">{teacherProfile.email}</strong>
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto w-[min(1280px,calc(100vw-2rem))] py-24" id="problem">
          <SectionTitle
            eyebrow="The real problem"
            title="School plus coaching plus Dhaka traffic is not a smart academic system."
            copy="Parents invest heavily, but students still return home tired, rushed, and under-monitored. That is why preparation stays incomplete even when effort is high."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {problems.map((item, index) => (
              <article
                className={`rounded-[2rem] border border-white/8 bg-white p-8 shadow-[0_18px_56px_rgba(0,0,0,0.22)] ${index % 2 === 1 ? "md:translate-y-6" : ""}`}
                key={item.title}
              >
                <IconBadge className="border-slate-200 bg-[linear-gradient(135deg,rgba(16,61,104,0.14),rgba(127,195,224,0.3))] text-sky-700">
                  <MarketingIcon name={item.icon} />
                </IconBadge>
                <h3 className="mt-5 text-2xl font-semibold tracking-[-0.02em] text-slate-950">{item.title}</h3>
                <p className="mt-4 text-base leading-8 text-slate-700">{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid w-[min(1280px,calc(100vw-2rem))] items-start gap-8 py-24 lg:grid-cols-[0.88fr_1.12fr]" id="program">
          <div>
            <SectionTitle
              eyebrow="The better system"
              title="An online platform that brings structure, guidance, and accountability into the student&apos;s home."
              copy="This is not simply moving coaching onto Zoom. It is a complete academic system built to help Cambridge O Level students finish the syllabus on time while staying more disciplined and less exhausted."
            />
            <div className="mt-8 grid gap-5">
              {systemPillars.map((item) => (
                <div className="flex gap-4" key={item}>
                  <span className="mt-2 h-3 w-3 rounded-full bg-[linear-gradient(135deg,#103d68,#4b9fc5)]" />
                  <p className="text-base leading-8 text-white">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-[linear-gradient(180deg,#0a2745,#103d68)] p-8 text-white shadow-[0_28px_90px_rgba(10,39,69,0.18)]">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.6rem] border border-white/10 bg-white p-6">
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-100/80">Weekly control</p>
                <h3 className="mt-4 font-[var(--font-display)] text-3xl leading-none tracking-[-0.03em] text-slate-950">
                  Guided classes, practice, correction.
                </h3>
              </div>
              <div className="rounded-[1.6rem] bg-white p-6 text-slate-950">
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-800">At-home discipline</p>
                <p className="mt-4 text-sm leading-7 text-slate-700">
                  One system for school alignment, syllabus completion, revision, and parent communication.
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-[1.6rem] border border-white/10 bg-white/8 p-6">
              <p className="text-sm leading-8 text-white/92">
                The result is a calmer routine with clearer academic direction and more usable study hours every week.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-[min(1280px,calc(100vw-2rem))] py-24" id="how-it-works">
          <SectionTitle eyebrow="How it works" title="A calmer routine. A more serious academic outcome." />
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {steps.map((step) => (
              <article className="rounded-[2rem] border border-white/8 bg-white p-8 shadow-[0_18px_56px_rgba(0,0,0,0.22)]" key={step.title}>
                <div className="flex items-center justify-between gap-4">
                  <IconBadge className="border-slate-200 bg-[linear-gradient(135deg,rgba(16,61,104,0.14),rgba(127,195,224,0.3))] text-sky-700">
                    <MarketingIcon name={step.icon} />
                  </IconBadge>
                  <span className="text-3xl font-extrabold text-sky-300">{step.number}</span>
                </div>
                <h3 className="mt-6 text-2xl font-semibold tracking-[-0.02em] text-slate-950">{step.title}</h3>
                <p className="mt-4 text-base leading-8 text-slate-700">{step.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid w-[min(1280px,calc(100vw-2rem))] items-start gap-8 py-24 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionTitle
            eyebrow="Benefits"
            title="Why this system works better for busy Cambridge families in Dhaka"
            copy="The promise is simple: the same Cambridge syllabus, delivered through a better operating system for study."
          />
          <div className="grid gap-5 md:grid-cols-2">
            {benefits.map((item) => (
              <div
                className="flex min-h-28 items-center rounded-[1.75rem] border border-white/8 bg-white px-6 py-5 text-base font-semibold leading-7 text-slate-900 shadow-[0_18px_56px_rgba(0,0,0,0.22)]"
                key={item}
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-[min(1280px,calc(100vw-2rem))] py-24" id="comparison">
          <SectionTitle
            eyebrow="Traditional coaching vs our platform"
            title="One keeps students busy. The other moves them forward."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <article className="rounded-[2rem] border border-white/8 bg-white p-8 shadow-[0_18px_56px_rgba(0,0,0,0.22)]">
              <h3 className="font-[var(--font-display)] text-4xl leading-none tracking-[-0.03em] text-slate-950">
                Traditional Coaching
              </h3>
              <ul className="mt-6 grid gap-4 text-base leading-8 text-slate-700">
                <li>Traffic time before and after class</li>
                <li>Rushed schedule around school and commuting</li>
                <li>Poor monitoring in large batches</li>
                <li>Fixed pace that ignores individual gaps</li>
                <li>High student fatigue by evening</li>
              </ul>
            </article>
            <article className="rounded-[2rem] bg-[linear-gradient(180deg,#0a2745,#103d68)] p-8 text-white shadow-[0_24px_76px_rgba(10,39,69,0.18)]">
              <h3 className="font-[var(--font-display)] text-4xl leading-none tracking-[-0.03em]">Our Platform</h3>
              <ul className="mt-6 grid gap-4 text-base leading-8 text-white/82">
                <li>Home-based learning with more usable hours</li>
                <li>Structured weekly guidance and discipline</li>
                <li>Progress tracking parents can actually follow</li>
                <li>Efficient routine built around school workload</li>
                <li>Smarter preparation with less exhaustion</li>
              </ul>
            </article>
          </div>
        </section>

        <section className="mx-auto grid w-[min(1280px,calc(100vw-2rem))] items-start gap-8 py-24 lg:grid-cols-[1.02fr_0.98fr]" id="parents">
          <div className="rounded-[2rem] bg-[linear-gradient(180deg,#0a2745,#103d68)] p-8 text-white shadow-[0_28px_90px_rgba(10,39,69,0.18)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-sky-100/80">For parents</p>
            <h3 className="mt-5 font-[var(--font-display)] text-5xl leading-none tracking-[-0.03em]">
              Your child doesn&apos;t need more classes. They need the right system.
            </h3>
            <div className="mt-8 grid gap-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5 text-white/80">
                Regular updates instead of vague reassurance
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5 text-white/80">
                Clear academic direction and weekly priorities
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5 text-white/80">
                Better time management with less travel fatigue
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5 text-white/80">
                Exam-ready confidence built through proper monitoring
              </div>
            </div>
          </div>

          <div>
            <SectionTitle
              eyebrow="Parent visibility"
              title="Parents need clarity, discipline, and confidence."
              copy="Parents do not need more confusion, more travel, or more guesswork. They need a platform that creates clarity, discipline, and confidence."
            />
            <div className="mt-8 rounded-[2rem] border border-white/8 bg-white p-8 shadow-[0_18px_56px_rgba(0,0,0,0.22)]">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.5rem] bg-white p-5">
                  <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-300">Weekly update</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    Completion, revision, weak-topic focus, and next academic priorities.
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-white p-5">
                  <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-300">Assessment rhythm</p>
                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    Parents can see where preparation is strong and where the student needs tighter support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-[min(1280px,calc(100vw-2rem))] py-12">
          <p className="rounded-[2rem] bg-[linear-gradient(135deg,#0a2745,#103d68)] px-8 py-10 text-center font-[var(--font-display)] text-4xl leading-none tracking-[-0.03em] text-white shadow-[0_22px_72px_rgba(10,39,69,0.16)] md:text-5xl">
            Complete syllabus on time. Regular assessments. Exam-ready confidence.
          </p>
        </section>

        <section className="mx-auto w-[min(1280px,calc(100vw-2rem))] py-24">
          <SectionTitle
            eyebrow="Testimonials"
            title="What families say when the system finally starts working"
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_1fr_1fr]">
            {testimonials.map((item, index) => (
              <article
                className={`rounded-[2rem] p-8 shadow-[0_18px_56px_rgba(10,39,69,0.08)] ${
                  index === 0
                    ? "bg-[linear-gradient(180deg,#0a2745,#103d68)] text-white"
                    : "border border-white/8 bg-white text-slate-950"
                }`}
                key={item.by}
              >
                <p className={`text-lg leading-8 ${index === 0 ? "text-white" : "text-slate-800"}`}>"{item.quote}"</p>
                <strong className={`mt-8 block ${index === 0 ? "text-white" : "text-slate-950"}`}>{item.by}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid w-[min(1280px,calc(100vw-2rem))] items-start gap-8 py-24 lg:grid-cols-[0.78fr_1.22fr]" id="consultation">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-sky-300">Limited seats</p>
            <h2 className="mt-4 font-[var(--font-display)] text-5xl leading-none tracking-[-0.03em] text-white">
              Limited seats to ensure proper monitoring.
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-100">
              Intake stays intentionally controlled so students receive real follow-up, proper accountability,
              and the academic attention that large coaching systems usually cannot provide.
            </p>
          </div>
          <div className="rounded-[2rem] border border-white/8 bg-white p-8 shadow-[0_18px_56px_rgba(0,0,0,0.22)]">
            <h3 className="font-[var(--font-display)] text-4xl leading-none tracking-[-0.03em] text-slate-950">
              Stop wasting time in traffic. Start learning smart.
            </h3>
            <p className="mt-5 text-base leading-8 text-slate-700">
              Join the Cambridge O Level Online Program today and book a free consultation for your
              child&apos;s study plan.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <a
                className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-5 text-slate-950 transition hover:-translate-y-0.5"
                href={`tel:${primaryContactNumber}`}
              >
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-700">Contact number</p>
                <strong className="mt-3 block text-lg">{primaryContactNumber}</strong>
              </a>
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-5 text-slate-950">
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-sky-700">Payment number</p>
                <strong className="mt-3 block text-lg">{primaryContactNumber}</strong>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex rounded-full bg-[linear-gradient(135deg,#103d68,#1f6ea9)] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_38px_rgba(10,39,69,0.18)] transition hover:-translate-y-0.5"
                to="/register"
              >
                Join the Cambridge O Level Online Program Today
              </Link>
              <a
                className="inline-flex rounded-full border border-white/12 bg-white/5 px-6 py-3.5 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-white/20"
                href={`https://wa.me/${primaryWhatsAppNumber}`}
                rel="noreferrer"
                target="_blank"
              >
                WhatsApp Consultation
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto w-[min(1280px,calc(100vw-2rem))] py-24" id="faq">
          <SectionTitle
            eyebrow="FAQ for parents"
            title="Questions parents usually ask before switching to a better system"
          />
          <div className="mt-10 grid gap-4">
            {faqs.map((item) => (
              <details
                className="rounded-[1.6rem] border border-white/8 bg-white px-6 py-5 shadow-[0_18px_56px_rgba(0,0,0,0.2)]"
                key={item.question}
              >
                <summary className="cursor-pointer list-none text-lg font-semibold text-slate-950">
                  {item.question}
                </summary>
                <p className="mt-4 text-base leading-8 text-slate-700">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 mx-auto mt-6 grid w-[min(1280px,calc(100vw-2rem))] items-start gap-8 border-t border-white/8 py-8 md:grid-cols-[1.2fr_0.7fr_0.7fr]">
        <div>
          <strong className="block text-base font-semibold text-white">OLevelStarsBD</strong>
          <p className="mt-3 text-base leading-8 text-slate-100">
            Premium online Cambridge O Level support for students in Dhaka, Bangladesh.
          </p>
        </div>
        <div>
          <span className="block text-xs font-extrabold uppercase tracking-[0.22em] text-sky-300">Contact</span>
          <a className="mt-4 block text-white" href="mailto:admissions@olevelstarsbd.com">
            admissions@olevelstarsbd.com
          </a>
          <a className="mt-2 block text-white" href={`tel:${primaryContactNumber}`}>
            {primaryContactNumber}
          </a>
          <p className="mt-2 text-slate-100">Payment number: {primaryContactNumber}</p>
        </div>
        <div>
          <span className="block text-xs font-extrabold uppercase tracking-[0.22em] text-sky-300">Connect</span>
          <a
            className="mt-4 block text-white"
            href={`https://wa.me/${primaryWhatsAppNumber}`}
            rel="noreferrer"
            target="_blank"
          >
            WhatsApp
          </a>
          <a className="mt-2 block text-white" href="https://facebook.com" rel="noreferrer" target="_blank">
            Facebook
          </a>
          <a className="mt-2 block text-white" href="https://instagram.com" rel="noreferrer" target="_blank">
            Instagram
          </a>
        </div>
      </footer>
    </div>
  );
}
