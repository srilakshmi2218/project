import express from 'express';
import { addCustomer, getCustomers, getCustomerById } from '../controllers/customerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(addCustomer)
  .get(getCustomers);

router.route('/:id')
  .get(getCustomerById);

export default router;
