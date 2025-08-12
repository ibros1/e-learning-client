import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronRight,
  CheckCircle,
  PlayCircle,
  BookOpen,
  Menu,
  X,
} from "lucide-react";
import { getOneCourseFn } from "../../store/slices/courses/getOneCourse";
import type { RootState, AppDispatch } from "../../store/store";
import { BASE_API_URL } from "../../constants/base_url";
import toast from "react-hot-toast";

import Plyr from "plyr-react";
import "plyr-react/plyr.css";

import type { SourceInfo } from "plyr";
import { getLessonProgressFn } from "../../store/lessonProggress/getLessonProggress";
import { createLessonProgressFn } from "../../store/lessonProggress/makeProgress";
import { getCompletedLessonsFn } from "../../store/lessonProggress/getCompletedProggress";

const getYouTubeId = (url: string) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === "youtu.be") return urlObj.pathname.slice(1);
    if (urlObj.hostname.includes("youtube.com"))
      return urlObj.searchParams.get("v") || "";
  } catch {
    return "";
  }
  return "";
};
const formatVideoUrl = (url: string) => {
  if (!url) return "";

  try {
    const urlObj = new URL(url);

    // Encode each segment of the pathname properly
    urlObj.pathname = urlObj.pathname
      .split("/")
      .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
      .join("/");

    return urlObj.toString();
  } catch {
    const encodedPath = encodeURIComponent(url.trim()).replace(/%2F/g, "/");
    return url.startsWith("http") ? url : `${BASE_API_URL}/${encodedPath}`;
  }
};

const ContinueCourse = () => {
  const { courseId, lessonId } = useParams<{
    courseId: string;
    lessonId?: string;
  }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Redux selectors
  const { data, loading } = useSelector(
    (state: RootState) => state.getOneCourseSlice
  );
  const userState = useSelector((state: RootState) => state.WhoAmiSlice);
  const loginUserState = useSelector((state: RootState) => state.loginSlice);
  const completeLessonState = useSelector(
    (state: RootState) => state.getCompletedLessonsSlice
  );
  const createProgressState = useSelector(
    (state: RootState) => state.createLessonProgressSlice
  );

  const course = data?.course;
  const user = userState?.data?.user;
  const loginUser = loginUserState.data?.user;

  const [currentLessonId, setCurrentLessonId] = useState<string | undefined>(
    lessonId
  );
  const [expandedChapters, setExpandedChapters] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);

  // Sort lessons by creation date
  const sortedLessons = useMemo(() => {
    return [...(course?.lesson || [])].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [course]);

  // Current lesson
  const currentLesson = useMemo(() => {
    return (
      sortedLessons.find((l) => l.id === currentLessonId) || sortedLessons[0]
    );
  }, [sortedLessons, currentLessonId]);

  // Update your Plyr source configuration
  const source: SourceInfo = useMemo(() => {
    const url = currentLesson?.video_url || "";
    const youtubeId = getYouTubeId(url);

    if (youtubeId) {
      return {
        type: "video",
        sources: [
          {
            src: youtubeId,
            provider: "youtube",
          },
        ],
        youtube: {
          noCookie: true, // Use youtube-nocookie.com
          rel: 0, // Don't show related videos at the end
          showinfo: 0, // Hide video info
          iv_load_policy: 3, // Hide annotations
          modestbranding: 1, // Hide YouTube logo
        },
      };
    } else {
      return {
        type: "video",
        sources: [
          {
            src: formatVideoUrl(url),
            type: "video/mp4",
          },
        ],
      };
    }
  }, [currentLesson?.video_url]);

  // Then in your JSX, add the YouTube provider option:
  <Plyr
    source={source}
    options={{
      youtube: {
        noCookie: true,
        rel: 0,
        showinfo: 0,
        iv_load_policy: 3,
        modestbranding: 1,
      },
    }}
  />;

  // Group chapters with their lessons sorted
  const chaptersWithLessons = useMemo(() => {
    return (
      course?.chapters.map((chapter) => ({
        ...chapter,
        lessons: sortedLessons.filter(
          (lesson) => lesson.chapterId === chapter.id
        ),
      })) || []
    );
  }, [course, sortedLessons]);

  const totalLessons = sortedLessons.length;
  const completedLessonsCount =
    completeLessonState.data?.completed?.length || 0;

  const progressPercent =
    totalLessons > 0
      ? Math.min(100, Math.round((completedLessonsCount / totalLessons) * 100))
      : 0;

  const completedLessonIds = useMemo(() => {
    return new Set(
      completeLessonState.data?.completed
        ?.filter((item) => item.isCompleted)
        .map((item) => item.lessonId) || []
    );
  }, [completeLessonState]);
  console.log(
    "Formatted video URL:",
    formatVideoUrl(currentLesson?.video_url || "")
  );
  console.log("Raw video_url:", currentLesson?.video_url);

  // Load course data on mount or courseId change
  useEffect(() => {
    if (courseId) dispatch(getOneCourseFn(+courseId));
  }, [dispatch, courseId]);

  // Load completed lessons when user changes
  useEffect(() => {
    if (user?.id) {
      dispatch(getCompletedLessonsFn(user.id));
    }
  }, [dispatch, user?.id]);

  // Update current lesson ID when URL or lessons change
  useEffect(() => {
    if (lessonId) {
      setCurrentLessonId(lessonId);
    } else if (sortedLessons.length) {
      setCurrentLessonId(sortedLessons[0].id);
    }
  }, [lessonId, sortedLessons]);

  // Automatically expand chapter of current lesson
  useEffect(() => {
    if (
      currentLesson?.chapterId &&
      !expandedChapters.includes(currentLesson.chapterId)
    ) {
      setExpandedChapters((prev) => [...prev, currentLesson.chapterId]);
    }
  }, [currentLesson, expandedChapters]);

  // Fetch lesson progress
  useEffect(() => {
    const fetchLessonProgress = async () => {
      if (!user || !currentLesson?.id) return;
      try {
        const result = await dispatch(
          getLessonProgressFn({ userId: user.id, lessonId: currentLesson.id })
        ).unwrap();
        setLessonCompleted(result?.progress?.isCompleted ?? false);
      } catch {
        setLessonCompleted(false);
      }
    };
    fetchLessonProgress();
  }, [dispatch, user, currentLesson?.id]);

  // Refresh completed lessons list after marking progress
  useEffect(() => {
    if (createProgressState.data.isSuccess && user?.id) {
      dispatch(getCompletedLessonsFn(user.id));
    }
  }, [createProgressState, dispatch, user?.id]);

  // Mark lesson completed/incomplete handler
  const completedHandler = async () => {
    if (!user || !currentLesson) return;
    const newStatus = !lessonCompleted;
    try {
      await dispatch(
        createLessonProgressFn({
          userId: user.id,
          courseId: currentLesson.courseId,
          lessonId: currentLesson.id,
          isCompleted: newStatus,
        })
      ).unwrap();
      setLessonCompleted(newStatus);
      await dispatch(
        getLessonProgressFn({ userId: user.id, lessonId: currentLesson.id })
      );
      toast.success(
        newStatus ? "Marked as completed!" : "Marked as incomplete!"
      );
    } catch {
      toast.error("Could not update progress");
    }
  };

  // Navigate to another lesson
  const handleLessonClick = (id: string) => {
    setCurrentLessonId(id);
    navigate(`/my-courses/continue/${courseId}/${id}`);
    setIsSidebarOpen(false);
  };

  // Toggle expand/collapse chapter in sidebar
  const toggleChapter = (id: string) => {
    setExpandedChapters((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Calculate previous and next lessons for navigation buttons
  const currentIndex =
    sortedLessons.findIndex((l) => l.id === currentLessonId) ?? 0;
  const prevLesson = sortedLessons[currentIndex - 1];
  const nextLesson = sortedLessons[currentIndex + 1];

  // Early return states
  if (loading) return <div className="p-12 text-center">Loading course...</div>;
  if (!course)
    return (
      <div className="p-12 text-center text-red-500">
        Course not found or no lessons available.
      </div>
    );
  if (!currentLesson)
    return (
      <div className="p-12 text-center text-red-500">
        No lessons found. Please contact admin.
      </div>
    );
  if (!loginUser) return <div>Please login first!</div>;

  // Check enrollment
  const isUserEnrolled = user?.enrollements?.some(
    (en) => en.courseId === +courseId! && en.is_enrolled
  );
  if (!isUserEnrolled) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold text-red-500 mb-2">
            Access Denied
          </h2>
          <p>You must enroll in this course to access its content.</p>
        </div>
      </div>
    );
  }

  // Render main component
  return (
    <div className="flex pb-64 relative bg-gray-50 dark:bg-[#091025] text-gray-900 dark:text-gray-100 overflow-hidden">
      {/* Sidebar Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsSidebarOpen((prev) => !prev);
        }}
        className="fixed top-2 left-56 md:top-4 md:left-72 xl:left-8 z-50 bg-white dark:bg-[#1e293b] border rounded-full p-2 shadow-lg"
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 pb-32 overflow-auto z-50 w-96 bg-white dark:bg-[#101827] border-r px-6 py-6 transition-transform duration-300 ease-in-out transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="text-2xl font-bold mb-6">{course.title}</h1>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <span className="text-sm uppercase">Progress</span>
            <span className="text-sm font-semibold text-blue-600">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full">
            <div
              className="bg-blue-600 h-3 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Chapters and lessons */}
        <nav className="space-y-4">
          {chaptersWithLessons.map((chapter, idx) => {
            const expanded = expandedChapters.includes(chapter.id);
            return (
              <div key={chapter.id}>
                <button
                  onClick={() => toggleChapter(chapter.id)}
                  className="flex justify-between items-center w-full px-4 py-4 bg-gray-100 dark:bg-gray-800 rounded-md"
                >
                  <span>
                    <ChevronRight
                      size={18}
                      className={`inline transition-transform ${
                        expanded ? "rotate-90" : ""
                      }`}
                    />
                    <span className="ml-2 font-medium">
                      Module {idx + 1}:{" "}
                      {chapter.chapterTitle.length > 18
                        ? chapter.chapterTitle.slice(0, 18) + "..."
                        : chapter.chapterTitle}
                    </span>
                  </span>
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                    {chapter.lessons.length}
                  </span>
                </button>

                {expanded && (
                  <ul className="ml-2 mt-2 border-l-2 border-blue-600 pl-4 space-y-1">
                    {chapter.lessons.map((lesson) => {
                      const isActive = lesson.id === currentLessonId;
                      return (
                        <li key={lesson.id}>
                          <button
                            onClick={() => handleLessonClick(lesson.id)}
                            className={`flex items-center text-left gap-2 w-full px-3 py-2 rounded-md ${
                              isActive
                                ? "bg-blue-600 text-white"
                                : "hover:bg-gray-200 dark:hover:bg-gray-700"
                            }`}
                          >
                            <BookOpen size={18} className="mr-2" />
                            <span className="flex-1 truncate">
                              {lesson.title}
                            </span>
                            {completedLessonIds.has(lesson.id) ? (
                              <CheckCircle
                                size={18}
                                className="text-green-500"
                              />
                            ) : (
                              <PlayCircle size={18} className="text-gray-400" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-30 z-30"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <img
              src={
                course?.users?.profilePhoto
                  ? `${BASE_API_URL}/uploads/${course.users.profilePhoto}`
                  : "/default-avatar.png"
              }
              alt="Instructor"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h2 className="text-2xl font-semibold">{currentLesson.title}</h2>
              <p className="text-sm text-gray-500">
                {course.users?.full_name} •{" "}
                {new Date(currentLesson.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-300 px-4 py-3 rounded-lg font-semibold">
              What is {currentLesson.title}?
            </p>
          </div>

          <p className="text-base mb-6 whitespace-pre-line">
            {currentLesson.content}
          </p>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <button
              onClick={completedHandler}
              className={`px-5 py-2 rounded-md text-white font-semibold ${
                lessonCompleted ? "bg-green-600" : "bg-blue-600"
              }`}
            >
              {lessonCompleted ? "Completed (Undo)" : "Mark as Complete"}
            </button>

            {prevLesson && (
              <button
                onClick={() => handleLessonClick(prevLesson.id)}
                className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700"
              >
                ← Previous Lesson
              </button>
            )}

            {nextLesson && (
              <button
                onClick={() => handleLessonClick(nextLesson.id)}
                className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700"
              >
                Next Lesson →
              </button>
            )}
          </div>

          {/* Video Player */}
          <div className="aspect-video w-full rounded-lg overflow-hidden border">
            <Plyr source={source} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContinueCourse;
