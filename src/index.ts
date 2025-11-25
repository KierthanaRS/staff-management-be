import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import router from "./routes/index.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", router);
app.get("/", (req, res) => {
  res.send(" Staff Management API running!");
});

const PORT = process.env.BACKEND_PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
