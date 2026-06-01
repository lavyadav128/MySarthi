import express from "express";
import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import Message from "../models/message.model.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

import AdminAllow from "../models/adminAllow.model.js";
import crypto from "crypto";
import AdminInvite from "../models/adminInvite.model.js";
import requireAdmin from "../middlewares/requireAdmin.js";

import bcrypt from "bcryptjs";
import AuthSecurity from "../models/auth.security.model.js";
import { sendEmailOTP } from "../utils/mailer.js"; // your email helper

/* ======================================================
   ADMIN MIDDLEWARE - Check if user is admin
====================================================== */
const adminMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admin only." });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
  }
};


/**
 * POST /admin/invite
 * body: { email? }
 */
router.post("/invite", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { email } = req.body;

    const token = crypto.randomBytes(32).toString("hex");

    const invite = await AdminInvite.create({
      token,
      email: email?.toLowerCase(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    });

    const inviteLink = `http://localhost:5173/signup?adminInvite=${token}`;

    res.json({
      message: "Admin invite created",
      inviteLink,
      expiresAt: invite.expiresAt,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to create invite" });
  }
});



/* Only existing admins can promote */
router.post("/promote", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ error: "Forbidden" });

  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  await AdminAllow.create({
    email,
    addedBy: req.user.id,
  });

  user.role = "admin";
  await user.save();

  res.json({ success: true });
});


/* ======================================================
   GET ALL MESSAGES SENT BY ADMIN (Admin Only)
====================================================== */
router.get("/messages/sent", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ senderId: req.user.id })
      .sort({ sentAt: -1 })
      .lean();
    
    // Enrich with recipient info
    const enrichedMessages = await Promise.all(
      messages.map(async (msg) => {
        const recipient = await User.findById(msg.receiverId)
          .select("name email")
          .lean();
        
        return {
          ...msg,
          recipient: recipient || { name: "Unknown User", email: "" }
        };
      })
    );
    
    res.json(enrichedMessages);
  } catch (error) {
    console.error("Error fetching sent messages:", error);
    res.status(500).json({ error: "Server error fetching messages" });
  }
});




/* ======================================================
   SEARCH USERS (Admin Only) - MUST BE BEFORE /users/:userId
====================================================== */
router.get("/users/search/:query", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const query = req.params.query;
    
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ]
    })
      .select("-password")
      .limit(20)
      .lean();
    
    // Enrich with profiles
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const profile = await Profile.findOne({ userId: user._id }).lean();
        return {
          ...user,
          profile: profile || null,
          headline: profile?.headline || ""
        };
      })
    );
    
    res.json(enrichedUsers);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Server error searching users" });
  }
});

/* ======================================================
   BULK DELETE USERS (Admin Only) - MUST BE BEFORE /users/:userId
====================================================== */
router.post("/users/bulk-delete", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userIds } = req.body;
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: "userIds array is required" });
    }
    
    // Prevent admin from deleting themselves
    if (userIds.includes(req.user.id)) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }
    
    // Delete profiles
    await Profile.deleteMany({ userId: { $in: userIds } });
    
    // Delete messages
    await Message.deleteMany({ 
      $or: [
        { senderId: { $in: userIds } },
        { receiverId: { $in: userIds } }
      ]
    });
    
    // Delete users
    const result = await User.deleteMany({ _id: { $in: userIds } });
    
    res.json({
      message: `${result.deletedCount} users deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error("Error bulk deleting users:", error);
    res.status(500).json({ error: "Server error bulk deleting users" });
  }
});

/* ======================================================
   GET ALL USERS (Admin Only)
====================================================== */
router.get("/users", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .lean();
    
    // Enrich users with profile data
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const profile = await Profile.findOne({ userId: user._id }).lean();
        
        return {
          _id: user._id,
          name: profile?.name || user.name || "Unnamed User",
          email: user.email,
          phone: user.phone,
          role: user.role || "user",
          isActive: user.isActive !== undefined ? user.isActive : true,
          createdAt: user.createdAt,
          lastActive: user.lastActive || user.updatedAt,
          profilePicture: profile?.profilePicture || "",
          headline: profile?.headline || "",
          profileCompleted: profile ? isProfileComplete(profile) : false,
          profile: profile || null
        };
      })
    );
    
    res.json(enrichedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error fetching users" });
  }
});

/* ======================================================
   GET SINGLE USER BY ID (Admin Only)
====================================================== */
router.get("/users/:userId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("-password")
      .lean();
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const profile = await Profile.findOne({ userId: user._id }).lean();
    
    res.json({
      ...user,
      profile: profile || null,
      profileCompleted: profile ? isProfileComplete(profile) : false
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Server error fetching user" });
  }
});

/* ======================================================
   DELETE USER (Admin Only)
====================================================== */
router.delete("/users/:userId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }
    
    // Delete user's profile first
    await Profile.findOneAndDelete({ userId });
    
    // Delete user's messages
    await Message.deleteMany({ 
      $or: [{ senderId: userId }, { receiverId: userId }] 
    });
    
    // Delete the user
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ 
      message: "User deleted successfully",
      deletedUser: {
        id: deletedUser._id,
        name: deletedUser.name,
        email: deletedUser.email
      }
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Server error deleting user" });
  }
});

/* ======================================================
   UPDATE USER ROLE (Admin Only)
====================================================== */
router.patch("/users/:userId/role", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Must be 'user' or 'admin'" });
    }
    
    // Prevent admin from changing their own role
    if (req.params.userId === req.user.id) {
      return res.status(400).json({ error: "Cannot change your own role" });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select("-password");
    
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ error: "Server error updating role" });
  }
});

/* ======================================================
   TOGGLE USER ACTIVE STATUS (Admin Only)
====================================================== */
router.patch("/users/:userId/status", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Prevent admin from deactivating themselves
    if (req.params.userId === req.user.id) {
      return res.status(400).json({ error: "Cannot change your own status" });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error("Error toggling user status:", error);
    res.status(500).json({ error: "Server error updating status" });
  }
});

/* ======================================================
   GET DASHBOARD STATISTICS (Admin Only)
====================================================== */
router.get("/statistics", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    
    // New signups in last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const newSignups = await User.countDocuments({ 
      createdAt: { $gte: weekAgo } 
    });
    
    // Completed profiles
    const allProfiles = await Profile.find().lean();
    const completedProfiles = allProfiles.filter(p => isProfileComplete(p)).length;
    
    // Total messages sent
    const totalMessages = await Message.countDocuments({ senderId: req.user.id });
    
    // Unread messages count
    const unreadMessages = await Message.countDocuments({ 
      senderId: req.user.id,
      isRead: false 
    });
    
    res.json({
      totalUsers,
      activeUsers,
      newSignups,
      completedProfiles,
      totalMessages,
      unreadMessages,
      profileCompletionRate: totalUsers > 0 
        ? Math.round((completedProfiles / totalUsers) * 100) 
        : 0
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Server error fetching statistics" });
  }
});

/* ======================================================
   SEND MESSAGE TO USER (Admin Only)
====================================================== */
router.post("/send-message", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId, subject, message, meetLink, priority } = req.body;
    
    // Validation
    if (!userId || !subject || !message) {
      return res.status(400).json({ 
        error: "userId, subject, and message are required" 
      });
    }
    
    // Check if user exists
    const recipient = await User.findById(userId);
    if (!recipient) {
      return res.status(404).json({ error: "Recipient user not found" });
    }
    
    // Create message
    const newMessage = await Message.create({
      senderId: req.user.id,
      receiverId: userId,
      subject,
      message,
      meetLink: meetLink || "",
      priority: priority || "normal",
      isRead: false,
      sentAt: new Date()
    });
    
    res.json({
      message: "Message sent successfully",
      data: newMessage
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Server error sending message" });
  }
});


/* ======================================================
   GET MESSAGES FOR SPECIFIC USER (Admin Only)
====================================================== */
router.get("/messages/user/:userId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({ 
      receiverId: req.params.userId,
      senderId: req.user.id 
    })
      .sort({ sentAt: -1 })
      .lean();
    
    res.json(messages);
  } catch (error) {
    console.error("Error fetching user messages:", error);
    res.status(500).json({ error: "Server error fetching messages" });
  }
});

/* ======================================================
   DELETE MESSAGE (Admin Only)
====================================================== */
router.delete("/messages/:messageId", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const message = await Message.findOneAndDelete({
      _id: req.params.messageId,
      senderId: req.user.id // Only allow deleting own messages
    });
    
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    
    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Server error deleting message" });
  }
});

/* ======================================================
   HELPER FUNCTION - Check if profile is complete
====================================================== */
function isProfileComplete(profile) {
  if (!profile) return false;
  
  const requiredFields = [
    profile.name,
    profile.headline,
    profile.about,
    profile.country,
    profile.city
  ];
  
  const hasBasicInfo = requiredFields.every(field => field && field.trim() !== "");
  const hasSkills = profile.skills && profile.skills.length > 0;
  const hasExperience = profile.experience && profile.experience.length > 0;
  
  return hasBasicInfo && hasSkills && hasExperience;
}

export default router;