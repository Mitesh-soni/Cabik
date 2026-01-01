import * as dealerService from "../services/dealer.services.js";

// Extract dealer id from a token shaped like "dealer_token_<id>"
const getDealerIdFromAuth = (req) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  const parts = token?.split("_") || [];
  const id = parts.length >= 3 ? parts[2] : null;
  return id || null;
};

export const loginDealer = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    
    const dealer = await dealerService.loginDealer(email, password);
    
    res.json({ 
      success: true, 
      dealer,
      token: `dealer_token_${dealer.id}`
    });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

export const registerDealer = async (req, res) => {
  try {
    // Validation
    const {
      company_name,
      owner_name,
      email,
      password,
      phone,
      city,
      state,
      pincode
    } = req.body;

    // Required field validation
    const errors = {};
    
    if (!company_name || !company_name.trim()) {
      errors.company_name = "Company name is required";
    }
    
    if (!owner_name || !owner_name.trim()) {
      errors.owner_name = "Owner name is required";
    }
    
    if (!email || !email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Invalid email format";
    }
    
    if (!password || !password.trim()) {
      errors.password = "Password is required";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    
    if (!phone || !phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(phone.replace(/\s/g, ""))) {
      errors.phone = "Phone number must be 10 digits";
    }
    
    if (!city || !city.trim()) {
      errors.city = "City is required";
    }
    
    if (!state || !state.trim()) {
      errors.state = "State is required";
    }
    
    if (!pincode || !pincode.trim()) {
      errors.pincode = "Pincode is required";
    } else if (!/^[0-9]{6}$/.test(pincode)) {
      errors.pincode = "Pincode must be 6 digits";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ 
        success: false,
        errors 
      });
    }

    // Add license document path if uploaded
    const dealerData = {
      ...req.body,
      license_document: req.file ? req.file.path : null
    };

    const dealer = await dealerService.createDealer(dealerData);
    res.status(201).json({ 
      success: true, 
      dealer,
      message: "Dealer registered successfully" 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getDealer = async (req, res) => {
  try {
    const dealer = await dealerService.getDealerById(req.params.id);
    if (!dealer) {
      return res.status(404).json({ error: "Dealer not found" });
    }
    res.json({ dealer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDealerProfile = async (req, res) => {
  try {
    const dealerId = getDealerIdFromAuth(req);
    if (!dealerId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const dealer = await dealerService.getDealerById(dealerId);
    if (!dealer) {
      return res.status(404).json({ error: "Dealer not found" });
    }
    res.json(dealer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDealerAnalytics = async (req, res) => {
  try {
    const { dealerId } = req.params;
    const { timeFrame } = req.query;
    const analytics = await dealerService.getDealerAnalytics(dealerId, timeFrame);
    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDealerRevenue = async (req, res) => {
  try {
    const { dealerId } = req.params;
    const { timeFrame } = req.query;
    const revenue = await dealerService.getDealerRevenue(dealerId, timeFrame);
    res.json(revenue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getDealerOrders = async (req, res) => {
  try {
    const { dealerId } = req.params;
    const { limit, offset, status } = req.query;

    const filters = {
      limit: parseInt(limit, 10) || 50,
      offset: parseInt(offset, 10) || 0,
      status: status || null
    };
    const result = await dealerService.getDealerOrders(dealerId, filters);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Vehicle Management
export const uploadVehicle = async (req, res) => {
  try {
    const vehicle = await dealerService.uploadVehicle(req.body, req.dealerId);
    res.json({ success: true, vehicle });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getDealerVehicles = async (req, res) => {
  try {
    const vehicles = await dealerService.getDealerVehicles(req.params.dealerId);
    res.json(vehicles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const dealerId = getDealerIdFromAuth(req);
    if (!dealerId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const vehicle = await dealerService.updateVehicle(vehicleId, req.body);
    res.json({ success: true, vehicle });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { vehicle_type } = req.query;

    const dealerId = getDealerIdFromAuth(req);
    if (!dealerId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    await dealerService.deleteVehicle(vehicleId, vehicle_type || 'car', dealerId);
    res.json({ success: true, message: "Vehicle deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
