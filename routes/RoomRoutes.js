import express from "express";
import upload from "../middleware/Multer.js";
import authMiddleware from "../middleware/Auth.js";
import { createRoom, getRoom, getRoomById, updateRoom, deleteRoom, getMyRooms, claimRoom } from "../controller/RoomController.js";

const router = express.Router();

router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Image upload failed" });
  res.status(200).json({ message: "Image uploaded successfully", image: req.file.filename });
});

router.post("/upload-multiple", upload.array("images", 10), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ message: "No images uploaded" });
  const filenames = req.files.map((f) => f.filename);
  res.status(200).json({ message: "Images uploaded successfully", images: filenames });
});

router.get("/my-rooms", authMiddleware, getMyRooms);
router.post("/claim", authMiddleware, claimRoom);
router.get("/:id", getRoomById);
router.put("/:id", authMiddleware, updateRoom);
router.delete("/:id", authMiddleware, deleteRoom);
router.get("/", getRoom);
router.post("/", authMiddleware, upload.single("image"), createRoom);

export default router;