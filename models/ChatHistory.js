import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "assistant"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatHistorySchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    index: true,
  },
  messages: [chatMessageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

chatHistorySchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model("ChatHistory", chatHistorySchema);
