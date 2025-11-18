//express, nodemon, bcrypt, jsonwebtoken, cors
const express = require('express');
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./src/routes/authRoutes");

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",                 
    "https://your-vercel-domain.vercel.app",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT} http://localhost:${PORT}`));
