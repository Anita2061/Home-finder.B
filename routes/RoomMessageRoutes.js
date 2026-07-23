import express from "express";
import authMiddleware from "../middleware/Auth.js";
import { sendMessage, getRoomMessages, getMyConversations } from "../controller/RoomMessageController.js";

const router = express.Router();

router.post("/", authMiddleware, sendMessage);
router.get("/conversations", authMiddleware, getMyConversations);
router.get("/:roomId", authMiddleware, getRoomMessages);

export default router;
