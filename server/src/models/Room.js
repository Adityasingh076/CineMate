const { Schema, model } = require("mongoose");
module.exports = model("Room", new Schema({
  code: { type: String, unique: true, index: true },
  name: { type: String, required: true },
  host: { type: Schema.Types.ObjectId, ref: "User" },
  videoUrl: { type: String, default: "" },
}, { timestamps: true }));
