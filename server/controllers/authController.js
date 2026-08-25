import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Agent } from '../models/Agent.js';
import bcrypt from 'bcryptjs';
import { loadFileData, saveFileData } from '../config/fileDb.js';

const generateToken = (id, email, name) => {
  return jwt.sign({ id, email, name }, process.env.JWT_SECRET || 'super_secret_call_center_jwt_key_2026', {
    expiresIn: '7d',
  });
};

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * @route   POST /api/auth/register
 * @desc    Register a new Call Center Agent
 * @access  Public
 */
export const registerAgent = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    if (isDbConnected()) {
      try {
        const agentExists = await Agent.findOne({ email });
        if (agentExists) {
          return res.status(400).json({ message: 'Agent already registered with this email' });
        }

        const agent = await Agent.create({
          name,
          email,
          password,
          role: role || 'Agent',
        });

        const token = generateToken(agent._id, agent.email, agent.name);

        return res.status(201).json({
          success: true,
          message: 'Agent registered successfully in MongoDB Atlas',
          token,
          agent: {
            id: agent._id,
            name: agent.name,
            email: agent.email,
            agentId: agent.agentId,
            role: agent.role,
          },
        });
      } catch (dbErr) {
        console.warn('[DB Register Error]', dbErr.message);
      }
    }

    // File-backed DB fallback
    const fileData = loadFileData();
    const existing = fileData.agents.find((a) => a.email === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ message: 'Agent already registered with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const mockAgent = {
      _id: 'mock_agt_' + Date.now(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      agentId: 'AGT-' + Math.floor(1000 + Math.random() * 9000),
      role: role || 'Agent',
    };
    fileData.agents.push(mockAgent);
    saveFileData(fileData);

    const token = generateToken(mockAgent._id, mockAgent.email, mockAgent.name);
    return res.status(201).json({
      success: true,
      message: 'Agent registered successfully',
      token,
      agent: {
        id: mockAgent._id,
        name: mockAgent.name,
        email: mockAgent.email,
        agentId: mockAgent.agentId,
        role: mockAgent.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate Agent & get token
 * @access  Public
 */
export const loginAgent = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    if (isDbConnected()) {
      try {
        const agent = await Agent.findOne({ email });
        if (agent && (await agent.matchPassword(password))) {
          const token = generateToken(agent._id, agent.email, agent.name);
          return res.json({
            success: true,
            message: 'Login successful',
            token,
            agent: {
              id: agent._id,
              name: agent.name,
              email: agent.email,
              agentId: agent.agentId,
              role: agent.role,
            },
          });
        }
      } catch (dbErr) {
        console.warn('[DB Login Error]', dbErr.message);
      }
    }

    // File-backed DB fallback
    const fileData = loadFileData();
    const mockMatch = fileData.agents.find((a) => a.email === email.toLowerCase());
    if (mockMatch) {
      const isPassCorrect = await bcrypt.compare(password, mockMatch.password);
      if (isPassCorrect) {
        const token = generateToken(mockMatch._id, mockMatch.email, mockMatch.name);
        return res.json({
          success: true,
          message: 'Login successful',
          token,
          agent: {
            id: mockMatch._id,
            name: mockMatch.name,
            email: mockMatch.email,
            agentId: mockMatch.agentId,
            role: mockMatch.role,
          },
        });
      }
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current agent profile
 * @access  Private
 */
export const getMe = async (req, res) => {
  return res.json({
    success: true,
    agent: req.agent,
  });
};
