require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const connectDB = async () => {
  try {
    const mongoose = require('mongoose');
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medicare', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.warn('WARNING: Running backend database in offline mode. DB operations will fail until MongoDB is started.');
  }
};

const { configureCloudinary } = require('./config/cloudinary');
const { errorHandler } = require('./middleware/errorMiddleware');
const Notification = require('./models/Notification');
const Message = require('./models/Message');

// Connect to Database
connectDB();

// Configure Cloudinary
configureCloudinary();

const app = express();
const server = http.createServer(app);

// Socket.io configuration
const io = socketio(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Store online sockets mapped by User ID
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`New WebSocket client connected: ${socket.id}`);

  // User identifies/registers their socket
  socket.on('join', (userId) => {
    if (userId) {
      onlineUsers.set(userId, socket.id);
      socket.join(userId);
      console.log(`User ${userId} joined room. Online count: ${onlineUsers.size}`);
    }
  });

  // Handle peer-to-peer chat message
  socket.on('sendMessage', async ({ senderId, recipientId, text }, callback) => {
    try {
      if (!senderId || !recipientId || !text) {
        return callback && callback({ success: false, error: 'Malformed message data.' });
      }

      // Save chat log to DB
      const message = await Message.create({
        sender: senderId,
        recipient: recipientId,
        text,
      });

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name profilePicture')
        .populate('recipient', 'name profilePicture');

      // Deliver message in real-time if recipient is online
      io.to(recipientId).emit('messageReceived', populatedMessage);
      
      // Send back to original sender's panels
      io.to(senderId).emit('messageReceived', populatedMessage);

      // Create in-app system notification
      await Notification.create({
        user: recipientId,
        title: 'New Message',
        message: `You received a message: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
        type: 'chat',
      });

      // Notify recipient room about incoming unread notification count
      io.to(recipientId).emit('notificationReceived', {
        title: 'New Message',
        message: `You received a message.`,
      });

      if (callback) callback({ success: true, message: populatedMessage });
    } catch (err) {
      console.error('Socket message save error:', err);
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Client disconnects
  socket.on('disconnect', () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`User ${userId} disconnected. Online count: ${onlineUsers.size}`);
        break;
      }
    }
  });
});

// Middleware integrations
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows cross-origin image requests for multer local uploads
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express Static Files (Serves uploaded local files in development)
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// Express Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use('/api', apiLimiter);

// API Route mountings
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Get notifications endpoint (added here for ease)
app.get('/api/notifications', async (req, res, next) => {
  try {
    const { protect } = require('./middleware/authMiddleware');
    // Inline protect application
    await new Promise((resolve) => protect(req, res, resolve));
    if (!req.user) return; // Response sent inside protect if auth fails

    const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(20);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
});

// Read messages between two users
app.get('/api/chat/:peerId', async (req, res, next) => {
  try {
    const { protect } = require('./middleware/authMiddleware');
    await new Promise((resolve) => protect(req, res, resolve));
    if (!req.user) return;

    const { peerId } = req.params;
    
    // Find messages where sender/recipient matches user/peer
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: peerId },
        { sender: peerId, recipient: req.user._id },
      ],
    })
      .populate('sender', 'name profilePicture')
      .populate('recipient', 'name profilePicture')
      .sort('createdAt');

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
});

// Basic check route
app.get('/', (req, res) => {
  res.json({ message: 'Medicare API running successfully!' });
});

// Error handling middleware
app.use(errorHandler);

// Global unhandled route catch
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'API Route Not Found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
