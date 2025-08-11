import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { getOneCourseFn } from "../../store/slices/courses/getOneCourse";
import { BASE_API_URL } from "../../constants/base_url";
import type { AppDispatch, RootState } from "../../store/store";
import { ChevronDown, Lock } from "lucide-react";

import EnrolleCourseDetail from "./enrollCourseDetail";
import { listEnrollementsFn } from "../../store/slices/enrollments/listEnrollements";

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { data: courseData, loading } = useSelector(
    (state: RootState) => state.getOneCourseSlice
  );
  const { data: loginData } = useSelector(
    (state: RootState) => state.loginSlice
  );
  useEffect(() => {
    dispatch(listEnrollementsFn());
  }, []);

  const course = courseData?.course;
  const enrollements = useSelector(
    (state: RootState) => state.listEnrollementsSlice.data?.enrollemnets
  );

  const [expanded, setExpanded] = useState<string[]>([]);

  useEffect(() => {
    if (courseId) dispatch(getOneCourseFn(+courseId));
  }, [dispatch, courseId]);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!course) return <div className="p-10 text-center">Course not found.</div>;

  const toggleChapter = (id: string) => {
    setExpanded((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (expanded.length === course.chapters.length) {
      setExpanded([]);
    } else {
      setExpanded(course.chapters.map((ch) => ch.id));
    }
  };

  const isUserEnrolled = enrollements?.some(
    (enrl) =>
      enrl.is_enrolled === true &&
      enrl.status === "COMPLETED" &&
      enrl.userId === loginData.user.id &&
      enrl.courseId === course.id
  );

  return (
    <div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white min-h-screen">
      <div className="relative h-[360px] w-full overflow-hidden rounded-b-2xl shadow-lg">
        <img
          src={`${BASE_API_URL}/uploads/${course.cover_img}`}
          alt="Course Banner"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-black/40 px-6 lg:px-24 py-10 flex flex-col justify-end">
          <p className="text-sm uppercase text-gray-300 tracking-wider">
            Course
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-2">
            {course.title}
          </h1>
          <p className="text-lg text-gray-200 max-w-2xl">
            {course.description}
          </p>
        </div>
      </div>

      <div className="mx-auto px-4 md:px-8 py-14 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 order-1 md:order-2 lg:order-2">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-md space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">📚 Course Content</h2>
              <button
                onClick={toggleAll}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                {expanded.length === course.chapters.length
                  ? "Collapse All"
                  : "Expand All"}
              </button>
            </div>

            {course.chapters.map((chapter, idx) => {
              const lessons = course.lesson.filter(
                (l) => l.chapterId === chapter.id
              );
              const isOpen = expanded.includes(chapter.id);

              return (
                <div
                  key={chapter.id}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-hidden"
                >
                  <button
                    onClick={() => toggleChapter(chapter.id)}
                    className="w-full px-4 py-4 flex justify-between items-center text-left"
                  >
                    <div className="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-100">
                      <ChevronDown
                        className={`w-5 h-5 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                      {idx + 1}. {chapter.chapterTitle}
                      <Lock className="w-4 h-4 text-gray-400 ml-2" />
                    </div>
                    <span className="text-sm text-green-600">
                      {lessons.length} Lessons
                    </span>
                  </button>

                  {isOpen && (
                    <ul className="px-4 pb-4 space-y-3">
                      {lessons.map((lesson, i) => (
                        <li
                          key={lesson.id}
                          className="flex items-center gap-4 p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold">
                            {i + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 dark:text-white">
                              {lesson.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              5 mins
                            </p>
                          </div>
                          <svg
                            className="w-5 h-5 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M4.5 3.5v13l11-6.5-11-6.5z" />
                          </svg>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-1 lg:order-2">
          <div className="md:sticky md:top-24 w-full">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-xl">
              <img
                src={`${BASE_API_URL}/uploads/${course.course_img}`}
                alt="Course Thumbnail"
                className="w-full h-48 md:h-72 object-cover"
              />
              <div className="px-6 pb-4">
                {isUserEnrolled ? (
                  <button
                    className="bg-blue-600 text-white px-6 py-3 w-full mt-4 rounded-xl text-lg hover:bg-blue-500 transition duration-300"
                    onClick={() =>
                      navigate(`/my-courses/continue/${course.id}`)
                    }
                  >
                    Continue Course
                  </button>
                ) : (
                  <div className="">
                    <EnrolleCourseDetail course={course} />
                  </div>
                )}
                <div className="py-4 text-center text-xl text-gray-700 dark:text-white">
                  ${course.price}
                </div>
              </div>
              <ul className="px-6 pb-6 pt-2 text-sm text-gray-700 dark:text-gray-300 space-y-4">
                <li className="flex items-center gap-3">
                  📅 Created: {new Date(course.created_at).toLocaleDateString()}
                </li>
                <li className="flex items-center gap-3">
                  👤 Instructor: {course.users.full_name}
                </li>
                <li className="flex items-center gap-3">
                  📖 Lessons: {course.lesson.length}
                </li>
                <li className="flex items-center gap-3">
                  📂 Chapters: {course.chapters.length}
                </li>
                <li className="flex items-center gap-3">
                  ⏰ Duration: {course.chapters.length * 5} hours
                </li>
                <li className="flex items-center gap-3 text-green-600 font-medium">
                  ✅ Certificate Included
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
