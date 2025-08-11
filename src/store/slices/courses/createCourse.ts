import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  iCreatedCoursePayload,
  iCreatedUserResponse,
} from "../../../types/course";
import axios, { AxiosError } from "axios";
import { BASE_API_URL } from "../../../constants/base_url";
import { Default_Error_Message } from "../../../constants/default_error";
import type { RootState } from "../../store";

const initialState = {
  data: {} as iCreatedUserResponse,
  loading: false,
  error: "",
};

export const createCourseFn = createAsyncThunk(
  "/courses/create",
  async (data: iCreatedCoursePayload, { rejectWithValue, getState }) => {
    try {
      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("price", data.price.toString());
      formData.append("preview_course", data.preview_course);
      formData.append("isPublished", data.isPublished.toString());
      formData.append("course_img", data.course_img);
      formData.append("cover_img", data.cover_img);

      const appState = getState() as RootState;
      const token = appState.loginSlice.data.token;
      const response = await axios.post(
        `${BASE_API_URL}/courses/create`,
        data,
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

export const createCourseSlice = createSlice({
  name: "Create Course Slice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(createCourseFn.pending, (state) => {
      state.loading = true;
      state.data = {} as iCreatedUserResponse;
      state.error = "";
    });
    builder.addCase(createCourseFn.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = "";
    });
    builder.addCase(createCourseFn.rejected, (state, action) => {
      state.data = {} as iCreatedUserResponse;
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});
