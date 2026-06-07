import mathematicsBg from "../assets/subjects/mathematics-bg.svg";
import physicsBg from "../assets/subjects/physics-bg.svg";
import chemistryBg from "../assets/subjects/chemistry-bg.svg";

const subjectCatalog = {
  Mathematics: {
    accent: "var(--accent-blue)",
    thumbnail: mathematicsBg,
    topics: ["Algebra", "Geometry", "Trigonometry", "Probability"],
    weakTopic: "Algebraic manipulation",
    paperCode: "4024"
  },
  Physics: {
    accent: "var(--accent-gold)",
    thumbnail: physicsBg,
    topics: ["Forces", "Electricity", "Waves", "Thermal physics"],
    weakTopic: "Circuit analysis",
    paperCode: "5054"
  },
  Chemistry: {
    accent: "var(--accent-green)",
    thumbnail: chemistryBg,
    topics: ["Atomic structure", "Bonding", "Stoichiometry", "Organic chemistry"],
    weakTopic: "Mole calculations",
    paperCode: "5070"
  },
  Biology: {
    accent: "var(--accent-teal)",
    topics: ["Cells", "Transport", "Coordination", "Ecology"],
    weakTopic: "Enzyme factors",
    paperCode: "5090"
  },
  "Computer Science": {
    accent: "var(--accent-coral)",
    topics: ["Programming", "Data representation", "Logic", "Networking"],
    weakTopic: "Trace tables",
    paperCode: "2210"
  }
};

const defaultSubjects = Object.keys(subjectCatalog);
const defaultLevels = ["Pre-O Level", "O Level"];

export const teacherProfile = {
  name: "OLevelStarsBD Academy",
  title: "Solo Expert Cambridge Instructor",
  experience: "10+ years teaching Cambridge learners",
  subjects: defaultSubjects,
  description:
    "Focused coaching for Pre-O Level and O Level students with premium lesson delivery, careful pacing, and exam-first science preparation."
};

export function getLevelOptions() {
  return defaultLevels;
}

export function getSubjectOptions() {
  return defaultSubjects;
}

function hashString(value) {
  return [...`${value}`].reduce((total, char) => total + char.charCodeAt(0), 0);
}

function inferSubject(text = "") {
  const normalized = text.toLowerCase();
  if (normalized.includes("math")) {
    return "Mathematics";
  }
  if (normalized.includes("phys")) {
    return "Physics";
  }
  if (normalized.includes("chem")) {
    return "Chemistry";
  }
  if (normalized.includes("bio")) {
    return "Biology";
  }
  if (normalized.includes("computer")) {
    return "Computer Science";
  }

  return defaultSubjects[hashString(text) % defaultSubjects.length];
}

function inferLevel(text = "") {
  return hashString(text) % 2 === 0 ? "O Level" : "Pre-O Level";
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function decorateCourse(course, index = 0) {
  const subject = course.subject || inferSubject(course.title);
  const level = course.level || inferLevel(course.title);
  const chapterCount = Math.max(course.modules?.length || 0, 1);
  const difficulty = course.difficulty || ["Core", "Core", "Extended"][index % 3];
  const baseProgress = course.isAccessible ? 38 + (index * 11) % 46 : 0;
  const progress = clamp(baseProgress, 0, 96);
  const topicSet = new Set(
    (course.modules || []).flatMap((moduleItem, moduleIndex) => {
      if (moduleItem.focusTopics?.length) {
        return moduleItem.focusTopics;
      }

      const subjectTopics = subjectCatalog[subject]?.topics || ["Foundations"];
      return [subjectTopics[moduleIndex % subjectTopics.length]];
    })
  );

  return {
    ...course,
    subject,
    level,
    chapterCount,
    difficulty,
    estimatedHours: course.estimatedHours || chapterCount * 4,
    progress,
    completionLabel: course.isAccessible ? `${progress}% complete` : "Locked curriculum",
    accent: subjectCatalog[subject]?.accent || "var(--accent-blue)",
    thumbnail: course.thumbnail || subjectCatalog[subject]?.thumbnail || "",
    topicList: [...topicSet],
    weakTopic:
      course.weakTopic || subjectCatalog[subject]?.weakTopic || "Exam technique",
    paperCode: course.paperCode || subjectCatalog[subject]?.paperCode || "0000"
  };
}

export function decorateLesson(lesson, context = {}) {
  const subject = context.subject || inferSubject(lesson.title || context.courseTitle || "");
  const subjectTopics = subjectCatalog[subject]?.topics || ["Core ideas"];
  const topic =
    lesson.topic ||
    context.moduleTitle ||
    subjectTopics[hashString(lesson.title || context.moduleTitle || subject) % subjectTopics.length];
  const objectiveStem = lesson.title || "this lesson";

  return {
    ...lesson,
    topic,
    learningObjectives:
      lesson.learningObjectives?.length > 0
        ? lesson.learningObjectives
        : [
            `Explain the core idea behind ${objectiveStem.toLowerCase()}.`,
            `Apply ${topic.toLowerCase()} methods to Cambridge-style questions.`,
            "Recognize the common mistakes that reduce exam marks."
          ],
    summary:
      lesson.summary ||
      `A focused ${subject.toLowerCase()} lesson that connects theory, worked examples, and exam-style reasoning in a clean sequence.`,
    exampleProblem:
      lesson.exampleProblem ||
      `Solve one representative ${topic.toLowerCase()} problem, then compare your approach with the model method.`,
    practiceHint:
      lesson.practiceHint ||
      "Start with untimed practice, then repeat the same question set in timed conditions.",
    notesUrl: lesson.notesUrl || lesson.resourceUrl || "",
    estimatedReadTime: lesson.duration || "18 min",
    chapterTitle: context.moduleTitle || "Chapter session"
  };
}

export function buildStudentInsights(courses, liveClasses) {
  const accessibleCourses = courses.filter((course) => course.isAccessible);
  const progressCards = accessibleCourses.slice(0, 4).map((course, index) => ({
    id: course.id,
    subject: course.subject,
    level: course.level,
    progress: course.progress,
    topicCount: course.topicList.length,
    recommendation:
      index % 2 === 0 ? `Revisit ${course.weakTopic}` : `Advance to ${course.topicList[0]}`
  }));

  const continueLearning = accessibleCourses.slice(0, 3).map((course, index) => ({
    id: course.id,
    title: course.title,
    chapter: course.modules?.[0]?.title || `${course.subject} foundations`,
    time: `${16 + index * 6} min session`,
    to: `/courses/${course.id}`
  }));

  const recentActivity = accessibleCourses.slice(0, 4).map((course, index) => ({
    id: `${course.id}-activity`,
    label: `Completed ${course.topicList[0]} review`,
    subject: course.subject,
    when: `${index + 1} day${index === 0 ? "" : "s"} ago`
  }));

  const recommendations = accessibleCourses.slice(0, 3).map((course) => ({
    id: `${course.id}-rec`,
    title: course.weakTopic,
    reason: `Accuracy is lower in ${course.weakTopic.toLowerCase()} than your average.`,
    subject: course.subject
  }));

  const upcomingQuiz = accessibleCourses.slice(0, 3).map((course, index) => ({
    id: `${course.id}-quiz`,
    title: `${course.subject} chapter check`,
    mode: index % 2 === 0 ? "Timed" : "Practice",
    scoreTarget: `${72 + index * 6}% target`,
    paperCode: course.paperCode
  }));

  const nextLiveClass = liveClasses.find((item) => item.isUpcoming) || null;
  const overallProgress = accessibleCourses.length
    ? Math.round(
        accessibleCourses.reduce((total, course) => total + course.progress, 0) /
          accessibleCourses.length
      )
    : 0;

  return {
    overallProgress,
    progressCards,
    continueLearning,
    recentActivity,
    recommendations,
    upcomingQuiz,
    streakDays: accessibleCourses.length ? 11 : 0,
    weeklyHours: accessibleCourses.length ? 6.5 : 0,
    nextLiveClass
  };
}

export function buildAdminInsights(stats) {
  const pendingStudents = stats?.pendingStudents ?? 0;
  const pendingPayments = stats?.pendingPayments ?? 0;
  const totalCourses = stats?.totalCourses ?? 0;
  const publishedLiveClasses = stats?.publishedLiveClasses ?? 0;

  return {
    conversionHealth:
      pendingStudents > pendingPayments ? "Follow up with newly registered students" : "Payment queue is the active bottleneck",
    weakestTopics: [
      "Algebraic manipulation",
      "Mole calculations",
      "Circuit analysis"
    ],
    completionRate: totalCourses ? Math.min(92, 54 + totalCourses * 4) : 0,
    liveOpsSummary: publishedLiveClasses
      ? `${publishedLiveClasses} live classes already scheduled`
      : "No live classes published yet",
    pendingStudents,
    pendingPayments
  };
}

export function buildPracticeCatalog(courses) {
  return courses.slice(0, 6).map((course, index) => ({
    id: course.id,
    title: `${course.subject} mastery set`,
    subject: course.subject,
    level: course.level,
    chapter: course.modules?.[0]?.title || `${course.subject} core chapter`,
    mode: index % 2 === 0 ? "Timed quiz" : "Practice mode",
    year: 2024 - index,
    session: index % 2 === 0 ? "May/June" : "Oct/Nov",
    paperCode: `${course.paperCode}/P${(index % 3) + 1}`,
    description: `Mixed ${course.subject.toLowerCase()} questions aligned to ${course.level} progress tracking.`
  }));
}
