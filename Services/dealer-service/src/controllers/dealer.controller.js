import * as dealerService from "../services/dealer.services.js";

export const registerDealer = async (req, res) => {
  try {
    const dealer = await dealerService.createDealer(req.body);
    res.json({ success: true, dealer });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
