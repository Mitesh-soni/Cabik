import pool from "../db.js";

export const getInsurancePlans = async (vehicle_type) => {
  const { rows } = await pool.query(
    `
    SELECT
      ip.id AS plan_id,
      ip.plan_name,
      ip.coverage_type,
      ip.base_premium,
      ip.tenure_years,
      p.provider_name,
      p.claim_settlement_ratio
    FROM insurance_plans ip
    JOIN insurance_providers p ON p.id = ip.provider_id
    WHERE LOWER(ip.vehicle_type) = LOWER($1)
      AND p.is_active = true
    `,
    [vehicle_type]
  );

  // Attach addons for DB-derived plans
  for (const plan of rows) {
    const { rows: addons } = await pool.query(
      `
      SELECT a.addon_name, a.addon_price
      FROM insurance_plan_addons pa
      JOIN insurance_addons a ON a.id = pa.addon_id
      WHERE pa.plan_id = $1
      `,
      [plan.plan_id]
    );

    plan.addons = addons;
  }

  return rows;
};
