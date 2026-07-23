import Room from "../models/RoomModels.js";

const normalize = (items) => {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  return String(items).split(",").map((i) => i.trim()).filter(Boolean);
};

export const createRoom = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.role !== "owner") {
      return res.status(403).json({ message: "Only admins and owners can create rooms" });
    }

    const { title, description, location, price, type, amenities, contact, images, lat, lng } = req.body;
    const image = req.file?.filename || req.body?.image;

    if (!title || !description || !location || !price || !type || !contact || !image) {
      return res.status(400).json({ message: "All required fields including image must be provided" });
    }

    const room = await Room.create({
      title, description, location, price: Number(price), type, image,
      images: images ? (Array.isArray(images) ? images : JSON.parse(images)) : [],
      amenities: normalize(amenities), contact,
      owner: req.user?.id,
      lat: lat ? Number(lat) : 27.7172,
      lng: lng ? Number(lng) : 85.3240,
    });
    res.status(201).json({ message: "Room created successfully", room });
  } catch (error) {
    res.status(500).json({ message: "Could not create room", error: error.message });
  }
};

export const getRoom = async (req, res) => {
  try {
    const { location, type, maxPrice } = req.query;
    const filter = {};
    if (location) filter.location = { $regex: location, $options: "i" };
    if (type) filter.type = type;
    if (maxPrice) filter.price = { $lte: Number(maxPrice) };

    const rooms = await Room.find(filter).populate("owner", "name email phone").sort({ createdAt: -1 });
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch rooms", error: error.message });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("owner", "name email phone");
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch room", error: error.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can update rooms" });
    }
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: "Failed to update room", error: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can delete rooms" });
    }
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete room", error: error.message });
  }
};

export const getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      $or: [{ owner: req.user.id }, { owner: { $exists: false } }, { owner: null }],
    }).populate("owner", "name email phone").sort({ createdAt: -1 });
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your rooms", error: error.message });
  }
};

export const claimRoom = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can claim rooms" });
    }
    const { roomId } = req.body;
    if (!roomId) return res.status(400).json({ message: "roomId is required" });

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    if (room.owner) {
      return res.status(400).json({ message: "Room already has an owner" });
    }

    room.owner = req.user.id;
    await room.save();
    res.status(200).json({ message: "Room claimed successfully", room });
  } catch (error) {
    res.status(500).json({ message: "Failed to claim room", error: error.message });
  }
};