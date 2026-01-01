import app from "./app.js";

const PORT = process.env.PORT || 5006;

app.listen(PORT, () => {
  console.log(`Orders service running on port ${PORT}`);
});