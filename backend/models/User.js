const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    // User name
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    // User email
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // User password
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },

    // Subscription details
    subscription: {
      plan: {
        type: String,
        enum: ["free", "pro", "premium"],
        default: "free",
      },

      status: {
        type: String,
        enum: ["active", "cancelled", "expired"],
        default: "active",
      },

      startDate: {
        type: Date,
        default: Date.now,
      },

      endDate: {
        type: Date,
        default: null,
      },
    },
  },
  {
    // Automatically creates:
    // createdAt
    // updatedAt
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function () {
  // Only hash password when it is new or changed
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);