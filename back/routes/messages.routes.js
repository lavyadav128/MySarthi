import express from "express";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// ======================================================
// GET ALL MESSAGES FOR LOGGED IN USER
// ======================================================
router.get("/login", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ receiverId: req.user.id })
      .sort({ sentAt: -1 })
      .lean();

    const enrichedMessages = await Promise.all(
      messages.map(async (msg) => {
        const sender = await User.findById(msg.senderId)
          .select("name email role")
          .lean();

        // ✅ ONLY allow admin → user messages
        if (!sender || sender.role !== "admin") return null;

        return { ...msg, sender };
      })
    );

    // remove nulls
    res.json(enrichedMessages.filter(Boolean));
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Server error fetching messages" });
  }
});


// ======================================================
// GET USER MESSAGES (Admin only)
// ======================================================
router.get("/user/:userId", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });

  try {
    const messages = await Message.find({ receiverId: req.params.userId })
      .sort({ sentAt: -1 })
      .lean();

    const enrichedMessages = await Promise.all(
      messages.map(async (msg) => {
        const sender = await User.findById(msg.senderId).select("name email role").lean();
        return { ...msg, sender: sender || { name: "System", email: "", role: "admin" } };
      })
    );

    res.json(enrichedMessages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching user messages" });
  }
});

// ======================================================
// UNREAD COUNT
// ======================================================
router.get("/unread/count", authMiddleware, async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiverId: req.user.id, isRead: false });
    res.json({ count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// ======================================================
// MARK ALL READ
// ======================================================
router.patch("/mark-all/read", authMiddleware, async (req, res) => {
  try {
    const result = await Message.updateMany(
      { receiverId: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ message: "All messages marked as read", updatedCount: result.modifiedCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error updating messages" });
  }
});

// ======================================================
// GET PRIORITY MESSAGES
// ======================================================
router.get("/priority/:priority", authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      receiverId: req.user.id,
      priority: req.params.priority
    }).sort({ sentAt: -1 }).lean();

    const enrichedMessages = await Promise.all(
      messages.map(async (msg) => {
        const sender = await User.findById(msg.senderId)
          .select("name email role")
          .lean();

        if (!sender || sender.role !== "admin") return null;
        return { ...msg, sender };
      })
    );

    res.json(enrichedMessages.filter(Boolean));
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});


// ======================================================
// SINGLE MESSAGE BY ID
// ======================================================
router.get("/:messageId", authMiddleware, async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.messageId,
      receiverId: req.user.id
    }).lean();

    if (!message) return res.status(404).json({ error: "Message not found" });

    const sender = await User.findById(message.senderId)
      .select("name email role")
      .lean();

    if (!sender || sender.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    res.json({ ...message, sender });
  } catch (error) {
    res.status(500).json({ error: "Server error fetching message" });
  }
});


// ======================================================
// MARK SINGLE MESSAGE AS READ
// ======================================================
router.patch("/:messageId/read", authMiddleware, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.messageId, receiverId: req.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    if (!message) return res.status(404).json({ error: "Message not found" });

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error updating message" });
  }
});

// ======================================================
// DELETE MESSAGE
// ======================================================
router.delete("/:messageId", authMiddleware, async (req, res) => {
  try {
    const message = await Message.findOneAndDelete({ _id: req.params.messageId, receiverId: req.user.id });
    if (!message) return res.status(404).json({ error: "Message not found" });

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error deleting message" });
  }
});

export default router;
