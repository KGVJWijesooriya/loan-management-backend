const express = require("express");
const {
  getLoanInstallments,
  getTodayDueInstallments,
  collectInstallment,
  getInstallmentHistory,
} = require("../controllers/installmentController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes for installment operations
router.get("/loan/:loanId", getLoanInstallments);
router.get("/due", getTodayDueInstallments);
router.post("/collect/:id", collectInstallment);
router.get("/history", getInstallmentHistory);

module.exports = router;
