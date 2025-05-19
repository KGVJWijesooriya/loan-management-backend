const Customer = require("../models/Customer");
const { success, error } = require("../utils/responseHandler");

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
exports.getCustomers = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Customer.countDocuments();

    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    const customers = await Customer.find()
      .populate("createdBy", "name email")
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    return success(res, "Customers retrieved successfully", {
      count: customers.length,
      pagination,
      customers,
    });
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private
exports.getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!customer) {
      return error(res, "Customer not found", 404);
    }

    return success(res, "Customer retrieved successfully", { customer });
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private
exports.createCustomer = async (req, res) => {
  try {
    // Add user ID to request body
    req.body.createdBy = req.user.id;

    const customer = await Customer.create(req.body);

    return success(res, "Customer created successfully", { customer }, 201);
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return error(res, "Phone number already in use", 400);
    }

    return error(res, "Server error", 500);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
exports.updateCustomer = async (req, res) => {
  try {
    let customer = await Customer.findById(req.params.id);

    if (!customer) {
      return error(res, "Customer not found", 404);
    }

    customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return success(res, "Customer updated successfully", { customer });
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      return error(res, "Phone number already in use", 400);
    }

    return error(res, "Server error", 500);
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return error(res, "Customer not found", 404);
    }

    await customer.deleteOne();

    return success(res, "Customer deleted successfully", null);
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};
