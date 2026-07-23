import OpenAI from "openai";
import ChatHistory from "../models/ChatHistory.js";
import Room from "../models/RoomModels.js";

let openai;
const getOpenAI = () => {
  if (!openai) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
};

const SYSTEM_PROMPT = `You are a helpful rental assistant for "Room Finder" - a platform that helps users find rooms, flats, and apartments for rent.

Your role is to:
- Answer questions about available rental properties
- Help users search for rooms based on their preferences (location, price, type)
- Provide information about amenities, pricing, and contact details
- Guide users on how to use the platform
- Answer general rental-related questions

When users ask about available rooms, suggest they use the search/filter features on the site.
Be friendly, concise, and helpful. If you don't know something, be honest about it.

You have access to the rental database and can provide information about listed properties.`;

export const chat = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    if (!message || !sessionId) {
      return res.status(400).json({ success: false, message: "Message and sessionId are required" });
    }

    let history = await ChatHistory.findOne({ sessionId });
    if (!history) {
      history = await ChatHistory.create({ sessionId, messages: [] });
    }

    const contextMessages = history.messages.slice(-20);

    const rooms = await Room.find({}).select("title description location price type amenities").limit(10);
    const roomsContext = rooms.length > 0
      ? `\n\nAvailable rental listings:\n${rooms.map((r, i) => `${i + 1}. ${r.title} - ${r.type} in ${r.location} - $${r.price}/month - Amenities: ${r.amenities.join(", ")}`).join("\n")}`
      : "";

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT + roomsContext },
        ...contextMessages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: message },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request.";

    history.messages.push({ role: "user", content: message });
    history.messages.push({ role: "assistant", content: reply });
    await history.save();

    res.status(200).json({ success: true, reply, sessionId });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ success: false, message: "Chat failed", error: error.message });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const history = await ChatHistory.findOne({ sessionId });
    if (!history) {
      return res.status(200).json({ success: true, messages: [] });
    }
    res.status(200).json({ success: true, messages: history.messages });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch history", error: error.message });
  }
};

export const clearChat = async (req, res) => {
  try {
    const { sessionId } = req.body;
    await ChatHistory.findOneAndDelete({ sessionId });
    res.status(200).json({ success: true, message: "Chat history cleared" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to clear history", error: error.message });
  }
};
