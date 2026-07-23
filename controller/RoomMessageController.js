import RoomMessage from "../models/RoomMessage.js";
import Room from "../models/RoomModels.js";

export const sendMessage = async (req, res) => {
  try {
    const { roomId, message } = req.body;
    if (!roomId || !message) {
      return res.status(400).json({ success: false, message: "roomId and message are required" });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const receiver = room.owner;
    if (!receiver) {
      return res.status(400).json({ success: false, message: "Room has no owner assigned" });
    }

    if (req.user.id === receiver.toString()) {
      return res.status(400).json({ success: false, message: "Cannot send message to yourself" });
    }

    const msg = await RoomMessage.create({
      room: roomId,
      sender: req.user.id,
      receiver,
      message,
    });

    const populated = await RoomMessage.findById(msg._id)
      .populate("sender", "name email")
      .populate("receiver", "name email");

    res.status(201).json({ success: true, message: "Message sent", data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send message", error: error.message });
  }
};

export const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const isOwner = room.owner && room.owner.toString() === req.user.id;
    const isParticipant = true;

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: "Not authorized to view these messages" });
    }

    const messages = await RoomMessage.find({
      room: roomId,
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch messages", error: error.message });
  }
};

export const getMyConversations = async (req, res) => {
  try {
    const messages = await RoomMessage.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }],
    })
      .populate("sender", "name email")
      .populate("receiver", "name email")
      .populate("room", "title image price location")
      .sort({ createdAt: -1 });

    const seen = new Set();
    const conversations = [];
    for (const msg of messages) {
      const key = msg.room ? msg.room._id.toString() : "unknown";
      if (!seen.has(key)) {
        seen.add(key);
        conversations.push(msg);
      }
    }

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch conversations", error: error.message });
  }
};
