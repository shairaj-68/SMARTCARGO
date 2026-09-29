import { Response } from 'express';
import Dispute from '../models/dispute.model';
import { AuthRequest } from '../middleware/auth';

export const createDispute = async (req: AuthRequest, res: Response) => {
  try {
    const dispute = await Dispute.create({
      ...req.body,
      raisedBy: req.user?._id,
    });
    res.status(201).json({ success: true, dispute });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDisputes = async (req: AuthRequest, res: Response) => {
  try {
    const disputes = await Dispute.find({
      $or: [{ customerId: req.user?._id }, { raisedBy: req.user?._id }],
    })
      .populate('bookingId')
      .populate('customerId', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, disputes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addDisputeMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { text } = req.body;
    const dispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      { $push: { messages: { sender: req.user?._id, text, createdAt: new Date() } } },
      { new: true }
    );
    res.json({ success: true, dispute });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveDispute = async (req: AuthRequest, res: Response) => {
  try {
    const { resolution, status } = req.body;
    const dispute = await Dispute.findByIdAndUpdate(
      req.params.id,
      { resolution, status },
      { new: true }
    );
    res.json({ success: true, dispute });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllDisputes = async (req: AuthRequest, res: Response) => {
  try {
    const disputes = await Dispute.find()
      .populate('bookingId')
      .populate('customerId', 'name')
      .populate('companyId', 'companyName')
      .sort({ createdAt: -1 });
    res.json({ success: true, disputes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
