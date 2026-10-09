// Placeholder JWT auth middleware.
// Uncomment and configure once you add the jsonwebtoken package.
// JWT_SECRET is available via process.env.JWT_SECRET (loaded by dotenv in index.js).

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const { verify } = await import('jsonwebtoken');
    const decoded = verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
  next();
};
