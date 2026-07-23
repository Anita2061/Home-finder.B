import express from "express";
import { chat, getChatHistory, clearChat } from "../controller/ChatController.js";

const router = express.Router();

router.post("/", chat);
router.get("/:sessionId", getChatHistory);
router.delete("/", clearChat);

export default router;
