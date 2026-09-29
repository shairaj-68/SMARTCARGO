export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: 'admin' | 'logistics' | 'customer';
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface Company {
  _id: string;
  userId: User | string;
  companyName: string;
  registrationNumber: string;
  gstNumber: string;
  address: string;
  city: string;
  country: string;
  documents: string[];
  verificationStatus: 'pending' | 'verified' | 'rejected';
  rating: number;
  totalReviews: number;
  totalBookings: number;
  description: string;
  website: string;
  createdAt: string;
}

export interface Container {
  _id: string;
  companyId: Company;
  containerNumber: string;
  type: '20ft' | '40ft' | 'reefer' | 'openTop' | 'flatRack';
  originPort: string;
  destinationPort: string;
  originCountry: string;
  destinationCountry: string;
  departureDate: string;
  arrivalDate: string;
  capacity: number;
  bookedSpace: number;
  availableSpace: number;
  pricePerCBM: number;
  minBooking: number;
  maxBooking: number;
  cargoTypes: string[];
  status: 'active' | 'paused' | 'closed' | 'full';
  terms: string;
  images: string[];
  createdAt: string;
}

export type BookingStatus = 'pending' | 'counter_offer' | 'accepted' | 'payment_pending' | 'confirmed' | 'pickup_scheduled' | 'cargo_received' | 'container_loaded' | 'in_transit' | 'reached_port' | 'customs_clearance' | 'out_for_delivery' | 'delivered' | 'completed' | 'cancelled';

export interface Booking {
  _id: string;
  customerId: User;
  containerId: Container;
  companyId: Company;
  requiredCBM: number;
  cargoWeight: number;
  cargoType: string;
  pickupAddress: string;
  deliveryAddress: string;
  specialInstructions: string;
  documents: string[];
  status: BookingStatus;
  quotation: {
    pricePerCBM: number;
    totalAmount: number;
    pickupDate: string;
    availableSpace: number;
    conditions: string;
  };
  paymentId: string;
  bookingNumber: string;
  createdAt: string;
}

export interface Payment {
  _id: string;
  bookingId: Booking;
  customerId: User;
  companyId: Company;
  amount: number;
  commission: number;
  gst: number;
  totalAmount: number;
  method: string;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  bookingId: Booking;
  customerId: User;
  companyId: Company;
  items: { description: string; quantity: number; rate: number; amount: number }[];
  subtotal: number;
  gst: number;
  commission: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  createdAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: User;
  receiverId: User | string;
  text: string;
  attachments: string[];
  type: 'text' | 'image' | 'pdf' | 'quotation' | 'invoice' | 'voice';
  seenAt: string | null;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: User[];
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: Record<string, number>;
  createdAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'message' | 'system' | 'document' | 'shipment';
  isRead: boolean;
  link: string;
  createdAt: string;
}

export interface Document {
  _id: string;
  userId: string;
  bookingId: string;
  type: string;
  fileName: string;
  fileUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  createdAt: string;
}

export interface Review {
  _id: string;
  customerId: User;
  companyId: string;
  bookingId: string;
  rating: number;
  comment: string;
  reply: string;
  createdAt: string;
}

export interface Dispute {
  _id: string;
  bookingId: Booking;
  customerId: User;
  companyId: Company;
  raisedBy: string;
  reason: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  resolution: string;
  messages: { sender: string; text: string; createdAt: string }[];
  createdAt: string;
}

export interface Tracking {
  _id: string;
  bookingId: string;
  status: string;
  location: string;
  notes: string;
  timestamp: string;
}
