import { useEffect, useState } from "react";
import { useDealer } from "../../contexts/DealerContext.jsx";
import { getDealerVehicles, uploadVehicle, deleteVehicle, updateVehicle } from "../../api/dealerApi.js";
import "./VehicleManagement.css";

export default function VehicleManagement() {
  const { dealer } = useDealer();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    variant: "",
    fuel_type: "Petrol",
    transmission: "Manual",
    seating_capacity: 5,
    engine_cc: "",
    mileage: "",
    launch_year: new Date().getFullYear(),
    ex_showroom_price: "",
    description: "",
    vehicle_type: "car",
    features: "",
    front_image: null,
    side_image: null,
    back_image: null,
    interior_image: null
  });
  const [imagePreviews, setImagePreviews] = useState({
    front_image: null,
    side_image: null,
    back_image: null,
    interior_image: null
  });

  useEffect(() => {
    loadVehicles();
  }, [dealer?.id]);

  const loadVehicles = async () => {
    if (!dealer?.id) return;
    try {
      const res = await getDealerVehicles(dealer.id);
      setVehicles(res.data || []);
    } catch (err) {
      console.error("Failed to load vehicles:", err);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes("price") || name.includes("cc") || name.includes("mileage") || name.includes("seating")
        ? Number(value)
        : value
    }));
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setFormData(prev => ({ ...prev, [name]: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => ({ ...prev, [name]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      brand: vehicle.brand,
      model: vehicle.model,
      variant: vehicle.variant,
      fuel_type: vehicle.fuel_type || "Petrol",
      transmission: vehicle.transmission || "Manual",
      seating_capacity: vehicle.seating_capacity || 5,
      engine_cc: vehicle.engine_cc || "",
      mileage: vehicle.mileage || "",
      launch_year: vehicle.launch_year || new Date().getFullYear(),
      ex_showroom_price: vehicle.ex_showroom_price || "",
      description: vehicle.description || "",
      vehicle_type: vehicle.vehicle_type || "car",
      features: vehicle.features || "",
      front_image: null,
      side_image: null,
      back_image: null,
      interior_image: null
    });
    setImagePreviews({
      front_image: vehicle.front_image || null,
      side_image: vehicle.side_image || null,
      back_image: vehicle.back_image || null,
      interior_image: vehicle.interior_image || null
    });
    setShowUploadForm(true);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      const uploadData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          uploadData.append(key, formData[key]);
        }
      });

      if (editingVehicle) {
        await updateVehicle(editingVehicle.id, uploadData);
      } else {
        await uploadVehicle(uploadData);
      }
      setFormData({
        brand: "", model: "", variant: "", fuel_type: "Petrol",
        transmission: "Manual", seating_capacity: 5, engine_cc: "",
        mileage: "", launch_year: new Date().getFullYear(),
        ex_showroom_price: "", description: "", vehicle_type: "car",
        features: "", front_image: null, side_image: null,
        back_image: null, interior_image: null
      });
      setImagePreviews({
        front_image: null, side_image: null,
        back_image: null, interior_image: null
      });
      setShowUploadForm(false);
      setEditingVehicle(null);
      loadVehicles();
    } catch (err) {
      console.error("Operation failed:", err);
      alert(`Failed to ${editingVehicle ? 'update' : 'upload'} vehicle`);
    }
  };

  const handleDelete = async (vehicle) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    try {
      await deleteVehicle(vehicle.id, vehicle.vehicle_type || 'car');
      loadVehicles();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete vehicle");
    }
  };

  return (
    <div className="vehicle-management">
      <div className="vehicles-header">
        <h1>Vehicle Management</h1>
        <button 
          className="btn-add-vehicle"
          onClick={() => {
            setShowUploadForm(!showUploadForm);
            if (showUploadForm) {
              setEditingVehicle(null);
              setFormData({
                brand: "", model: "", variant: "", fuel_type: "Petrol",
                transmission: "Manual", seating_capacity: 5, engine_cc: "",
                mileage: "", launch_year: new Date().getFullYear(),
                ex_showroom_price: "", description: "", vehicle_type: "car",
                features: "", front_image: null, side_image: null,
                back_image: null, interior_image: null
              });
              setImagePreviews({
                front_image: null, side_image: null,
                back_image: null, interior_image: null
              });
            }
          }}
        >
          {showUploadForm ? "Cancel" : "➕ Add New Vehicle"}
        </button>
      </div>

      {showUploadForm && (
        <div className="upload-form-container">
          <form onSubmit={handleUpload} className="upload-form">
            <h2>{editingVehicle ? "Edit Vehicle" : "Upload New Vehicle"}</h2>
            
            <div className="form-row">
              <input type="text" name="brand" placeholder="Brand" value={formData.brand} onChange={handleInputChange} required />
              <input type="text" name="model" placeholder="Model" value={formData.model} onChange={handleInputChange} required />
            </div>

            <div className="form-row">
              <input type="text" name="variant" placeholder="Variant" value={formData.variant} onChange={handleInputChange} required />
              <select name="vehicle_type" value={formData.vehicle_type} onChange={handleInputChange}>
                <option value="car">Car</option>
                <option value="bike">Bike</option>
                <option value="scooty">Scooty</option>
              </select>
            </div>

            <div className="form-row">
              <select name="fuel_type" value={formData.fuel_type} onChange={handleInputChange}>
                <option>Petrol</option>
                <option>Diesel</option>
                <option>CNG</option>
                <option>Electric</option>
              </select>
              <select name="transmission" value={formData.transmission} onChange={handleInputChange}>
                <option>Manual</option>
                <option>Automatic</option>
              </select>
            </div>

            <div className="form-row">
              <input type="number" name="seating_capacity" placeholder="Seating" value={formData.seating_capacity} onChange={handleInputChange} />
              <input type="number" name="engine_cc" placeholder="Engine (cc)" value={formData.engine_cc} onChange={handleInputChange} required />
            </div>

            <div className="form-row">
              <input type="number" name="mileage" placeholder="Mileage (km/l)" value={formData.mileage} onChange={handleInputChange} required />
              <input type="number" name="launch_year" placeholder="Launch Year" value={formData.launch_year} onChange={handleInputChange} />
            </div>

            <div className="form-row">
              <input type="number" name="ex_showroom_price" placeholder="Ex-Showroom Price" value={formData.ex_showroom_price} onChange={handleInputChange} required />
            </div>

            <textarea name="features" placeholder="Features (e.g., ABS, Airbags, Sunroof, Cruise Control, etc.)" value={formData.features} onChange={handleInputChange} rows="3"></textarea>

            <div className="image-upload-section">
              <h3>Upload Vehicle Images</h3>
              <div className="image-upload-grid">
                <div className="image-upload-item">
                  <label htmlFor="front_image">Front View</label>
                  <input type="file" id="front_image" name="front_image" accept="image/*" onChange={handleImageChange} />
                  {imagePreviews.front_image && (
                    <div className="image-preview">
                      <img src={imagePreviews.front_image} alt="Front preview" />
                    </div>
                  )}
                </div>
                <div className="image-upload-item">
                  <label htmlFor="side_image">Side View</label>
                  <input type="file" id="side_image" name="side_image" accept="image/*" onChange={handleImageChange} />
                  {imagePreviews.side_image && (
                    <div className="image-preview">
                      <img src={imagePreviews.side_image} alt="Side preview" />
                    </div>
                  )}
                </div>
                <div className="image-upload-item">
                  <label htmlFor="back_image">Back View</label>
                  <input type="file" id="back_image" name="back_image" accept="image/*" onChange={handleImageChange} />
                  {imagePreviews.back_image && (
                    <div className="image-preview">
                      <img src={imagePreviews.back_image} alt="Back preview" />
                    </div>
                  )}
                </div>
                <div className="image-upload-item">
                  <label htmlFor="interior_image">Interior View</label>
                  <input type="file" id="interior_image" name="interior_image" accept="image/*" onChange={handleImageChange} />
                  {imagePreviews.interior_image && (
                    <div className="image-preview">
                      <img src={imagePreviews.interior_image} alt="Interior preview" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <textarea name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} rows="3"></textarea>

            <button type="submit" className="btn-submit">
              {editingVehicle ? "Update Vehicle" : "Upload Vehicle"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">Loading vehicles...</div>
      ) : (
        <div className="vehicles-list">
          {vehicles.length === 0 ? (
            <p className="no-vehicles">No vehicles uploaded yet</p>
          ) : (
            <div className="vehicles-grid">
              {vehicles.map(vehicle => (
                <div key={vehicle.id} className="vehicle-item">
                  <div className="vehicle-image">
                    {vehicle.front_image ? (
                      <img src={vehicle.front_image} alt={vehicle.model} />
                    ) : (
                      <div className="placeholder">No Image</div>
                    )}
                  </div>
                  <div className="vehicle-info">
                    <h3>{vehicle.brand} {vehicle.model}</h3>
                    <p className="variant">{vehicle.variant}</p>
                    <p className="price">₹{vehicle.ex_showroom_price.toLocaleString("en-IN")}</p>
                    <div className="vehicle-meta">
                      <span>{vehicle.fuel_type}</span>
                      <span>{vehicle.transmission}</span>
                      <span>{vehicle.seating_capacity}S</span>
                    </div>
                  </div>
                  <div className="vehicle-actions">
                    <button className="btn-edit" onClick={() => handleEdit(vehicle)}>Edit</button>
                    <button className="btn-delete" onClick={() => handleDelete(vehicle)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
