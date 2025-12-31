import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "../../api/orderApi.js";
import Navbar from "../../components/Navbar.jsx";
import Footer from "../../components/Footer.jsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "./invoice.css";

export default function Invoice() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      navigate("/");
      return;
    }

    const fetchOrder = async () => {
      try {
        const res = await getOrderById(orderId);
        console.log("Order data from API:", res.data);
        console.log("Insurance details:", res.data?.insurance_details);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  const downloadPDF = async () => {
    const invoiceElement = document.getElementById("invoice-content");
    if (!invoiceElement) return;

    const canvas = await html2canvas(invoiceElement, {
      scale: 2,
      useCORS: true,
      logging: false
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Invoice-${orderId}.pdf`);
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
              <h1>CABIK</h1>
              <p>Vehicle Sales & Financing Platform</p>
              <p>India</p>
              <p>GST: XXXXXXXXXXXX</p>
            </div>
            <div className="invoice-title">
              <h2>INVOICE</h2>
              <p className="invoice-number">#{orderId}</p>
              <p className="invoice-date">Date: {orderDate}</p>
              <div className={`status-badge ${order.order_status?.toLowerCase()}`}>
                {order.order_status || "PROCESSING"}
              </div>
            </div>
          </div>

          <div className="invoice-customer">
            <h3>Customer Details</h3>
            <p><strong>User ID:</strong> {order.user_id}</p>
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Vehicle Type:</strong> {order.vehicle_type}</p>
            <p><strong>Vehicle ID:</strong> {order.vehicle_id}</p>
            <p><strong>Dealer ID:</strong> {order.dealer_id}</p>
          </div>

          <div className="invoice-table">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Ex-Showroom Price</td>
                  <td className="text-right">{exShowroom.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td>GST (28%)</td>
                  <td className="text-right">{gst.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td>RTO Charges</td>
                  <td className="text-right">{rto.toLocaleString("en-IN")}</td>
                </tr>
                <tr>
                  <td>Insurance</td>
                  <td className="text-right">{insuranceCost.toLocaleString("en-IN")}</td>
                </tr>
                {accessories > 0 && (
                  <tr>
                    <td>Accessories</td>
                    <td className="text-right">{accessories.toLocaleString("en-IN")}</td>
                  </tr>
                )}
                {discount > 0 && (
                  <tr className="discount-row">
                    <td>Discount</td>
                    <td className="text-right">-{discount.toLocaleString("en-IN")}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td><strong>Grand Total</strong></td>
                  <td className="text-right"><strong>₹ {grandTotal.toLocaleString("en-IN")}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="invoice-payment">
            <h3>Payment Information</h3>
            <div className="payment-grid">
              <div className="payment-item">
                <span className="payment-label">Payment Mode:</span>
                <span className="payment-value highlight">{displayPaymentMode}</span>
              </div>
              <div className="payment-item">
                <span className="payment-label">Payment Date:</span>
                <span className="payment-value">{paymentDate}</span>
              </div>
              <div className="payment-item">
                <span className="payment-label">Transaction ID:</span>
                <span className="payment-value">{order.transaction_id || "Pending"}</span>
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
              <h3>EMI Details</h3>
              <div className="emi-grid">
                <div className="emi-item">
                  <span className="emi-label">Bank:</span>
                  <span className="emi-value">{emiDetails.bank_name}</span>
                </div>
                <div className="emi-item">
                  <span className="emi-label">Monthly EMI:</span>
                  <span className="emi-value">₹ {Number(emiDetails.monthly_emi || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="emi-item">
                  <span className="emi-label">Interest Rate:</span>
                  <span className="emi-value">{emiDetails.interest_rate}% p.a.</span>
                </div>
                <div className="emi-item">
                  <span className="emi-label">Tenure:</span>
                  <span className="emi-value">{emiDetails.tenure_years} years</span>
                </div>
                <div className="emi-item">
                  <span className="emi-label">Processing Fee:</span>
                  <span className="emi-value">₹ {Number(emiDetails.processing_fee || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          )}

          {insuranceDetails && insuranceDetails.provider_name && (
            <div className="invoice-insurance">
              <h3>Insurance Details</h3>
              <div className="insurance-grid">
                <div className="insurance-item">
                  <span className="insurance-label">Provider:</span>
                  <span className="insurance-value">{insuranceDetails.provider_name}</span>
                </div>
                <div className="insurance-item">
                  <span className="insurance-label">Plan:</span>
                  <span className="insurance-value">{insuranceDetails.plan_name}</span>
                </div>
                <div className="insurance-item">
                  <span className="insurance-label">Coverage:</span>
                  <span className="insurance-value">{insuranceDetails.coverage_type}</span>
                </div>
                <div className="insurance-item">
                  <span className="insurance-label">Premium:</span>
                  <span className="insurance-value">₹ {Number(insuranceDetails.premium_amount || 0).toLocaleString("en-IN")}/year</span>
                </div>
              </div>
            </div>
          )}

          <div className="invoice-footer">
            <p className="terms">Thank you for your business!</p>
            <p className="terms">Terms & Conditions apply. Please retain this invoice for your records.</p>
            <p className="signature">Authorized Signature</p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
