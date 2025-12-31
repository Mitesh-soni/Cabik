import * as dealerService from "../services/dealer.services.js";

export const registerDealer = async (req, res) => {
  try {
    const dealer = await dealerService.createDealer(req.body);
    res.json({ success: true, dealer });
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
