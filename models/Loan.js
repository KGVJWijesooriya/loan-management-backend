const mongoose = require("mongoose");

const LoanSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  principalAmount: {
    type: Number,
    required: [true, "Please add a principal amount"],
    min: [0, "Principal amount must be positive"],
  },
  interestRate: {
    type: Number,
    required: [true, "Please add an interest rate"],
    min: [0, "Interest rate must be positive"],
  },
  durationInDays: {
    type: Number,
    required: [true, "Please add a duration"],
    min: [1, "Duration must be at least 1 day"],
  },
  startDate: {
    type: Date,
    required: [true, "Please add a start date"],
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: [true, "Please add an end date"],
  },
  dailyInstallment: {
    type: Number,
    required: [true, "Please add a daily installment amount"],
    min: [0, "Daily installment must be positive"],
  },
  totalAmount: {
    type: Number,
    required: [true, "Please add a total amount"],
    min: [0, "Total amount must be positive"],
  },
  status: {
    type: String,
    enum: ["active", "completed", "defaulted", "cancelled"],
    default: "active",
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-update the updatedAt field
LoanSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Loan", LoanSchema);
