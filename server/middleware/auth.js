import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Agent } from '../models/Agent.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_call_center_jwt_key_2026');

      let agentFound = null;

      // Only attempt Mongoose query if valid ObjectId format
      if (mongoose.Types.ObjectId.isValid(decoded.id)) {
        try {
          agentFound = await Agent.findById(decoded.id).select('-password');
        } catch (e) {
          // DB unreached or query error
        }
      }

      if (agentFound) {
        req.agent = agentFound;
      } else {
        // In-memory fallback agent profile
        req.agent = {
          _id: decoded.id,
          id: decoded.id,
          email: decoded.email,
          name: decoded.name || 'Agent',
          agentId: 'AGT-01',
          role: 'Agent',
        };
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed: ' + error.message });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};
