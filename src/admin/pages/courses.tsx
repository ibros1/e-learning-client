import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "../../components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import { type AppDispatch, type RootState } from "../../store/store";
import { listCoursesFn } from "../../store/slices/courses/listCourse";

import { Pencil, Trash2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import {
  faPenToSquare,
  faBook,
  faDollarSign,
  faImage,
  faPhotoFilm,
  faVideo,
  faFileLines,
  faCircleCheck,
  faCircleXmark,
  faFloppyDisk,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import {
  resetUpdateCourseSlice,
  updateCourseFn,
} from "../../store/slices/courses/updateCourse";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  deleteCoursesFn,
  resetDeleteCourseState,
} from "../../store/slices/courses/deleteCourse";
import CreateCourseDialog from "../components/courses/CreateCourseDailog";
import type { Course } from "../../types/course";

const AdminCourses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"ALL" | "PUBLISHED" | "UNPUBLISHED">(
    "ALL"
  );

  const dispatch = useDispatch<AppDispatch>();
  const coursesState = useSelector(
    (state: RootState) => state.listCoursesSlice
  );
  const loginState = useSelector((state: RootState) => state.loginSlice);
  const updateCourseState = useSelector(
    (state: RootState) => state.updateCourseSlice
  );
  const deleteCourseState = useSelector(
    (state: RootState) => state.deleteCoursesSlice
  );
  const allCourses = coursesState.data?.courses || [];
  const courses = allCourses;

  // Calculate summary counts for info cards
  const totalCourses = courses.length;
  const publishedCourses = courses.filter((c) => c.is_published).length;
  const unpublishedCourses = courses.filter((c) => !c.is_published).length;
  const onSaleCourses = courses.filter((c) => c.price > 0).length;

  // Load courses when admin is logged in
  useEffect(() => {
    if (loginState.data.isSuccess) dispatch(listCoursesFn());
  }, [dispatch, loginState.data.isSuccess]);

  // Form and dialog state
  const [isEditCourseDialogOpen, setIsEditCourseDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isDeletedDailogOpen, setIsDeletedDailogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [isPublished, setisPublished] = useState(false);
  const [course_img, setCourse_img] = useState<File | null>(null);
  const [cover_img, setCover_img] = useState<File | null>(null);
  const [preview_course, setPreview_course] = useState("");
  const [price, setPrice] = useState<number>(0);

  // Load selected course data into form when selection changes
  useEffect(() => {
    if (selectedCourse) {
      setTitle(selectedCourse.title);
      setDesc(selectedCourse.description);
      setPrice(Number(selectedCourse.price));
      setisPublished(selectedCourse.is_published);
      setPreview_course(selectedCourse.preview_course_url || "");
      setCourse_img(null); // Reset files on new selection
      setCover_img(null);
    }
  }, [selectedCourse]);

  // Close dialog and refresh list after successful update
  useEffect(() => {
    if (updateCourseState.data.isSuccess) {
      setIsEditCourseDialogOpen(false);
      setSelectedCourse(null);
      toast.success("Successfully Updated Course");
      dispatch(listCoursesFn());
      dispatch(resetUpdateCourseSlice());
    }
  }, [updateCourseState.data.isSuccess, dispatch]);

  useEffect(() => {
    if (deleteCourseState.error) {
      toast.error(deleteCourseState.error);
      return;
    }
    if (deleteCourseState.data.isSuccess) {
      toast.success("Successfully Deleted Course!");
      dispatch(resetDeleteCourseState());
      dispatch(listCoursesFn());
    }
  }, [deleteCourseState, dispatch]);

  // Handle course update form submit
  const updateHandleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    const formData = new FormData();
    formData.append("id", selectedCourse.id.toString());
    formData.append("title", title);
    formData.append("description", desc);
    formData.append("price", price.toString());
    formData.append("isPublished", isPublished.toString()); // Corrected key name
    formData.append("preview_course", preview_course);

    if (course_img) {
      formData.append("course_img", course_img); // Corrected key name
    }
    if (cover_img) {
      formData.append("cover_img", cover_img); // Corrected key name
    }

    dispatch(updateCourseFn(formData));
  };
  const courseId = selectedCourse?.id;
  const deleteCourseHandler = () => {
    dispatch(deleteCoursesFn(Number(courseId!)));
  };

  // Filter courses based on search and status filter
  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) => {
        const matchesSearch =
          course.id.toString().includes(searchTerm) ||
          course.price.toString().includes(searchTerm) ||
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
          filter === "ALL"
            ? true
            : filter === "PUBLISHED"
            ? course.is_published
            : !course.is_published;
        return matchesSearch && matchesFilter;
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [courses, searchTerm, filter]);

  if (!loginState.data.isSuccess) {
    return (
      <div className="text-center text-2xl text-red-600 font-bold py-10">
        Please Login First
      </div>
    );
  }

  return (
    <div className="p-6 dark:bg-[#091025] min-h-screen text-gray-900 dark:text-white">
      {/* Info Cards / Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Total Courses */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg hover:scale-[1.02] transition">
          <div className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 p-3 rounded-full">
            <FontAwesomeIcon icon={faBook} className="text-2xl" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {totalCourses}
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Total Courses
            </div>
          </div>
        </div>

        {/* Published */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm rounded-2xl p-6 flex  items-center gap-4 hover:shadow-lg hover:scale-[1.02] transition">
          <div className="bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 p-3 rounded-full">
            <FontAwesomeIcon icon={faCircleCheck} className="text-2xl" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white ">
              {publishedCourses}
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Published
            </div>
          </div>
        </div>

        {/* Draft */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg hover:scale-[1.02] transition">
          <div className="bg-yellow-100 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-200 p-3 rounded-full">
            <FontAwesomeIcon icon={faCircleXmark} className="text-2xl" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {unpublishedCourses}
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Draft
            </div>
          </div>
        </div>

        {/* On Sale */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm rounded-2xl p-6 flex items-center gap-4 hover:shadow-lg hover:scale-[1.02] transition">
          <div className="bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200 p-3 rounded-full">
            <FontAwesomeIcon icon={faDollarSign} className="text-2xl" />
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {onSaleCourses}
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              On Sale
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="relative w-full md:max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search by id, title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition shadow-sm dark:bg-gray-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap   lg:gap-3">
          {["ALL", "PUBLISHED", "UNPUBLISHED"].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as typeof filter)}
              className={` my-4 px-5 rounded-full text-sm font-semibold transition ${
                filter === type
                  ? "bg-blue-600 text-white shadow-md "
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              aria-pressed={filter === type}
            >
              {type}
            </button>
          ))}

          <div className="py-4">
            <CreateCourseDialog />
          </div>
        </div>
      </div>

      {/* Course Table */}
      <div className="overflow-x-auto rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
            <tr>
              {[
                "#id",
                "Image",
                "Title",
                "Description",
                "Price",
                "Status",
                "Created At",
                "Preview",
                "Author",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredCourses.map((course) => (
              <tr
                key={course.id}
                className="hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors"
              >
                {/* Course Id */}
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  #{course.id}
                </td>
                {/* Course Image */}
                <td className="px-6 py-4">
                  <img
                    src={`${course.course_img}`}
                    alt={course.title}
                    className="w-12 h-12 rounded-lg object-cover shadow-sm"
                  />
                </td>

                {/* Course Title */}
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  {course.title}
                </td>

                {/* Course Description */}
                <td
                  className="px-6 py-4 max-w-xs truncate text-gray-700 dark:text-gray-300"
                  title={course.description}
                >
                  {course.description}
                </td>

                {/* Course Price */}
                <td className="px-6 py-4 text-green-600 font-semibold whitespace-nowrap">
                  ${course.price.toFixed(2)}
                </td>

                {/* Publish Status Badge */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      course.is_published
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {course.is_published ? "Published" : "Draft"}
                  </span>
                </td>

                {/* Created At */}
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {new Date(course.created_at).toLocaleDateString("en-Us", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })}
                </td>

                {/* Preview Link */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <a
                    href={course.preview_course_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    View
                  </a>
                </td>

                {/* Author Photo & Name */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <img
                      src={`${course.users?.profilePhoto}`}
                      alt={course.users?.full_name}
                      className="w-10 h-10 rounded-full object-cover shadow"
                    />
                    <span
                      className="text-gray-900 dark:text-white font-medium truncate max-w-[120px]"
                      title={course.users?.full_name}
                    >
                      {course.users?.full_name}
                    </span>
                  </div>
                </td>

                {/* Action Buttons */}
                <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Edit course"
                    onClick={() => {
                      setSelectedCourse(course);
                      setIsEditCourseDialogOpen(true);
                    }}
                    className="hover:bg-yellow-100 dark:hover:bg-yellow-700 transition p-2 rounded-md"
                  >
                    <Pencil className="text-yellow-600 w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Delete course"
                    onClick={() => {
                      setSelectedCourse(course);
                      setIsDeletedDailogOpen(true);
                    }}
                    className="hover:bg-red-100 dark:hover:bg-red-700 transition p-2 rounded-md"
                  >
                    <Trash2 className="text-red-600 w-5 h-5" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Course Dialog */}
      <Dialog
        open={isEditCourseDialogOpen}
        onOpenChange={setIsEditCourseDialogOpen}
      >
        <DialogContent className="sm:max-w-4xl p-8 rounded-3xl shadow-2xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-3xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
              <FontAwesomeIcon icon={faPenToSquare} /> Edit Course
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Modify the course details below and click "Save Course" when done.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={updateHandleSubmit} className="space-y-8" noValidate>
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Label
                  htmlFor="title"
                  className="mb-2 block text-gray-700 dark:text-gray-300 font-semibold"
                >
                  <FontAwesomeIcon icon={faBook} /> Course Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-500 transition dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <Label
                  htmlFor="price"
                  className="mb-2 block text-gray-700 dark:text-gray-300 font-semibold"
                >
                  <FontAwesomeIcon icon={faDollarSign} /> Price (USD)
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-500 transition dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Media Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Label
                  htmlFor="course_img"
                  className="mb-2  text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-1"
                >
                  <FontAwesomeIcon icon={faImage} /> Course Thumbnail
                </Label>
                <Input
                  key={selectedCourse?.id ?? "new-course_img"}
                  id="course_img"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCourse_img(e.target.files?.[0] || null)}
                  className="file:rounded-xl file:bg-blue-50 dark:file:bg-gray-800 file:border-0 file:text-blue-600 dark:file:text-white shadow-inner"
                />
              </div>
              <div>
                <Label
                  htmlFor="cover_img"
                  className="mb-2  text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-1"
                >
                  <FontAwesomeIcon icon={faPhotoFilm} /> Cover Image
                </Label>
                <Input
                  key={selectedCourse?.id ?? "new-cover_img"}
                  id="cover_img"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCover_img(e.target.files?.[0] || null)}
                  className="file:rounded-xl file:bg-blue-50 dark:file:bg-gray-800 file:border-0 file:text-blue-600 dark:file:text-white shadow-inner"
                />
              </div>
            </div>

            {/* Preview & Description */}
            <div>
              <Label
                htmlFor="preview_course"
                className="mb-2  text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-1"
              >
                <FontAwesomeIcon icon={faVideo} /> Preview Video (YouTube URL)
              </Label>
              <Input
                id="preview_course"
                value={preview_course}
                onChange={(e) => setPreview_course(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-500 transition dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div>
              <Label
                htmlFor="description"
                className="mb-2  text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-1"
              >
                <FontAwesomeIcon icon={faFileLines} /> Description
              </Label>
              <Textarea
                id="description"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 px-4 py-3 shadow-sm focus:ring-2 focus:ring-blue-500 transition min-h-[140px] dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center gap-4">
              <Switch
                id="isPublished"
                checked={isPublished}
                onCheckedChange={setisPublished}
              />
              <Label
                htmlFor="isPublished"
                className="text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-2"
              >
                <FontAwesomeIcon
                  icon={isPublished ? faCircleCheck : faCircleXmark}
                  className={isPublished ? "text-green-500" : "text-red-500"}
                />
                {isPublished ? "Published" : "Unpublished"}
              </Label>
            </div>

            {/* Save Button */}
            <div className="pt-8 flex justify-end">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl shadow-lg transition flex items-center gap-3 font-semibold"
              >
                <FontAwesomeIcon icon={faFloppyDisk} />
                Save Course
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeletedDailogOpen}
        onOpenChange={setIsDeletedDailogOpen}
      >
        <AlertDialogContent className="rounded-2xl p-6 shadow-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Are you absolutely sure to delete this course?
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2 text-gray-600 dark:text-gray-400">
              This action cannot be undone. This will permanently delete the
              course and remove it from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex justify-end gap-4">
            <AlertDialogCancel className="px-6 py-2 rounded-lg border border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteCourseHandler}
              className="px-6 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCourses;
