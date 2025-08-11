import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Plus,
  UserCheck,
  Award,
  Code,
  Cpu,
  BookOpen,
  Globe,
  BookOpenCheck,
  Users,
  ArrowRight,
} from "lucide-react";

import { listCoursesFn } from "../store/slices/courses/listCourse";
import { getCompletedLessonsFn } from "../store/lessonProggress/getCompletedProggress";
import { BASE_API_URL } from "../constants/base_url";
import type { AppDispatch, RootState } from "../store/store";

// Images
import heroImg from "../../public/hero1.png";

import AbdinasirPhoto from "../../public/abdinasir.jpg";
import KhaalidPhoto from "../../public/khaalid.jpg";
import AmiinPhoto from "../../public/amiin.jpg";

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const coursesState = useSelector((s: RootState) => s.listCoursesSlice);
  const userState = useSelector((state: RootState) => state.WhoAmiSlice);
  const userId = useSelector(
    (state: RootState) => state.loginSlice.data?.user?.id
  );
  const user = userState.data?.user;
  const enrollments = user?.enrollements;
  const courses = coursesState.data?.courses || [];
  const completedLessonsState = useSelector(
    (state: RootState) => state.getCompletedLessonsSlice
  );

  useEffect(() => {
    dispatch(listCoursesFn());
    if (userId) {
      dispatch(getCompletedLessonsFn(userId));
    }
  }, [dispatch, userId]);

  // Search & filter state
  const [search, setSearch] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Filter courses
  const filteredCourses = useMemo(() => {
    let list = courses.slice();
    if (search.trim()) {
      const lower = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title?.toLowerCase().includes(lower) ||
          c.description?.toLowerCase().includes(lower) ||
          (c.lesson ?? []).join(" ").toLowerCase().includes(lower)
      );
    }
    if (levelFilter !== "all") {
      list = list.filter((c) => (c.is_published || "beginner") === levelFilter);
    }
    if (priceFilter !== "all") {
      if (priceFilter === "free") list = list.filter((c) => !c.price);
      else list = list.filter((c) => !!c.price);
    }
    if (categoryFilter !== "all") {
      list = list.filter(
        (c) => (c.description || "General") === categoryFilter
      );
    }
    return list;
  }, [courses, search, levelFilter, priceFilter, categoryFilter]);

  // FAQ toggle state
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);
  const toggleFAQ = (idx: number) => {
    setOpenFAQIndex(openFAQIndex === idx ? null : idx);
  };

  // Stats counters
  const [studentsCount, setStudentsCount] = useState<number>(0);
  const [coursesCount, setCoursesCount] = useState<number>(0);
  const [instructorsCount, setInstructorsCount] = useState<number>(0);
  const [completionRate, setCompletionRate] = useState<number>(0);

  useEffect(() => {
    const targetStudents = Math.max(
      1200,
      courses.reduce((acc: number, c) => acc + (c.enrollments?.length || 0), 0)
    );
    const targetCourses = Math.max(12, courses.length || 12);
    const targetInstructors = 24;
    const targetCompletion = 85;

    let s = 0,
      c = 0,
      i = 0,
      comp = 0;
    const dur = 900;
    const steps = 60;
    const si = Math.ceil((targetStudents - s) / steps);
    const ci = Math.ceil((targetCourses - c) / steps);
    const ii = Math.ceil((targetInstructors - i) / steps);
    const compi = Math.ceil((targetCompletion - comp) / steps);

    const interval = setInterval(() => {
      s = Math.min(targetStudents, s + si);
      c = Math.min(targetCourses, c + ci);
      i = Math.min(targetInstructors, i + ii);
      comp = Math.min(targetCompletion, comp + compi);
      setStudentsCount(s);
      setCoursesCount(c);
      setInstructorsCount(i);
      setCompletionRate(comp);
      if (
        s === targetStudents &&
        c === targetCourses &&
        i === targetInstructors &&
        comp === targetCompletion
      ) {
        clearInterval(interval);
      }
    }, Math.max(10, Math.floor(dur / steps)));
    return () => clearInterval(interval);
  }, [courses]);

  // Categories from courses
  const categories = useMemo(() => {
    const set = new Set<string>();
    courses.forEach((c) => set.add(c.title || "General"));
    return ["All", ...Array.from(set)];
  }, [courses]);

  // Continue learning & recently viewed
  const [, setRecent] = useState<[]>([]);
  const [, setContinueLearning] = useState<[]>([]);

  useEffect(() => {
    try {
      const rec = JSON.parse(localStorage.getItem("recent_courses") || "[]");
      const cont = JSON.parse(localStorage.getItem("continue_courses") || "[]");
      setRecent(
        rec
          .map((id: number) => courses.find((c) => c.id === id))
          .filter(Boolean)
      );
      setContinueLearning(
        cont
          .map((id: number) => courses.find((c) => c.id === id))
          .filter(Boolean)
      );
    } catch {
      setRecent([]);
      setContinueLearning([]);
    }
  }, [courses]);

  const navigateToCourse = (id: number) => {
    window.location.assign(`/courses/${id}`);
  };

  const totalLessons = courses.map((course) => ({
    courseId: course.id,
    lessonsCount: course.lesson?.length || 18,
  }));

  const fmt = (n: number) => n.toLocaleString();

  return (
    <div className="w-screen xl:w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0B1228] dark:via-[#091025] dark:to-[#050819] dark:text-gray-100 overflow-x-hidden">
      {/* Hero Section */}
      <section className="mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16 ">
        <div className="flex flex-col lg:flex-row gap-6 md:gap-10 items-center">
          <div className="w-full lg:w-1/2 space-y-5 sm:space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gray-900 dark:text-white">
                Learn{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-indigo-600 to-indigo-500 bg-clip-text text-transparent">
                  New Skills Online
                </span>
                , Anytime
              </h1>
              <p className="text-base sm:text-lg w-full text-indigo-700 dark:text-indigo-300">
                Access expert-led courses with flexible learning paths designed
                to help you grow your career and passions.
              </p>
            </div>

            {/* Search input */}
            <div className="relative w-full">
              <input
                id="course-search"
                type="search"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-full border border-indigo-300 bg-white py-3 px-5 text-indigo-900 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-[#152036] dark:border-indigo-700 dark:text-indigo-100 transition"
              />
              {search.trim() && (
                <div className="absolute z-50 top-full mt-1 w-full bg-white dark:bg-[#152036] rounded-lg shadow-lg max-h-60 overflow-y-auto border border-indigo-300 dark:border-indigo-700">
                  {filteredCourses.length > 0 ? (
                    filteredCourses.slice(0, 6).map((course) => (
                      <button
                        key={course.id}
                        onClick={() => navigateToCourse(course.id)}
                        className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-800 transition text-sm sm:text-base truncate"
                      >
                        <span className="font-medium block text-indigo-900 dark:text-indigo-100 truncate">
                          {course.title}
                        </span>
                        <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-300 truncate">
                          {course.description}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="px-4 py-2 text-indigo-600 dark:text-indigo-300 font-medium text-sm sm:text-base">
                      No results found.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
              {["all", "beginner", "intermediate", "advanced"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition ${
                    levelFilter === lvl
                      ? "bg-indigo-700 text-white shadow-md"
                      : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-[#12203e] dark:text-indigo-300 dark:hover:bg-[#1c2e57]"
                  }`}
                >
                  {lvl === "all"
                    ? "All Levels"
                    : lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                </button>
              ))}

              {["all", "free", "paid"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriceFilter(p)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition ${
                    priceFilter === p
                      ? "bg-indigo-700 text-white shadow-md"
                      : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-[#12203e] dark:text-indigo-300 dark:hover:bg-[#1c2e57]"
                  }`}
                >
                  {p === "all"
                    ? "All Prices"
                    : p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-full border border-indigo-300 py-2 px-3 sm:py-2.5 sm:px-4 bg-white dark:bg-[#0f1522] dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs sm:text-sm min-w-[120px]"
              >
                {["All", ...categories.filter((c) => c !== "All")].map(
                  (cat) => (
                    <option key={cat} value={cat === "All" ? "all" : cat}>
                      {cat}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4">
              <button
                onClick={() => window.location.assign("/signup")}
                className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-full bg-indigo-700 text-white font-medium shadow-md hover:bg-indigo-800 transition text-sm sm:text-base"
              >
                Get Started
              </button>
              <button
                onClick={() => window.location.assign("/courses")}
                className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-full border-2 border-indigo-700 text-indigo-700 font-medium shadow-sm hover:bg-indigo-50 dark:text-indigo-300 dark:border-indigo-500 dark:hover:bg-indigo-900 transition text-sm sm:text-base"
              >
                Browse All Courses
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="w-full lg:w-1/2 mt-6 sm:mt-8 lg:mt-0 flex justify-center">
            <div className="w-full max-w-md lg:max-w-none">
              <img
                src={heroImg}
                alt="Learning illustration"
                className="w-full h-auto rounded-lg  max-w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Continue Learning Section */}
      {enrollments && enrollments.length > 0 && (
        <section className="mx-auto px-4 sm:px-6 py-8 md:py-12 ">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">
            Continue Your Course
          </h2>
          <div className="space-y-4">
            {enrollments.map((c) => {
              const courseTotalLessons =
                totalLessons.find((t) => t.courseId === c.courseId)
                  ?.lessonsCount || 0;
              const completedCount =
                completedLessonsState.data?.completed?.filter(
                  (lesson) => lesson.courseId === c.courseId
                ).length || 0;
              const progressPercent =
                courseTotalLessons > 0
                  ? (completedCount / courseTotalLessons) * 100
                  : 0;

              return (
                <motion.div
                  key={c.id}
                  whileHover={{ y: -2 }}
                  className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
                    <img
                      src={`${BASE_API_URL}/uploads/${c.course.course_img}`}
                      alt={c.course.title || "Course"}
                      className="w-16 h-12 sm:w-20 sm:h-14 rounded-lg object-cover shadow-md flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1 sm:flex-none">
                      <h4 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
                        {c.course.title || "Untitled Course"}
                      </h4>
                      <div className="mt-1 sm:mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-3 w-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                        {progressPercent.toFixed()}% Complete
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigateToCourse(c.courseId)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 sm:px-5 sm:py-2 rounded-full font-medium shadow-sm sm:shadow-md transition-colors duration-300 text-sm sm:text-base"
                  >
                    Continue
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 dark:bg-[#091025]  mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-900 rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center gap-4 md:gap-6">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                <Users className="w-6 h-6 md:w-8 md:h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Students
                </p>
                <p className="text-2xl md:text-3xl font-bold">
                  {fmt(studentsCount)}+
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center gap-4 md:gap-6">
              <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <BookOpenCheck className="w-6 h-6 md:w-8 md:h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Courses
                </p>
                <p className="text-2xl md:text-3xl font-bold">
                  {fmt(coursesCount)}+
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center gap-4 md:gap-6">
              <div className="p-3 bg-teal-100 dark:bg-teal-900/50 rounded-lg">
                <UserCheck className="w-6 h-6 md:w-8 md:h-8 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Instructors
                </p>
                <p className="text-2xl md:text-3xl font-bold">
                  {fmt(instructorsCount)}+
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-gray-900 rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center gap-4 md:gap-6">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <Award className="w-6 h-6 md:w-8 md:h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Completion
                </p>
                <p className="text-2xl md:text-3xl font-bold">
                  {completionRate}%
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 bg-gray-50 dark:bg-[#091025]  mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">
            Explore Our Categories
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm md:text-base">
            Discover courses in various fields to boost your skills and career
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-900 rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-5">
              <div className="p-2 md:p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                <Code className="w-5 h-5 md:w-6 md:h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg md:text-xl font-medium md:font-semibold">
                Web Development
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 md:mb-6 text-sm md:text-base">
              Master the skills to build responsive, high-performance websites
              and applications.
            </p>
            <button className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 md:gap-2 group text-sm md:text-base">
              Explore{" "}
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition"
              />
            </button>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-900 rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-5">
              <div className="p-2 md:p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <Cpu className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg md:text-xl font-medium md:font-semibold">
                Data Science
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 md:mb-6 text-sm md:text-base">
              Dive into data analysis, machine learning, and visualization
              techniques.
            </p>
            <button className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1 md:gap-2 group text-sm md:text-base">
              Explore{" "}
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition"
              />
            </button>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-900 rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-5">
              <div className="p-2 md:p-3 bg-pink-100 dark:bg-pink-900/50 rounded-lg">
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-lg md:text-xl font-medium md:font-semibold">
                UI/UX Design
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 md:mb-6 text-sm md:text-base">
              Learn to craft beautiful, intuitive interfaces that users love to
              interact with.
            </p>
            <button className="text-pink-600 dark:text-pink-400 font-medium flex items-center gap-1 md:gap-2 group text-sm md:text-base">
              Explore{" "}
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition"
              />
            </button>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-900 rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-5">
              <div className="p-2 md:p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                <Globe className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-lg md:text-xl font-medium md:font-semibold">
                Virtual Classroom
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 md:mb-6 text-sm md:text-base">
              Virtual learning environment known as a learning platform for
              modern education.
            </p>
            <button className="text-yellow-600 dark:text-yellow-400 font-medium flex items-center gap-1 md:gap-2 group text-sm md:text-base">
              Explore{" "}
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition"
              />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="py-12 md:py-16 px-4 sm:px-6 dark:bg-[#091025]  mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-10 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">
              Popular Courses
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
              Browse our most popular courses loved by students
            </p>
          </div>
          <div className="flex gap-2 md:gap-3 w-full sm:w-auto">
            <select
              onChange={(e) => {
                const val = e.target.value;
                if (val === "popular") {
                  filteredCourses.sort(
                    (a, b) =>
                      (a.enrollments?.length || 0) -
                      (b.enrollments?.length || 0)
                  );
                } else if (val === "new") {
                  filteredCourses.sort(
                    (a, b) =>
                      new Date(b.created_at || 0).getTime() -
                      new Date(a.created_at || 0).getTime()
                  );
                }
              }}
              className="rounded-lg border border-gray-300 dark:border-gray-600 py-2 px-3 bg-white dark:bg-gray-800 text-xs md:text-sm flex-1 sm:flex-none"
            >
              <option value="popular">Most popular</option>
              <option value="new">Newest</option>
              <option value="price">Price</option>
            </select>
            <button
              onClick={() => window.location.assign("/courses")}
              className="px-3 py-2 md:px-4 md:py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition text-xs md:text-sm"
            >
              View All
            </button>
          </div>
        </div>

        {coursesState.loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">
              Loading courses...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
            {courses.slice(0, 6).map((course) => (
              <motion.div
                key={course.id}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-gray-900 rounded-lg md:rounded-xl shadow-sm hover:shadow-md overflow-hidden group cursor-pointer transition-all border border-gray-200 dark:border-gray-700"
                onClick={() => navigateToCourse(course.id)}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={`${BASE_API_URL}/uploads/${course.course_img}`}
                    alt={course.title}
                    className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-1 bg-white text-indigo-600 rounded-full text-xs font-medium">
                      {course.is_published || "Beginner"}
                    </span>
                  </div>
                </div>
                <div className="p-4 md:p-6">
                  <div className="flex justify-between items-start mb-2 md:mb-3">
                    <h3 className="font-medium md:font-semibold text-base md:text-lg">
                      {course.title}
                    </h3>
                    {course.price ? (
                      <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded text-xs md:text-sm font-medium">
                        ${course.price}
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded text-xs md:text-sm font-medium">
                        Free
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-yellow-400 mr-1" />
                      <span className="text-xs md:text-sm">4.5</span>
                      <span className="mx-1 md:mx-2 text-gray-400 text-xs">
                        •
                      </span>
                      <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        {course.enrollments?.length || 0} students
                      </span>
                    </div>
                    <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition flex items-center gap-1 group text-xs md:text-sm">
                      <span className="font-medium">View</span>
                      <ArrowRight
                        size={12}
                        className="group-hover:translate-x-1 transition"
                      />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Learning Paths */}
      <section className="py-12 md:py-16 px-4 sm:px-6 bg-gray-50 dark:bg-[#091025]  mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">
            Structured Learning Paths
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm md:text-base">
            Follow our curated paths to master skills systematically
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-900 rounded-lg md:rounded-xl p-5 md:p-8 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="p-2 md:p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <BookOpenCheck className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg md:text-xl font-medium md:font-semibold">
                Beginner Path
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 md:mb-6 text-sm md:text-base">
              Start your journey with foundational courses designed for complete
              beginners.
            </p>
            <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
              {["Intro to Programming", "Web Basics", "Digital Literacy"].map(
                (item, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm md:text-base"
                  >
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500"></div>
                    {item}
                  </li>
                )
              )}
            </ul>
            <button className="w-full py-2.5 md:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition text-sm md:text-base">
              Start Learning
            </button>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-900 rounded-lg md:rounded-xl p-5 md:p-8 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="p-2 md:p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <Award className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg md:text-xl font-medium md:font-semibold">
                Intermediate Path
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 md:mb-6 text-sm md:text-base">
              Build on your basics with more advanced concepts and practical
              projects.
            </p>
            <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
              {[
                "Advanced Programming",
                "Data Structures",
                "APIs & Services",
              ].map((item, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm md:text-base"
                >
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-purple-500"></div>
                  {item}
                </li>
              ))}
            </ul>
            <button className="w-full py-2.5 md:py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition text-sm md:text-base">
              Continue Path
            </button>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-900 rounded-lg md:rounded-xl p-5 md:p-8 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="p-2 md:p-3 bg-teal-100 dark:bg-teal-900/50 rounded-lg">
                <UserCheck className="w-5 h-5 md:w-6 md:h-6 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-lg md:text-xl font-medium md:font-semibold">
                Advanced Path
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4 md:mb-6 text-sm md:text-base">
              Master complex topics and prepare for professional certifications.
            </p>
            <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8">
              {["System Design", "Machine Learning", "Cloud Architecture"].map(
                (item, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm md:text-base"
                  >
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-teal-500"></div>
                    {item}
                  </li>
                )
              )}
            </ul>
            <button className="w-full py-2.5 md:py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition text-sm md:text-base">
              Master Skills
            </button>
          </motion.div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-8 px-4 sm:px-6 bg-gray-100 dark:bg-gray-800/50  mx-auto">
        <div className="text-center">
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-3 md:mb-4">
            Trusted by leading companies worldwide
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 opacity-70">
            {["Google", "Microsoft", "Amazon", "Netflix", "Spotify"].map(
              (company, index) => (
                <div
                  key={index}
                  className="text-base md:text-lg font-bold text-gray-700 dark:text-gray-300"
                >
                  {company}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-16 px-4 sm:px-6 bg-white dark:bg-[#091025]  mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">
            What Our Students Say
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm md:text-base">
            Hear from our community of learners who have transformed their
            careers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
          {[
            {
              id: 1,
              name: "Abdinasir Mohamed Mohamoud",
              role: "Software Engineer",
              photo: `${AbdinasirPhoto}`,
              feedback:
                "Markii aan go'aansaday in aan barto programming, waxaan ahaa qof ka cabsi qaba code-ka. Waxaan maqli jiray erayo sida HTML, CSS, iyo Python oo iiga muuqan jiray wax qarsoon oo adag. Laakiin markii aan ku biiray koorsooyin tayo leh, waxaan ogaaday in haddii aad si nidaamsan u barato, programming-ka uu yahay ciyaar aad u xiiso badan. Maanta, waxaan si fudud u sameeyaa websites shaqeynaya oo dadka isticmaalaan. Waxa ugu muhiimsan ee aan bartay waa in aanan quusan oo aan ku celceliyo.",
            },
            {
              id: 2,
              name: "Khaalid Fodhaadhi",
              role: "Graphic Desinger",
              photo: `${KhaalidPhoto}`,
              feedback:
                "Anigu waxaan doorbiday farshaxanka iyo naqshadeynta, sidaa darteed waxaan ku biiray graphic design. Markii hore, waxaan moodayay in sawir qurux badan la samaynayo oo keliya, laakiin waxaan ogaaday in graphic design uu leeyahay nidaam, isku dheelitir, iyo faham muuqaal. Waxaan bartay Photoshop, Illustrator, iyo Canva. Waxay iga caawiyeen in aan naqshado posters, logos, iyo social media designs ka soo jiitay macaamiil badan. Hadda, waxaan isku darayaa hal-abuur iyo farsamo, waxaana ka helaa dakhli joogto ah shaqadayda.",
            },
            {
              id: 3,
              name: "Amiin Mohamoud Mouse",
              role: "UI/UX Designer",
              photo: `${AmiinPhoto}`,
              feedback:
                "Anigu markii aan bilaabay barashada programming-ka, waxaan ka baqayay inuu yahay wax adag. Laakiin markii aan helay koorsooyin iyo macallimiin wanaagsan, waxaan si fudud u bartay HTML, CSS, iyo JavaScript. Waxaan awood u yeeshay in aan sameeyao websites fudud oo shaqeynaya. Waxbarashadani waxay i siisay kalsooni iyo fursado shaqo oo fiican.",
            },
          ].map(({ id, name, role, photo, feedback }) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: id * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg md:rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                <img
                  src={photo}
                  alt={name}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-medium text-sm md:text-base">{name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {role}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 italic text-xs md:text-sm mb-3 md:mb-4">
                "{feedback}"
              </p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-16 px-4 sm:px-6 bg-gray-50 dark:bg-[#091025] max-w-4xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm md:text-base">
            Find answers to common questions about our platform
          </p>
        </div>

        <div className="space-y-3 md:space-y-4">
          {[
            {
              question: "What is this platform about?",
              answer:
                "Our platform is a comprehensive learning management system designed to help you acquire new skills through expert-led courses. We focus on practical, job-relevant skills that you can apply immediately in your career.",
            },
            {
              question: "Can I learn at my own pace?",
              answer:
                "Absolutely! All our courses are self-paced, allowing you to learn whenever and wherever you want. You'll have lifetime access to course materials so you can revisit them anytime.",
            },
            {
              question: "Do you provide certificates?",
              answer:
                "Yes, we offer verifiable certificates of completion for every course you finish successfully. These certificates can be shared on LinkedIn and added to your resume to showcase your skills.",
            },
            {
              question: "Is there a free trial?",
              answer:
                "We offer a 7-day free trial for all new users. During this period, you can access most of our course content to decide if our platform is right for you before committing to a subscription.",
            },
          ].map((faq, idx) => {
            const isOpen = openFAQIndex === idx;

            return (
              <motion.div
                key={idx}
                layout
                className="bg-white dark:bg-gray-900 rounded-lg md:rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
                onClick={() => toggleFAQ(idx)}
              >
                <div className="p-4 md:p-6 flex justify-between items-center">
                  <h3 className="font-medium md:font-semibold text-sm md:text-base lg:text-lg">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-gray-500 dark:text-gray-400"
                  >
                    <Plus size={18} />
                  </motion.div>
                </div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 md:px-6 pb-4 md:pb-6"
                    >
                      <p className="text-gray-600 dark:text-gray-300 text-xs md:text-sm">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">
            Ready to start learning?
          </h2>
          <p className="text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto">
            Join thousands of learners who have transformed their careers with
            our courses
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <button
              onClick={() => window.location.assign("/signup")}
              className="px-6 py-2.5 md:px-8 md:py-3 bg-white text-indigo-600 rounded-lg font-medium shadow-md hover:bg-gray-100 transition text-sm md:text-base"
            >
              Get Started for Free
            </button>
            <button
              onClick={() => window.location.assign("/courses")}
              className="px-6 py-2.5 md:px-8 md:py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition text-sm md:text-base"
            >
              Browse All Courses
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
