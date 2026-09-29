import { AuthRequest } from '../middleware/auth';
import { Response } from 'express';
import Booking from '../models/booking.model';
import Payment from '../models/payment.model';
import Document from '../models/document.model';
import Conversation from '../models/conversation.model';
import Message from '../models/message.model';
import Review from '../models/review.model';
import Company from '../models/company.model';
import User from '../models/user.model';
import Container from '../models/container.model';

export const seedCustomerData = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user?._id;
    if (!customerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    // Ensure we have a logistics company and a container
    let logisticsUser = await User.findOne({ role: 'logistics' });
    if (!logisticsUser) {
      logisticsUser = await User.create({ name: 'Fast Freight', email: 'fast@freight.com', password: 'password', role: 'logistics', isVerified: true });
    }
    
    let company = await Company.findOne({ userId: logisticsUser._id });
    if (!company) {
      company = await Company.create({ userId: logisticsUser._id, companyName: 'Fast Freight LLC', registrationNumber: 'REG123', isVerified: true });
    }

    let container = await Container.findOne({ companyId: company._id });
    if (!container) {
      container = await Container.create({ companyId: company._id, containerNumber: 'CONT-1234', type: '20ft', originPort: 'Shanghai', destinationPort: 'Rotterdam', capacity: 33, availableSpace: 10, pricePerCBM: 100, departureDate: new Date(), arrivalDate: new Date() });
    }

    // 1. Create a Completed Booking + Payment + Invoice
    const b1 = await Booking.create({
      customerId, containerId: container._id, companyId: company._id, requiredCBM: 5, cargoWeight: 1000, cargoType: 'Electronics', pickupAddress: 'Warehouse A', deliveryAddress: 'Warehouse B', status: 'completed', bookingNumber: 'BK-COMP-01'
    });
    await Payment.create({ bookingId: b1._id, customerId, companyId: company._id, amount: 500, commission: 25, gst: 50, totalAmount: 575, method: 'card', transactionId: 'txn_mock_1', status: 'completed' });
    
    // 2. Create Documents
    await Document.create({ userId: customerId, bookingId: b1._id, fileName: 'Bill of Lading - BK-COMP-01', type: 'bill_of_lading', fileUrl: '#' });
    await Document.create({ userId: customerId, bookingId: b1._id, fileName: 'Customs Clearance', type: 'certificate', fileUrl: '#' });

    // 3. Create a Conversation
    const conv = await Conversation.create({ participants: [{ userId: customerId, role: 'customer' }, { userId: logisticsUser._id, role: 'logistics' }], bookingId: b1._id });
    await Message.create({ conversationId: conv._id, senderId: logisticsUser._id, content: 'Hello, your cargo has arrived at the destination port.' });
    await Message.create({ conversationId: conv._id, senderId: customerId, content: 'Great! I will arrange pickup.' });

    // 4. Create an Active Booking
    const b2 = await Booking.create({
      customerId, containerId: container._id, companyId: company._id, requiredCBM: 2, cargoWeight: 500, cargoType: 'Textiles', pickupAddress: 'Warehouse X', deliveryAddress: 'Warehouse Y', status: 'in_transit', bookingNumber: 'BK-ACT-02'
    });
    await Payment.create({ bookingId: b2._id, customerId, companyId: company._id, amount: 200, commission: 10, gst: 20, totalAmount: 230, method: 'card', transactionId: 'txn_mock_2', status: 'completed' });

    res.json({ success: true, message: 'Seed complete' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const seedLogisticsData = async (req: AuthRequest, res: Response) => {
  try {
    const logisticsId = req.user?._id;
    if (!logisticsId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let company = await Company.findOne({ userId: logisticsId });
    if (!company) {
      company = await Company.create({ userId: logisticsId, companyName: 'My Carrier', isVerified: true });
    }

    let customerUser = await User.findOne({ role: 'customer' });
    if (!customerUser) {
      customerUser = await User.create({ name: 'Acme Corp', email: 'acme@corp.com', password: 'password', role: 'customer', isVerified: true });
    }

    let container = await Container.findOne({ companyId: company._id });
    if (!container) {
      container = await Container.create({ companyId: company._id, containerNumber: 'CONT-LCL-99', type: '40ft', originPort: 'Singapore', destinationPort: 'Hamburg', capacity: 67, availableSpace: 40, pricePerCBM: 80, departureDate: new Date(), arrivalDate: new Date() });
    }

    const b1 = await Booking.create({
      customerId: customerUser._id, containerId: container._id, companyId: company._id, requiredCBM: 10, cargoWeight: 2000, cargoType: 'Machinery', pickupAddress: 'Port A', deliveryAddress: 'Port B', status: 'completed', bookingNumber: 'BK-LOG-COMP-1'
    });
    await Payment.create({ bookingId: b1._id, customerId: customerUser._id, companyId: company._id, amount: 800, commission: 40, gst: 80, totalAmount: 920, method: 'card', transactionId: 'txn_log_1', status: 'completed' });
    
    const b2 = await Booking.create({
      customerId: customerUser._id, containerId: container._id, companyId: company._id, requiredCBM: 5, cargoWeight: 1000, cargoType: 'Textiles', pickupAddress: 'Port C', deliveryAddress: 'Port D', status: 'pending', bookingNumber: 'BK-LOG-PEND-2'
    });

    const conv = await Conversation.create({ participants: [{ userId: customerUser._id, role: 'customer' }, { userId: logisticsId, role: 'logistics' }], bookingId: b1._id });
    await Message.create({ conversationId: conv._id, senderId: customerUser._id, content: 'When will the container be loaded?' });
    await Message.create({ conversationId: conv._id, senderId: logisticsId, content: 'It is scheduled for loading tomorrow morning.' });

    res.json({ success: true, message: 'Logistics Seed complete' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
