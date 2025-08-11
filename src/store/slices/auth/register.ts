import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  iRegisterUserPayload,
  iRegisterUserResponse,
} from "../../../types/user";
import axios, { AxiosError } from "axios";
import { Default_Error_Message } from "../../../constants/default_error";
import { BASE_API_URL } from "../../../constants/base_url";

const initialState = {
  data: {} as iRegisterUserResponse,
  loading: false,
  error: "",
};

export const registerUserFn = createAsyncThunk(
  "/auth/register",
  async (data: iRegisterUserPayload, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("username", data.username);
      formData.append("fullName", data.fullName);
      formData.append("phone_number", data.phone_number);
      formData.append("sex", data.sex);
      formData.append("password", data.password);
      formData.append("comfirmPassword", data.comfirmPassword);
      if (data.profilePhoto) {
        formData.append("profilePhoto", data.profilePhoto);
      }
      if (data.coverPhoto) {
        formData.append("coverPhoto", data.coverPhoto);
      }

      const response = await axios.post(
        `${BASE_API_URL}/users/create`,
        formData,
        {
          headers: {
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

export const registerSlice = createSlice({
  name: "registerSlice",
  initialState,
  reducers: {
    resetRegisterState: (state) => {
      state.data = {} as iRegisterUserResponse;
      state.loading = false;
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder.addCase(registerUserFn.pending, (state) => {
      state.loading = true;
      state.data = {} as iRegisterUserResponse;
      state.error = "";
    });
    builder.addCase(registerUserFn.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = "";
    });
    builder.addCase(registerUserFn.rejected, (state, action) => {
      state.data = {} as iRegisterUserResponse;
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { resetRegisterState } = registerSlice.actions;
