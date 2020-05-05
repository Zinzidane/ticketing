import express, { Request, Response } from 'express';
import { requireAuth, NotFoundError, BadRequestError } from '@zzticketing/common';
import { body } from 'express-validator';
import mongoose from 'mongoose';

import { Ticket } from '../models/ticket';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders',
  requireAuth,
  async (req: Request, res: Response) => {
    const orders = await Order.find({
      userId: req.currentUser!.id
    }).populate('ticket');
    
    res.send(orders);
});

export { router as indexOrderRouter };