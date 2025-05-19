const mongoose = require("mongoose");

const InstallmentSchema = new mongoose.Schema({
  loanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Loan",
    required: true,
  },
  dueDate: {
    type: Date,
    required: [true, "Please add a due date"],
  },
  amount: {
    type: Number,
    required: [true, "Please add an amount"],
    min: [0, "Amount must be positive"],
  },
  collected: {
    type: Boolean,
    default: false,
  },
  collectedAt: {
    type: Date,
    default: null,
  },
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  notes: {
    type: String,
    trim: true,
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
InstallmentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Installment", InstallmentSchema);
