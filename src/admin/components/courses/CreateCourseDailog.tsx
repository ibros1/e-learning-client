import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { Textarea } from "../../../components/ui/textarea";
import { Switch } from "../../../components/ui/switch";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as yup from "yup";
import { useEffect } from "react";
import toast from "react-hot-toast";
import {
  ImagePlus,
  BadgeDollarSign,
  BookOpen,
  Youtube,
  UploadCloud,
} from "lucide-react";

import { type AppDispatch, type RootState } from "../../../store/store";
import { createCourseFn } from "../../../store/slices/courses/createCourse";
import {
  createCourseRedu,
  listCoursesFn,
} from "../../../store/slices/courses/listCourse";

const CreateCourseDialog = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, data } = useSelector(
    (state: RootState) => state.createCourseSlice
  );

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      preview_course: "",
      isPublished: false,
      price: 0,
      course_img: null as File | null,
      cover_img: null as File | null,
    },
    validationSchema: yup.object({
      title: yup.string().required("Course title is required").min(4),
      description: yup.string().required("Description is required"),
      course_img: yup.mixed().required("Course image is required"),
      cover_img: yup.mixed().required("Cover image is required"),
      preview_course: yup
        .string()
        .url("Must be a valid URL")
        .required("Preview link is required"),
      price: yup.number().min(0, "Price must be positive"),
    }),
    onSubmit: (values) => {
      const formData = new FormData();

      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("price", values.price.toString());
      formData.append("isPublished", values.isPublished.toString());
      formData.append("preview_course", values.preview_course);

      if (values.course_img) {
        formData.append("course_img", values.course_img);
      }
      if (values.cover_img) {
        formData.append("cover_img", values.cover_img); // Fixed typo here
      }

      dispatch(createCourseFn(formData));
    },
  });

  useEffect(() => {
    if (loading) {
      const toastId = toast.loading("Creating course...");
      return () => toast.dismiss(toastId);
    }

    if (error) {
      toast.error(error);
    }

    if (data?.isSuccess) {
      toast.success("Course created successfully!");
      dispatch(createCourseRedu(data.course));
      formik.resetForm();
      // Consider using refetch logic instead of reload
      dispatch(listCoursesFn()); // Add this if you have a listCoursesFn action
    }
  }, [loading, error, data, dispatch]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-primary text-white px-6 py-2 rounded-full flex items-center gap-2 shadow hover:scale-105 transition">
          <BookOpen size={18} />
          Create Course
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl p-6 md:p-8 rounded-xl border bg-background shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            📘 Create New Course
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={formik.handleSubmit}
          className="grid gap-6 mt-6"
          encType="multipart/form-data"
        >
          {/* Title & Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title" className="flex items-center gap-1">
                <BookOpen size={16} />
                Title
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Modern JavaScript"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.title && formik.errors.title && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.title}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="price" className="flex items-center gap-1">
                <BadgeDollarSign size={16} />
                Price ($)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.price && formik.errors.price && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.price}
                </p>
              )}
            </div>
          </div>

          {/* Course & Cover Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="course_img" className="flex items-center gap-1">
                <ImagePlus size={16} />
                Course Image
              </Label>
              <Input
                id="course_img"
                name="course_img"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  formik.setFieldValue(
                    "course_img",
                    e.currentTarget.files?.[0] || null
                  );
                  formik.setFieldTouched("course_img", true);
                }}
              />
              {formik.touched.course_img && formik.errors.course_img && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.course_img}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="cover_img" className="flex items-center gap-1">
                <UploadCloud size={16} />
                Cover Image
              </Label>
              <Input
                id="cover_img"
                name="cover_img"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  formik.setFieldValue(
                    "cover_img",
                    e.currentTarget.files?.[0] || null
                  );
                  formik.setFieldTouched("cover_img", true);
                }}
              />
              {formik.touched.cover_img && formik.errors.cover_img && (
                <p className="text-sm text-red-500 mt-1">
                  {formik.errors.cover_img}
                </p>
              )}
            </div>
          </div>

          {/* Preview Link */}
          <div>
            <Label htmlFor="preview_course" className="flex items-center gap-1">
              <Youtube size={16} />
              Preview Link
            </Label>
            <Input
              id="preview_course"
              name="preview_course"
              placeholder="https://youtube.com/..."
              value={formik.values.preview_course}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.preview_course && formik.errors.preview_course && (
              <p className="text-sm text-red-500 mt-1">
                {formik.errors.preview_course}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Describe the course content..."
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.description && formik.errors.description && (
              <p className="text-sm text-red-500 mt-1">
                {formik.errors.description}
              </p>
            )}
          </div>

          {/* Publish Switch */}
          <div className="flex items-center gap-3">
            <Switch
              id="isPublished"
              checked={formik.values.isPublished}
              onCheckedChange={(checked) =>
                formik.setFieldValue("isPublished", checked)
              }
            />
            <Label htmlFor="isPublished">Publish Immediately</Label>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full"
              disabled={loading}
            >
              {loading ? "Creating..." : "🚀 Save Course"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCourseDialog;
