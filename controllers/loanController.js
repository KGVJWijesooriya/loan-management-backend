const Loan = require("../models/Loan");
const Customer = require("../models/Customer");
const Installment = require("../models/Installment");
const { calculateDailyInstallment } = require("../utils/emiCalculator");
const { success, error } = require("../utils/responseHandler");

// @desc    Get all loans
// @route   GET /api/loans
// @access  Private
exports.getLoans = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Loan.countDocuments();

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

    const loans = await Loan.find()
      .populate("customerId", "name phone")
      .populate("createdBy", "name")
      .skip(startIndex)
      .limit(limit)
      .sort({ createdAt: -1 });

    return success(res, "Loans retrieved successfully", {
      count: loans.length,
      pagination,
      loans,
    });
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// @desc    Get single loan
// @route   GET /api/loans/:id
// @access  Private
exports.getLoan = async (req, res) => {
  try {
    const loan = await Loan.findById(req.params.id)
      .populate("customerId", "name phone address")
      .populate("createdBy", "name");

    if (!loan) {
      return error(res, "Loan not found", 404);
    }

    return success(res, "Loan retrieved successfully", { loan });
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// @desc    Create new loan
// @route   POST /api/loans
// @access  Private
exports.createLoan = async (req, res) => {
  try {
    const {
      customerId,
      principalAmount,
      interestRate,
      durationInDays,
      startDate,
    } = req.body;

    // Check if customer exists
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return error(res, "Customer not found", 404);
    }

    // Calculate daily installment and total amount
    const { dailyInstallment, totalAmount } = calculateDailyInstallment(
      principalAmount,
      interestRate,
      durationInDays
    );

    // Calculate end date based on start date and duration
    const start = new Date(startDate || Date.now());
    const endDate = new Date(start);
    endDate.setDate(endDate.getDate() + durationInDays);

    // Create loan
    const loan = await Loan.create({
      customerId,
      principalAmount,
      interestRate,
      durationInDays,
      startDate: start,
      endDate,
      dailyInstallment,
      totalAmount,
      status: "active",
      createdBy: req.user.id,
    });

    // Create installments
    const installments = [];
    for (let i = 0; i < durationInDays; i++) {
      const dueDate = new Date(start);
      dueDate.setDate(dueDate.getDate() + i);

      installments.push({
        loanId: loan._id,
        dueDate,
        amount: dailyInstallment,
        collected: false,
      });
    }

    await Installment.insertMany(installments);

    return success(res, "Loan created successfully", { loan }, 201);
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// @desc    Update loan status
// @route   PUT /api/loans/:id
// @access  Private
exports.updateLoanStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "completed", "defaulted", "cancelled"].includes(status)) {
      return error(res, "Invalid status", 400);
    }

    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return error(res, "Loan not found", 404);
    }

    loan.status = status;
    await loan.save();

    return success(res, "Loan status updated successfully", { loan });
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// @desc    Get loans by customer
// @route   GET /api/loans/customer/:customerId
// @access  Private
exports.getLoansByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;

    // Check if customer exists
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return error(res, "Customer not found", 404);
    }

    const loans = await Loan.find({ customerId })
      .populate("customerId", "name phone")
      .sort({ createdAt: -1 });

    return success(res, "Customer loans retrieved successfully", { loans });
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};
