import { app } from "./app.js";

const PORT = process.env.PORT || 5004;

app.listen(PORT, () => {
  console.log(`Integration Service running on port ${PORT}`);
});
