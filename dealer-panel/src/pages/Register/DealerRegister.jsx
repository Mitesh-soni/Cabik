import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { dealerRegister } from "../../api/dealerApi";
import logo from "../../assets/Logo.png";
import "./DealerRegister.css";

export default function DealerRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    owner_name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    whatsapp_number: "",
    gst_number: "",
    license_number: "",
    pan_number: "",
    cin_number: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
    license_document: null
  });

  const [errors, setErrors] = useState({});
  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ 
          ...prev, 
          license_document: "Only JPG, PNG, and PDF files are allowed" 
        }));
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ 
          ...prev, 
          license_document: "File size must be less than 5MB" 
        }));
        return;
      }

      setFormData(prev => ({ ...prev, license_document: file }));
      setFileName(file.name);
      setErrors(prev => ({ ...prev, license_document: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.company_name.trim()) {
      newErrors.company_name = "Company name is required";
    }

    if (!formData.owner_name.trim()) {
      newErrors.owner_name = "Owner name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^[0-9]{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    // Optional but validated if provided
    if (formData.gst_number && formData.gst_number.trim()) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (!gstRegex.test(formData.gst_number)) {
        newErrors.gst_number = "Invalid GST format (e.g., 22AAAAA0000A1Z5)";
      }
    }

    if (formData.pan_number && formData.pan_number.trim()) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!panRegex.test(formData.pan_number)) {
        newErrors.pan_number = "Invalid PAN format (e.g., ABCDE1234F)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Append all text fields (including empty optional ones as null)
      Object.keys(formData).forEach(key => {
        if (key !== "license_document" && key !== "confirmPassword") {
          const value = formData[key];
          // Only append if field has a value
          if (value && typeof value !== "object") {
            formDataToSend.append(key, value);
          }
        }
      });

      // Append file if exists
      if (formData.license_document) {
        formDataToSend.append("license_document", formData.license_document);
      }

      const response = await dealerRegister(formDataToSend);
      
      if (response.data.success) {
        alert("Registration successful! Please login with your credentials.");
        navigate("/login");
      }
    } catch (err) {
      // Handle validation errors
      if (err.response?.data?.errors) {
        const serverErrors = err.response.data.errors;
        setErrors(serverErrors);
        setError("Please correct the errors below and try again.");
      } else {
        setError(err.response?.data?.error || "Registration failed. Please try again.");
      }
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dealer-register-container">
      <div className="dealer-register-wrapper">
        <div className="dealer-register-card">
          <div className="dealer-register-header">
            <img src={logo} alt="Cabik Logo" className="register-logo" />
            <h1>Dealer Registration</h1>
            <p>Join CABIK and grow your business</p>
          </div>

          <form onSubmit={handleSubmit} className="dealer-register-form" encType="multipart/form-data">
            {error && <div className="error-alert">{error}</div>}

            {/* Company Information */}
            <div className="form-section">
              <h3>Company Information</h3>
              
              <div className="form-group">
                <label htmlFor="company_name">Company Name *</label>
                <input
                  type="text"
                  id="company_name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  className={errors.company_name ? "error" : ""}
                  placeholder="Enter company name"
                />
                {errors.company_name && <span className="error-text">{errors.company_name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="owner_name">Owner Name *</label>
                <input
                  type="text"
                  id="owner_name"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleChange}
                  className={errors.owner_name ? "error" : ""}
                  placeholder="Enter owner name"
                />
                {errors.owner_name && <span className="error-text">{errors.owner_name}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="gst_number">GST Number</label>
                  <input
                    type="text"
                    id="gst_number"
                    name="gst_number"
                    value={formData.gst_number}
                    onChange={handleChange}
                    className={errors.gst_number ? "error" : ""}
                    placeholder="22AAAAA0000A1Z5"
                  />
                  {errors.gst_number && <span className="error-text">{errors.gst_number}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="pan_number">PAN Number</label>
                  <input
                    type="text"
                    id="pan_number"
                    name="pan_number"
                    value={formData.pan_number}
                    onChange={handleChange}
                    className={errors.pan_number ? "error" : ""}
                    placeholder="ABCDE1234F"
                  />
                  {errors.pan_number && <span className="error-text">{errors.pan_number}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="license_number">License Number</label>
                  <input
                    type="text"
                    id="license_number"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleChange}
                    placeholder="Enter license number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="cin_number">CIN Number</label>
                  <input
                    type="text"
                    id="cin_number"
                    name="cin_number"
                    value={formData.cin_number}
                    onChange={handleChange}
                    placeholder="Enter CIN number"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="license_document">Upload License Document</label>
                <div className="file-upload-wrapper">
                  <input
                    type="file"
                    id="license_document"
                    name="license_document"
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="file-input"
                  />
                  <label htmlFor="license_document" className="file-label">
                    {fileName || "Choose file (JPG, PNG, PDF - Max 5MB)"}
                  </label>
                </div>
                {errors.license_document && <span className="error-text">{errors.license_document}</span>}
              </div>
            </div>

            {/* Contact Information */}
            <div className="form-section">
              <h3>Contact Information</h3>
              
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "error" : ""}
                  placeholder="dealer@example.com"
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={errors.phone ? "error" : ""}
                    placeholder="10-digit number"
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="whatsapp_number">WhatsApp Number</label>
                  <input
                    type="tel"
                    id="whatsapp_number"
                    name="whatsapp_number"
                    value={formData.whatsapp_number}
                    onChange={handleChange}
                    placeholder="10-digit number"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="form-section">
              <h3>Address Information</h3>
              
              <div className="form-group">
                <label htmlFor="address_line1">Address Line 1</label>
                <input
                  type="text"
                  id="address_line1"
                  name="address_line1"
                  value={formData.address_line1}
                  onChange={handleChange}
                  placeholder="Street, Building"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address_line2">Address Line 2</label>
                <input
                  type="text"
                  id="address_line2"
                  name="address_line2"
                  value={formData.address_line2}
                  onChange={handleChange}
                  placeholder="Area, Landmark"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={errors.city ? "error" : ""}
                    placeholder="Enter city"
                  />
                  {errors.city && <span className="error-text">{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="state">State *</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={errors.state ? "error" : ""}
                    placeholder="Enter state"
                  />
                  {errors.state && <span className="error-text">{errors.state}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="pincode">Pincode *</label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className={errors.pincode ? "error" : ""}
                    placeholder="6-digit code"
                  />
                  {errors.pincode && <span className="error-text">{errors.pincode}</span>}
                </div>
              </div>
            </div>

            {/* Password Information */}
            <div className="form-section">
              <h3>Account Security</h3>
              
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={errors.password ? "error" : ""}
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={errors.confirmPassword ? "error" : ""}
                    placeholder="Re-enter password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-register">
              {loading ? "Registering..." : "Register"}
            </button>
          </form>

          <div className="dealer-register-footer">
            <p>Already have an account? <a href="/login">Login here</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}
