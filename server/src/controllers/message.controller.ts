import { Response } from 'express';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import { AuthRequest } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await Conversation.find({ participants: req.user?._id })
      .populate('exporterId', 'name avatar role company')
      .populate('carrierId', 'name avatar role company')
      .populate({ path: 'bookingId', select: 'bookingNumber status requiredCBM cargoType pickupAddress deliveryAddress' })
      .sort({ updatedAt: -1 });
    res.json({ success: true, conversations });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    // Only fetch if user is participant
    const conversation = await Conversation.findOne({
      _id: req.params.conversationId,
      participants: req.user?._id
    });

    if (!conversation) return res.status(403).json({ success: false, message: 'Unauthorized access to conversation' });

    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate('senderId', 'name avatar role')
      .sort({ timestamp: 1 });
    res.json({ success: true, messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, receiverId, text, type, attachments } = req.body;
    
    // Verify participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user?._id
    });

    if (!conversation) return res.status(403).json({ success: false, message: 'Unauthorized' });

    const message = await Message.create({
      messageId: uuidv4(),
      conversationId,
      senderId: req.user?._id,
      receiverId,
      message: text,
      messageType: type || 'text',
      attachments: attachments || [],
      status: 'Sending',
    });

    // We don't artificially update unreadCount here in the model, we can let sockets handle delivery status.
    await Conversation.findByIdAndUpdate(conversationId, {
      updatedAt: new Date(),
    });

    res.status(201).json({ success: true, message });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId } = req.body;
    await Message.updateMany(
      { conversationId, receiverId: req.user?._id, status: { $ne: 'Seen' } },
      { status: 'Seen' }
    );
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMessage = async (req: AuthRequest, res: Response) => {
  try {
    const message = await Message.findOne({ _id: req.params.id, senderId: req.user?._id });
    if (!message) return res.status(403).json({ success: false, message: 'Unauthorized' });
    
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
