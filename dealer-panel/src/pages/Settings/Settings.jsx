import { useState, useEffect } from "react";
import { useDealer } from "../../contexts/DealerContext.jsx";
import "./Settings.css";

export default function Settings() {
  const { dealer } = useDealer();
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    business_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstin: "",
    pan: ""
  });
  const [bankData, setBankData] = useState({
    account_holder: "",
    account_number: "",
    ifsc_code: "",
    bank_name: ""
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load dealer profile data
    if (dealer) {
      setFormData({
        business_name: dealer.business_name || "",
        email: dealer.email || "",
        phone: dealer.phone || "",
        address: dealer.address || "",
        city: dealer.city || "",
        state: dealer.state || "",
        pincode: dealer.pincode || "",
        gstin: dealer.gstin || "",
        pan: dealer.pan || ""
      });
    }
  }, [dealer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBankInputChange = (e) => {
    const { name, value } = e.target;
    setBankData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // API call would go here
      console.log("Saving profile:", formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBankDetails = async () => {
    setLoading(true);
    try {
      // API call would go here
      console.log("Saving bank details:", bankData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving bank details:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings & Profile</h1>
        <p>Manage your dealer account and business information</p>
      </div>

      {saved && <div className="success-message">✓ Changes saved successfully!</div>}

      <div className="settings-content">
        {/* TABS */}
        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile Information
          </button>
          <button
            className={`tab-btn ${activeTab === "business" ? "active" : ""}`}
            onClick={() => setActiveTab("business")}
          >
            Business Details
          </button>
          <button
            className={`tab-btn ${activeTab === "bank" ? "active" : ""}`}
            onClick={() => setActiveTab("bank")}
          >
            Bank Details
          </button>
          <button
            className={`tab-btn ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            Security
          </button>
        </div>

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="settings-form">
            <h2>Profile Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Business Name</label>
                <input
                  type="text"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleInputChange}
                  placeholder="Your business name"
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Street address"
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State"
                />
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="XXXXXX"
                />
              </div>
            </div>
            <button className="save-btn" onClick={handleSaveProfile} disabled={loading}>
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        )}

        {/* BUSINESS TAB */}
        {activeTab === "business" && (
          <div className="settings-form">
            <h2>Business Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>GSTIN</label>
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleInputChange}
                  placeholder="XXXXXXXXXXX"
                />
                <small>Goods and Services Tax Identification Number</small>
              </div>
              <div className="form-group">
                <label>PAN Number</label>
                <input
                  type="text"
                  name="pan"
                  value={formData.pan}
                  onChange={handleInputChange}
                  placeholder="XXXXXXXXXXX"
                />
                <small>Permanent Account Number</small>
              </div>
            </div>
            <div className="info-box">
              <h3>Business Registration Status</h3>
              <p>Your business is verified and active ✓</p>
              <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "5px" }}>
                Verification completed on: {new Date().toLocaleDateString("en-IN")}
              </p>
            </div>
            <button className="save-btn" onClick={handleSaveProfile} disabled={loading}>
              {loading ? "Saving..." : "Update Business Details"}
            </button>
          </div>
        )}

        {/* BANK DETAILS TAB */}
        {activeTab === "bank" && (
          <div className="settings-form">
            <h2>Bank Account Details</h2>
            <div className="warning-box">
              <p>⚠️ Bank details are encrypted and secure. Your account information will never be shared.</p>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Account Holder Name</label>
                <input
                  type="text"
                  name="account_holder"
                  value={bankData.account_holder}
                  onChange={handleBankInputChange}
                  placeholder="Full name"
                />
              </div>
              <div className="form-group">
                <label>Bank Name</label>
                <input
                  type="text"
                  name="bank_name"
                  value={bankData.bank_name}
                  onChange={handleBankInputChange}
                  placeholder="Bank name"
                />
              </div>
              <div className="form-group">
                <label>Account Number</label>
                <input
                  type="text"
                  name="account_number"
                  value={bankData.account_number}
                  onChange={handleBankInputChange}
                  placeholder="Account number"
                />
              </div>
              <div className="form-group">
                <label>IFSC Code</label>
                <input
                  type="text"
                  name="ifsc_code"
                  value={bankData.ifsc_code}
                  onChange={handleBankInputChange}
                  placeholder="XXXXXXXXXXX"
                />
              </div>
            </div>
            <button className="save-btn" onClick={handleSaveBankDetails} disabled={loading}>
              {loading ? "Saving..." : "Save Bank Details"}
            </button>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === "security" && (
          <div className="settings-form">
            <h2>Security Settings</h2>
            <div className="security-section">
              <h3>Change Password</h3>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Current Password</label>
                  <input type="password" placeholder="Enter current password" />
                </div>
                <div className="form-group full">
                  <label>New Password</label>
                  <input type="password" placeholder="Enter new password" />
                </div>
                <div className="form-group full">
                  <label>Confirm Password</label>
                  <input type="password" placeholder="Confirm new password" />
                </div>
              </div>
              <button className="save-btn">Update Password</button>
            </div>

            <div className="security-section" style={{ marginTop: "40px" }}>
              <h3>Two-Factor Authentication</h3>
              <p>Enhance your account security with 2FA</p>
              <button className="secondary-btn">Enable 2FA</button>
            </div>

            <div className="security-section" style={{ marginTop: "40px" }}>
              <h3>Active Sessions</h3>
              <div className="session-item">
                <span>🖥️ Windows - Chrome</span>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>Last active: Just now</span>
                <button className="logout-btn">Logout</button>
              </div>
              <div className="session-item">
                <span>📱 Mobile - Safari</span>
                <span style={{ fontSize: "12px", color: "#6b7280" }}>Last active: 2 hours ago</span>
                <button className="logout-btn">Logout</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
