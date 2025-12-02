const express = require("express");
const { getGroups, createGroup, getMonthlyTotal, getGroupDetails, addMember, createExpense, createSettlement, deleteMember, deleteGroup, getAnalytics, getGroupAnalytics } = require("../controllers/groupController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getGroups);
router.post("/", protect, createGroup);
router.get("/monthly-total", protect, getMonthlyTotal);
router.get("/analytics", protect, getAnalytics);
router.get("/:id/analytics", protect, getGroupAnalytics);
router.get("/:id", protect, getGroupDetails);
router.post("/:id/members", protect, addMember);
router.post("/:id/expenses", protect, createExpense);
router.post("/:id/settlements", protect, createSettlement);
router.delete("/:id/members/:memberId", protect, deleteMember);
router.delete("/:id", protect, deleteGroup);

module.exports = router;
