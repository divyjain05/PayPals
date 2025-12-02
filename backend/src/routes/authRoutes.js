const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);

const { protect } = require("../middleware/authMiddleware");
const { getUserProfile, updateUserProfile } = require("../controllers/authController");

router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);

module.exports = router;
