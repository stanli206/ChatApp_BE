import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Message from '../models/Message.js';

// @desc    Get all users except current user
// @route   GET /api/chat/users
// @access  Private
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } }).select(
    '-password'
  );
  res.json(users);
});

// @desc    Get messages between two users
// @route   GET /api/chat/messages/:userId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: userId },
      { sender: userId, receiver: req.user._id },
    ],
  })
    .populate('sender', 'name')
    .populate('receiver', 'name')
    .sort({ createdAt: 1 });

  res.json(messages);
});

// @desc    Send a message
// @route   POST /api/chat/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { receiver, message } = req.body;

  const newMessage = await Message.create({
    sender: req.user._id,
    receiver,
    message,
  });

  const populatedMessage = await Message.findById(newMessage._id)
    .populate('sender', 'name')
    .populate('receiver', 'name');

  res.status(201).json(populatedMessage);
});

export { getUsers, getMessages, sendMessage };