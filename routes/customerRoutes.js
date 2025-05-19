const express = require("express");
const {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");
const { protect } = require("../middleware/auth");
const { authorize } = require("../middleware/roles");

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes accessible by both admins and collectors
router.get("/", getCustomers);
router.get("/:id", getCustomer);
router.post("/", createCustomer);

// Routes restricted to admins only
router.put("/:id", authorize("admin"), updateCustomer);
router.delete("/:id", authorize("admin"), deleteCustomer);

module.exports = router;
