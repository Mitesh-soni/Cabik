import axios from "axios";
import FormData from "form-data";

export const forwardRequest = async (url, method, data = {}, params = {}, file = null, headers = {}) => {
  try {
    let requestData = data;
    let finalHeaders = { ...headers };

    // If file is present, create FormData
    if (file) {
      const formData = new FormData();
      
      // Append the file
      formData.append(file.fieldname, file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype
      });

      // Append other fields
      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });

      requestData = formData;
      finalHeaders = { ...finalHeaders, ...formData.getHeaders() };
    }

    const response = await axios({
      url,
      method,
      data: requestData,
      params,
      headers: finalHeaders,
    });

    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.error || "Internal service error",
      status: error.response?.status || 500,
    };
  }
};