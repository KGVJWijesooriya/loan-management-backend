const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
    maxlength: [100, "Name cannot be more than 100 characters"],
  },
  phone: {
    type: String,
    required: [true, "Please add a phone number"],
    unique: true,
    trim: true,
    maxlength: [20, "Phone number cannot be more than 20 characters"],
  },
  address: {
    street: {
      type: String,
      required: [true, "Please add a street address"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "Please add a city"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "Please add a state"],
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, "Please add a postal code"],
      trim: true,
    },
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
CustomerSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Customer", CustomerSchema);
