const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:4200',
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userEmail = decoded.email;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.userEmail} connected`);

    // Join user to their personal room for order updates
    socket.join(`user_${socket.userId}`);

    // Join admin users to admin room
    socket.join('admin_room');

    socket.on('disconnect', () => {
      console.log(`User ${socket.userEmail} disconnected`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Real-time event emitters
const emitStockUpdate = (productId, newStock) => {
  if (io) {
    io.emit('stock_updated', { productId, newStock });
  }
};

const emitOrderUpdate = (userId, orderData) => {
  if (io) {
    io.to(`user_${userId}`).emit('order_updated', orderData);
    io.to('admin_room').emit('new_order', orderData);
  }
};

const emitNewOrder = (orderData) => {
  if (io) {
    io.to('admin_room').emit('new_order', orderData);
  }
};

const emitProductUpdate = (productData) => {
  if (io) {
    io.emit('product_updated', productData);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitStockUpdate,
  emitOrderUpdate,
  emitNewOrder,
  emitProductUpdate
};