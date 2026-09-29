import { Server, Socket } from 'socket.io';
import Message from '../models/message.model';
import Conversation from '../models/conversation.model';

const onlineUsers = new Map<string, string>(); // userId -> socketId

export const initializeSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    socket.on('user-online', (userId: string) => {
      onlineUsers.set(userId, socket.id);
      io.emit('user-online', userId);
    });

    socket.on('join-room', (conversationId: string) => {
      socket.join(conversationId);
    });

    socket.on('leave-room', (conversationId: string) => {
      socket.leave(conversationId);
    });

    socket.on('send-message', async (data: { messageId: string, conversationId: string; senderId: string; receiverId: string; message: string; messageType: string; attachments?: string[] }) => {
      try {
        const receiverSocket = onlineUsers.get(data.receiverId);
        
        // Broadcast immediately to receiver for real-time feel
        if (receiverSocket) {
          io.to(receiverSocket).emit('receive-message', {
            messageId: data.messageId,
            conversationId: data.conversationId,
            senderId: data.senderId,
            receiverId: data.receiverId,
            message: data.message,
            messageType: data.messageType,
            attachments: data.attachments || [],
            timestamp: new Date(),
            status: 'Delivered',
            isRead: false
          });
          
          // Notify sender it was delivered
          const senderSocket = onlineUsers.get(data.senderId);
          if (senderSocket) {
            io.to(senderSocket).emit('message-delivered', { messageId: data.messageId, conversationId: data.conversationId });
          }

          // Update DB Status
          await Message.findOneAndUpdate({ messageId: data.messageId }, { status: 'Delivered' });
        }
        
      } catch (error) {
        console.error('Send message socket error:', error);
      }
    });

    socket.on('typing', (data: { conversationId: string; userId: string }) => {
      socket.to(data.conversationId).emit('typing', { userId: data.userId });
    });

    socket.on('stop-typing', (data: { conversationId: string; userId: string }) => {
      socket.to(data.conversationId).emit('stop-typing', { userId: data.userId });
    });

    socket.on('message-read', async (data: { conversationId: string; userId: string }) => {
      socket.to(data.conversationId).emit('message-read', { conversationId: data.conversationId, userId: data.userId });
    });

    socket.on('disconnect', () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          io.emit('user-offline', userId);
          break;
        }
      }
    });
  });
};

export const getOnlineUsers = () => onlineUsers;
