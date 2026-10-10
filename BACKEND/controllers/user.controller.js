import User from '../models/user.model.js';

export const searchUsers = async (req, res) => {
  const { email } = req.query;

  if (!email?.trim()) {
    return res.status(400).json({ success: false, message: 'Email query is required' });
  }

  // Case-insensitive partial match, exclude the requester
  const users = await User.find({
    email: { $regex: email.trim(), $options: 'i' },
    _id: { $ne: req.userId },
  })
    .select('name email')
    .limit(10);

  res.json({ success: true, users });
};
