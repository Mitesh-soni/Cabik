import pool from "../db.js";

export const calculateEmiOptions = async ({
  vehicle_type,
  vehicle_price,
  down_payment,
  tenure_years
}) => {
  const loanAmount = Math.max(vehicle_price - down_payment, 0);

  const { rows } = await pool.query(
    `
    SELECT 
      b.bank_name,
      r.min_interest_rate,
      r.max_interest_rate,
      r.processing_fee
    FROM emi_bank_rates r
    JOIN emi_banks b ON b.id = r.bank_id
    WHERE r.vehicle_type = $1
      AND b.is_active = true
      AND $2 BETWEEN r.min_tenure_years AND r.max_tenure_years
    `,
    [vehicle_type, tenure_years]
  );

  return rows.map(bank => {
    const interest =
      (Number(bank.min_interest_rate) + Number(bank.max_interest_rate)) / 2;

    const monthlyRate = interest / 12 / 100;
    const months = tenure_years * 12;

    const emi =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);

    return {
      bank_name: bank.bank_name,
      interest_rate: interest,
      tenure_years,
      processing_fee: bank.processing_fee,
      monthly_emi: Math.round(emi)
    };
  });
};
