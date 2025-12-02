const express = require("express");
const { getGroups, createGroup, getMonthlyTotal } = require("../controllers/groupController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getGroups);
router.post("/", protect, createGroup);
router.get("/monthly-total", protect, getMonthlyTotal);

module.exports = router;
