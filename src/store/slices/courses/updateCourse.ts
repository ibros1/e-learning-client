import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  iUpdatedCoursePayload,
  iUpdatedCourseResponse,
} from "../../../types/course";
import axios, { AxiosError } from "axios";
import { BASE_API_URL } from "../../../constants/base_url";
import { Default_Error_Message } from "../../../constants/default_error";
import type { RootState } from "../../store";

const initialState = {
  data: {} as iUpdatedCourseResponse,
  loading: false,
  error: "",
};

export const updateCourseFn = createAsyncThunk(
  "courses/update",
  async (payload: iUpdatedCoursePayload, { rejectWithValue, getState }) => {
    try {
      const appState = getState() as RootState;
      const token = appState.loginSlice.data?.token;
      const formData = new FormData();

      formData.append("id", payload.id.toString());
      formData.append("title", payload.title);
      formData.append("description", payload.description);
      formData.append("price", payload.price.toString());
      formData.append("preview_course", payload.preview_course);
      formData.append("isPublished", String(payload.isPublished));

      if (payload.course_img) {
        formData.append("course_img", payload.course_img);
      }

      if (payload.cover_img) {
        formData.append("cover_img", payload.cover_img);
      }

      const response = await axios.put(
        `${BASE_API_URL}/courses/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(
          error.response?.data.message || Default_Error_Message
        );
      }
      return rejectWithValue(Default_Error_Message);
    }
  }
);

export const updateCourseSlice = createSlice({
  name: "Update Course Slice",
  initialState,
  reducers: {
    resetUpdateCourseSlice: (state) => {
      state.data = {} as iUpdatedCourseResponse;
      state.loading = false;
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateCourseFn.pending, (state) => {
      state.loading = true;
      state.data = {} as iUpdatedCourseResponse;
      state.error = "";
    });
    builder.addCase(updateCourseFn.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = "";
    });
    builder.addCase(updateCourseFn.rejected, (state, action) => {
      state.data = {} as iUpdatedCourseResponse;
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { resetUpdateCourseSlice } = updateCourseSlice.actions;
