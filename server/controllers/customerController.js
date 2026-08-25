import mongoose from 'mongoose';
import { Customer } from '../models/Customer.js';
import { loadFileData, saveFileData } from '../config/fileDb.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * @route   POST /api/customers
 * @desc    Add a new customer
 * @access  Private
 */
export const addCustomer = async (req, res) => {
  try {
    const { name, phone, email, company, notes, status } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: 'Customer name and phone number are required' });
    }

    if (isDbConnected()) {
      try {
        const customer = await Customer.create({
          name,
          phone,
          email: email || '',
          company: company || 'Individual',
          notes: notes || '',
          status: status || 'Lead',
          agentId: req.agent._id || req.agent.id,
        });

        return res.status(201).json({
          success: true,
          message: 'Customer added to MongoDB Atlas successfully',
          customer,
        });
      } catch (dbError) {
        console.warn('[Customer DB Error]', dbError.message);
      }
    }

    // File-backed DB fallback
    const fileData = loadFileData();
    const mockCust = {
      _id: 'cust_' + Date.now(),
      name,
      phone,
      email: email || '',
      company: company || 'Individual',
      notes: notes || '',
      status: status || 'Lead',
      agentId: req.agent._id || req.agent.id,
      createdAt: new Date().toISOString(),
    };
    fileData.customers.unshift(mockCust);
    saveFileData(fileData);

    return res.status(201).json({
      success: true,
      message: 'Customer added successfully',
      customer: mockCust,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/customers
 * @desc    Get all customers for current agent
 * @access  Private
 */
export const getCustomers = async (req, res) => {
  try {
    if (isDbConnected()) {
      try {
        const customers = await Customer.find().sort({ createdAt: -1 });
        return res.json({
          success: true,
          count: customers.length,
          customers,
        });
      } catch (dbError) {
        console.warn('[Customer List DB Error]', dbError.message);
      }
    }

    const fileData = loadFileData();
    return res.json({
      success: true,
      count: fileData.customers.length,
      customers: fileData.customers,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @route   GET /api/customers/:id
 * @desc    Get customer by ID
 * @access  Private
 */
export const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected()) {
      try {
        const customer = await Customer.findById(id);
        if (customer) {
          return res.json({ success: true, customer });
        }
      } catch (dbError) {
        console.warn('[Customer Detail DB Error]');
      }
    }

    const fileData = loadFileData();
    const found = fileData.customers.find((c) => c._id === id);
    if (found) {
      return res.json({ success: true, customer: found });
    }

    return res.status(404).json({ message: 'Customer not found' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
