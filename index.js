import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { createServer } from "http";
import { Server } from "socket.io";
import Message from "./models/Message.js";

dotenv.config();

connectDB();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  },
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Socket.io connection
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join user's personal room
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  // Handle sending messages
  socket.on("sendMessage", async (messageData) => {
    try {
      // Save message to database
      const newMessage = await Message.create({
        sender: messageData.senderId,
        receiver: messageData.receiverId,
        message: messageData.message
      });

      // Populate the message with user details
      const populatedMessage = await Message.findById(newMessage._id)
        .populate('sender', 'name email')
        .populate('receiver', 'name email');

      // Emit to both sender and receiver
      io.to(messageData.senderId).emit('receiveMessage', populatedMessage);
      io.to(messageData.receiverId).emit('receiveMessage', populatedMessage);

    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});



// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import connectDB from "./config/db.js";
// import authRoutes from "./routes/authRoutes.js";
// import chatRoutes from "./routes/chatRoutes.js";
// import { createServer } from "http";
// import { Server } from "socket.io";

// dotenv.config();

// connectDB();

// const app = express();
// const httpServer = createServer(app);

// // Socket.io setup
// const io = new Server(httpServer, {
//   cors: {
//     origin: process.env.FRONTEND_URL || "http://localhost:3000",
//     methods: ["GET", "POST"],
//   },
// });

// const port = process.env.PORT || 5001;
// // Middleware
// app.use(cors());
// app.use(express.json());

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/chat", chatRoutes);

// app.listen(port, () => {
//   console.log(`server is running on port ${port}`);
// });

// // Socket.io connection
// io.on("connection", (socket) => {
//   console.log("A user connected");

//   socket.on("join", (userId) => {
//     socket.join(userId);
//     console.log(`User ${userId} joined their room`);
//   });

//   socket.on("sendMessage", async (message) => {
//     try {
//       // Save message to database first
//       const newMessage = await Message.create({
//         sender: message.sender._id,
//         receiver: message.receiver._id,
//         message: message.message,
//       });

//       // Populate the sender and receiver details
//       const populatedMessage = await Message.findById(newMessage._id)
//         .populate('sender', 'name email')
//         .populate('receiver', 'name email');

//       // Emit to both parties
//       io.to(message.sender._id).emit('receiveMessage', populatedMessage);
//       io.to(message.receiver._id).emit('receiveMessage', populatedMessage);
      
//     } catch (error) {
//       console.error('Error handling message:', error);
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected");
//   });
// });


// io.on("connection", (socket) => {
//   console.log("A user connected");

//   socket.on("join", (userId) => {
//     socket.join(userId);
//     console.log(`User ${userId} joined their room`);
//   });

//   socket.on("sendMessage", (message) => {
//     // Broadcast to both sender and receiver rooms
//     io.to(message.sender._id)
//       .to(message.receiver._id)
//       .emit("receiveMessage", message);
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected");
//   });
// });
