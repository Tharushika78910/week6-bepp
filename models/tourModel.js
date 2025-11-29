const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const tourSchema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    // Optional fields (tests do NOT provide these)
    info: {
      type: String,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    // Tests send price as a Number
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tour", tourSchema);
