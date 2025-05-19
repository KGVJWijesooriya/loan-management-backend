const express = require("express");
const {
  getLoans,
  getLoan,
  createLoan,
  updateLoanStatus,
  getLoansByCustomer,
} = require("../controllers/loanController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/roles");

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes accessible by both admins and collectors
router.get("/", getLoans);
router.get("/:id", getLoan);
router.get("/customer/:customerId", getLoansByCustomer);
router.post("/", createLoan);

// Routes restricted to admins only
router.put("/:id", authorize("admin"), updateLoanStatus);

module.exports = router;
