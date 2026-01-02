import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "../../api/orderApi.js";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./invoice.css";
import QRCode from "qrcode";
import logo from "../../assets/Logo.png";

// Function to generate QR Code as data URL
const generateQRCode = async (text) => {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 100,
      margin: 1,
      color: {
        dark: '#667eea',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.log('QR Code generation failed:', err);
    return null;
  }
};

export default function Invoice() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [dealerDetails, setDealerDetails] = useState(null);
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      navigate("/");
      return;
    }

    const fetchOrderData = async () => {
      try {
        const res = await getOrderById(orderId);
        console.log("Order data from API:", res.data);
        setOrder(res.data);

        // Fetch user details
        if (res.data.user_id) {
          try {
            const userRes = await fetch(
              `http://localhost:5000/users/${res.data.user_id}`
            );
            if (userRes.ok) {
              const userData = await userRes.json();
              console.log("User details:", userData);
              // Extract user from nested object if present
              setUserDetails(userData.user || userData.data || userData);
            }
          } catch (err) {
            console.log("Could not fetch user details:", err);
          }
        }

        // Fetch dealer details
        if (res.data.dealer_id) {
          try {
            const dealerRes = await fetch(
              `http://localhost:5000/dealers/${res.data.dealer_id}`
            );
            if (dealerRes.ok) {
              const dealerData = await dealerRes.json();
              console.log("Dealer details:", dealerData);
              // Extract dealer from nested object if present
              setDealerDetails(dealerData.dealer || dealerData.data || dealerData);
            }
          } catch (err) {
            console.log("Could not fetch dealer details:", err);
          }
        }

        // Fetch vehicle details
        if (res.data.vehicle_id && res.data.vehicle_type) {
          try {
            const vehicleType = res.data.vehicle_type.toLowerCase();
            let endpoint = '';
            
            // Map vehicle type to correct endpoint
            if (vehicleType === 'car') {
              endpoint = `http://localhost:5000/vehicles/cars/${res.data.vehicle_id}`;
            } else if (vehicleType === 'bike') {
              endpoint = `http://localhost:5000/vehicles/bikes/${res.data.vehicle_id}`;
            } else if (vehicleType === 'scooty') {
              endpoint = `http://localhost:5000/vehicles/scooties/${res.data.vehicle_id}`;
            }
            
            if (endpoint) {
              const vehicleRes = await fetch(endpoint);
              if (vehicleRes.ok) {
                const vehicleData = await vehicleRes.json();
                console.log("Raw Vehicle Response:", vehicleData);
                // Extract from nested vehicle property if present
                const extractedVehicleData = vehicleData.vehicle || vehicleData.data || vehicleData;
                console.log("Extracted Vehicle Data:", extractedVehicleData);
                setVehicleDetails(extractedVehicleData);
              } else if (vehicleRes.status === 404) {
                console.log("Vehicle not found, using basic info from order");
                // Vehicle doesn't exist, use basic info from order
              } else {
                console.log("Error fetching vehicle:", vehicleRes.status);
              }
            }
          } catch (err) {
            console.log("Could not fetch vehicle details:", err);
          }
        }

        // Generate QR Code
        try {
          const qrDataUrl = await generateQRCode(`https://cabik.com/invoice/${res.data.id}`);
          setQrCode(qrDataUrl);
        } catch (err) {
          console.log("Could not generate QR code:", err);
        }
      } catch (err) {
        console.error(err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId, navigate]);

  const downloadPDF = async () => {
    const invoiceElement = document.getElementById("invoice-content");
    if (!invoiceElement) return;

    try {
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Scale down to fit on single page
      if (imgHeight > pdfHeight) {
        const scale = pdfHeight / imgHeight;
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth * scale, pdfHeight);
      } else {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      }

      pdf.save(`CABIK-Invoice-${orderId}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Error generating PDF. Please try again.");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="invoice-container">
          <div className="loading-spinner">Loading invoice...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (!order) {
    return (
      <>
        <Navbar />
        <div className="invoice-container">
          <div className="error-box">Invoice not found</div>
        </div>
        <Footer />
      </>
    );
  }

  /* EXTRACT ORDER DETAILS */
  const priceBreakdown = order.price_breakdown || {};
  const emiDetails = order.emi_details || null;
  const insuranceDetails = order.insurance_details || null;

  const basePrice = Number(priceBreakdown.ex_showroom_price || order.base_price || order.ex_showroom_price || 0);
  const exShowroom = basePrice;
  const gst = Number(priceBreakdown.gst_amount || Math.round(basePrice * 0.28));
  const rto = Number(priceBreakdown.rto_amount || 45000);
  const insuranceCost = Number(priceBreakdown.insurance_amount || insuranceDetails?.premium_amount || 0);
  const accessories = Number(priceBreakdown.accessories_amount || 0);
  const discount = Number(priceBreakdown.discount_amount || 0);

  const grandTotal = exShowroom + gst + rto + insuranceCost + accessories - discount;

  // Determine payment mode
  let displayPaymentMode = "ONLINE";
  if (emiDetails && emiDetails.bank_name) {
    displayPaymentMode = "EMI";
  } else if (order.payment_method) {
    displayPaymentMode = order.payment_method.toUpperCase();
  }

  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : "N/A";

  const paymentDate = order.paid_at
    ? new Date(order.paid_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      })
    : "Pending";

  // Get customer name and details
  const customerName = userDetails?.full_name || "Customer";
  const customerEmail = userDetails?.email || "N/A";
  const customerPhone = userDetails?.phone || "N/A";

  // Get dealer name (handle both company_name and business_name)
  const dealerName = dealerDetails?.company_name || dealerDetails?.business_name || dealerDetails?.name || "CABIK Dealer";
  const dealerPhone = dealerDetails?.phone || dealerDetails?.mobile || "+91-XXXX-XXXX-XX";
  const dealerEmail = dealerDetails?.email || "dealer@cabik.com";
  const dealerCity = dealerDetails?.city || dealerDetails?.location || "N/A";

  // Get vehicle details with fallbacks
  console.log("Vehicle Details Object:", vehicleDetails);
  console.log("Vehicle Details Keys:", vehicleDetails ? Object.keys(vehicleDetails) : "No data");
  
  const vehicleName = vehicleDetails?.brand || vehicleDetails?.name || "Vehicle";
  const vehicleModel = vehicleDetails?.model || vehicleDetails?.variant || "Model";
  const vehicleYear = vehicleDetails?.launch_year || vehicleDetails?.year || vehicleDetails?.production_year || (order.created_at ? new Date(order.created_at).getFullYear() : "N/A");
  const vehicleColor = vehicleDetails?.colors?.[0] || vehicleDetails?.color || vehicleDetails?.colours || "N/A";
  const vehicleFuelType = vehicleDetails?.fuel_type || vehicleDetails?.fuelType || "N/A";

  return (
    <>
      <Navbar />

      <div className="invoice-container">
        <div className="invoice-actions">
          <button onClick={downloadPDF} className="btn-download">
            Download PDF
          </button>
          <button onClick={() => navigate("/")} className="btn-home">
            Back to Home
          </button>
        </div>

        <div className="invoice-wrapper" id="invoice-content">
          <div className="invoice-header">
            <div className="company-info">
              <img src={logo} alt="CABIK Logo" className="invoice-logo" />
              <p>Vehicle Sales & Financing Platform</p>
              <p>📍 Pan India Operations</p>
              <p>GST: 07AAXXX0K5Z0R1</p>
              <p>Ph: +91-XXXX-XXXX-XX</p>
            </div>
            <div className="invoice-title-section">
              <h2>INVOICE</h2>
              <p className="invoice-number">INV#{orderId}</p>
              <p className="invoice-date">Date: {orderDate}</p>
              <div className={`status-badge ${order.order_status?.toLowerCase()}`}>
                {order.order_status || "PROCESSING"}
              </div>
            </div>
            <div className="qr-code-section">
              {qrCode && (
                <img 
                  src={qrCode} 
                  alt="Invoice QR Code" 
                  style={{ width: '100px', height: '100px', borderRadius: '8px' }}
                />
              )}
              <p className="qr-label">Scan for Details</p>
            </div>
          </div>

          <div className="invoice-parties">
            <div className="party-section">
              <h4>From:</h4>
              <p><strong>{dealerName}</strong></p>
              <p>Authorized CABIK Partner</p>
              {dealerCity && <p>📍 {dealerCity}</p>}
              <p>Mobile: {dealerPhone}</p>
              <p>Email: {dealerEmail}</p>
            </div>
            <div className="party-section">
              <h4>Bill To:</h4>
              <p><strong>{customerName}</strong></p>
              <p>Email: {customerEmail}</p>
              <p>Phone: {customerPhone}</p>
              <p>Address: {userDetails?.address || "N/A"}</p>
            </div>
          </div>

          <div className="invoice-vehicle-details">
            <h3>Vehicle Details</h3>
            <div className="vehicle-info">
              <div className="vehicle-item">
                <span className="vehicle-label">Vehicle:</span>
                <span className="vehicle-value"><strong>{vehicleName} {vehicleModel}</strong></span>
              </div>
              <div className="vehicle-item">
                <span className="vehicle-label">Type:</span>
                <span className="vehicle-value">{order.vehicle_type?.toUpperCase() || "N/A"}</span>
              </div>
              <div className="vehicle-item">
                <span className="vehicle-label">Year:</span>
                <span className="vehicle-value">{vehicleYear}</span>
              </div>
              <div className="vehicle-item">
                <span className="vehicle-label">Color:</span>
                <span className="vehicle-value">{vehicleColor}</span>
              </div>
              <div className="vehicle-item">
                <span className="vehicle-label">Fuel Type:</span>
                <span className="vehicle-value">{vehicleFuelType}</span>
              </div>
            </div>
          </div>

          <div className="invoice-table">
            <table>
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th className="text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="price-row">
                  <td>Ex-Showroom Price</td>
                  <td className="text-right">{exShowroom.toLocaleString("en-IN")}</td>
                </tr>
                <tr className="tax-row">
                  <td>GST @ 28%</td>
                  <td className="text-right">{gst.toLocaleString("en-IN")}</td>
                </tr>
                <tr className="tax-row">
                  <td>RTO & Registration</td>
                  <td className="text-right">{rto.toLocaleString("en-IN")}</td>
                </tr>
                {insuranceCost > 0 && (
                  <tr className="tax-row">
                    <td>Insurance Premium</td>
                    <td className="text-right">{insuranceCost.toLocaleString("en-IN")}</td>
                  </tr>
                )}
                {accessories > 0 && (
                  <tr className="tax-row">
                    <td>Accessories & Add-ons</td>
                    <td className="text-right">{accessories.toLocaleString("en-IN")}</td>
                  </tr>
                )}
                {discount > 0 && (
                  <tr className="discount-row">
                    <td>💰 Discount Applied</td>
                    <td className="text-right">-₹{discount.toLocaleString("en-IN")}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td><strong>GRAND TOTAL</strong></td>
                  <td className="text-right"><strong>₹{grandTotal.toLocaleString("en-IN")}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="invoice-payment">
            <h3>💳 Payment Information</h3>
            <div className="payment-grid">
              <div className="payment-item">
                <span className="payment-label">Mode of Payment:</span>
                <span className="payment-value highlight">{displayPaymentMode}</span>
              </div>
              <div className="payment-item">
                <span className="payment-label">Payment Date:</span>
                <span className="payment-value">{paymentDate}</span>
              </div>
              <div className="payment-item">
                <span className="payment-label">Transaction Reference:</span>
                <span className="payment-value">{order.transaction_id || "TXN#000000"}</span>
              </div>
              <div className="payment-item">
                <span className="payment-label">Payment Status:</span>
                <span className={`payment-value ${order.payment_status?.toLowerCase()}`}>
                  {order.payment_status || "PENDING"}
                </span>
              </div>
            </div>
          </div>

          {emiDetails && emiDetails.bank_name && (
            <div className="invoice-emi">
              <h3>🏦 EMI Details</h3>
              <div className="emi-grid">
                <div className="emi-item">
                  <span className="emi-label">Financing Bank:</span>
                  <span className="emi-value"><strong>{emiDetails.bank_name}</strong></span>
                </div>
                <div className="emi-item">
                  <span className="emi-label">Monthly EMI:</span>
                  <span className="emi-value">₹{Number(emiDetails.monthly_emi || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="emi-item">
                  <span className="emi-label">Interest Rate (p.a.):</span>
                  <span className="emi-value">{emiDetails.interest_rate}%</span>
                </div>
                <div className="emi-item">
                  <span className="emi-label">Tenure:</span>
                  <span className="emi-value">{emiDetails.tenure_years} Years</span>
                </div>
                <div className="emi-item">
                  <span className="emi-label">Down Payment:</span>
                  <span className="emi-value">₹{Number(emiDetails.down_payment || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="emi-item">
                  <span className="emi-label">Processing Fee:</span>
                  <span className="emi-value">₹{Number(emiDetails.processing_fee || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          )}

          {insuranceDetails && insuranceDetails.provider_name && (
            <div className="invoice-insurance">
              <h3>🛡️ Insurance Details</h3>
              <div className="insurance-grid">
                <div className="insurance-item">
                  <span className="insurance-label">Insurance Provider:</span>
                  <span className="insurance-value"><strong>{insuranceDetails.provider_name}</strong></span>
                </div>
                <div className="insurance-item">
                  <span className="insurance-label">Plan Type:</span>
                  <span className="insurance-value">{insuranceDetails.plan_name}</span>
                </div>
                <div className="insurance-item">
                  <span className="insurance-label">Coverage Type:</span>
                  <span className="insurance-value">{insuranceDetails.coverage_type}</span>
                </div>
                <div className="insurance-item">
                  <span className="insurance-label">Annual Premium:</span>
                  <span className="insurance-value">₹{Number(insuranceDetails.premium_amount || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          )}

          <div className="invoice-footer">
            <div className="footer-top">
              <p><strong>Terms & Conditions:</strong></p>
              <p>• This invoice is valid only with official receipt/stamp</p>
              <p>• Please retain this invoice for warranty and service claims</p>
              <p>• Vehicle delivery as per agreed schedule</p>
            </div>
            <div className="footer-signature">
              <div className="sig-item">
                <p className="sig-line"></p>
                <p className="sig-label">Dealer's Signature</p>
              </div>
              <div className="sig-item">
                <p className="sig-line"></p>
                <p className="sig-label">Customer's Signature</p>
              </div>
            </div>
            <p className="footer-note">Thank you for choosing CABIK for your vehicle purchase! 🚗</p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
