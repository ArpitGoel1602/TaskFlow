import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const createToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email and password are required',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'Email is already registered',
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  return res.status(201).json({
    success: true,
    token: createToken(user._id.toString()),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
    });
  }

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  }).select('+passwordHash');

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  }

  return res.json({
    success: true,
    token: createToken(user._id.toString()),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.userId).select(
    'name email role createdAt'
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  return res.json({ success: true, user });
};