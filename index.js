import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import { db } from "./config/db.js";
import roomRoutes from "./routes/RoomRoutes.js";
import authRoutes from "./routes/AuthRoutes.js";
import chatRoutes from "./routes/ChatRoutes.js";
import roomMessageRoutes from "./routes/RoomMessageRoutes.js";

dotenv.config();

const app = express();

const uploadDir = path.resolve("uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use("/uploads", express.static("uploads"));

db();

app.use("/api/rooms", roomRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/room-messages", roomMessageRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Rental API Running Successfully" });
});

app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});