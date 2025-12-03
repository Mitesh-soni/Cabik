import axios from "axios";

export const forwardRequest = async (url, method, data = {}, params = {}) => {
  try {
    const response = await axios({
      url,
      method,
      data,
      params,
    });

    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.error || "Internal service error",
      status: error.response?.status || 500,
    };
  }
};