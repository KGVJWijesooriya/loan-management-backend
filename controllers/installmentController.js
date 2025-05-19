const Installment = require("../models/Installment");
const Loan = require("../models/Loan");
const { success, error } = require("../utils/responseHandler");

// @desc    Get all installments for a loan
// @route   GET /api/installments/loan/:loanId
// @access  Private
exports.getLoanInstallments = async (req, res) => {
  try {
    const { loanId } = req.params;

    // Check if loan exists
    const loan = await Loan.findById(loanId);

    if (!loan) {
      return error(res, "Loan not found", 404);
    }

    const installments = await Installment.find({ loanId }).sort({
      dueDate: 1,
    });

    return success(res, "Installments retrieved successfully", {
      installments,
    });
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// @desc    Get today's due installments
// @route   GET /api/installments/due
// @access  Private
exports.getTodayDueInstallments = async (req, res) => {
  try {
    // Get today's start and end dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find installments due today
    const installments = await Installment.find({
      dueDate: { $gte: today, $lt: tomorrow },
      collected: false,
    })
      .populate({
        path: "loanId",
        select: "customerId dailyInstallment status",
        populate: {
          path: "customerId",
          select: "name phone address",
        },
      })
      .sort({ dueDate: 1 });

    return success(res, "Today's due installments retrieved successfully", {
      installments,
    });
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// @desc    Record installment collection
// @route   POST /api/installments/collect/:id
// @access  Private
exports.collectInstallment = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Find installment
    const installment = await Installment.findById(id);

    if (!installment) {
      return error(res, "Installment not found", 404);
    }

    // Check if already collected
    if (installment.collected) {
      return error(res, "Installment already collected", 400);
    }

    // Update installment
    installment.collected = true;
    installment.collectedAt = Date.now();
    installment.collectedBy = req.user.id;
    installment.notes = notes || "";

    await installment.save();

    // Check if all installments for this loan are collected
    const pendingInstallments = await Installment.countDocuments({
      loanId: installment.loanId,
      collected: false,
    });

    // If no pending installments, mark loan as completed
    if (pendingInstallments === 0) {
      await Loan.findByIdAndUpdate(installment.loanId, { status: "completed" });
    }

    return success(res, "Installment collected successfully", { installment });
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};

// @desc    Get installment history
// @route   GET /api/installments/history
// @access  Private
exports.getInstallmentHistory = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Filters
    const match = {};

    if (req.query.collected === "true") {
      match.collected = true;
    } else if (req.query.collected === "false") {
      match.collected = false;
    }

    if (req.query.loanId) {
      match.loanId = req.query.loanId;
    }

    if (req.query.startDate && req.query.endDate) {
      match.dueDate = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate),
      };
    }

    const total = await Installment.countDocuments(match);

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

    const installments = await Installment.find(match)
      .populate({
        path: "loanId",
        select: "customerId dailyInstallment",
        populate: {
          path: "customerId",
          select: "name phone",
        },
      })
      .populate("collectedBy", "name")
      .skip(startIndex)
      .limit(limit)
      .sort({ dueDate: -1 });

    return success(res, "Installment history retrieved successfully", {
      count: installments.length,
      pagination,
      installments,
    });
  } catch (err) {
    console.error(err);
    return error(res, "Server error", 500);
  }
};
