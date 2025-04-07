// // backend/server.js

// import express from "express";
// import next from "next";
// import dotenv from "dotenv";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import { v2 as cloudinary } from "cloudinary";
// import connectDB from "./db/connectDB.js";

// import authRoutes from "./routes/auth.route.js";
// import userRoutes from "./routes/user.route.js";
// import quizRoutes from "./routes/quiz.route.js";

// dotenv.config();
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// const port = process.env.PORT || 5000;
// const dev = process.env.NODE_ENV !== "production";
// const app = next({ dev, dir: "../frontend" }); // ✅ Tells Next.js to look in the frontend folder
// const handle = app.getRequestHandler();

// app.prepare().then(() => {
//   const server = express();

//   server.use(cors());
//   server.use(express.json({ limit: "5mb" }));
//   server.use(express.urlencoded({ extended: true }));
//   server.use(cookieParser());

//   // API routes
//   server.use("/api/auth", authRoutes);
//   server.use("/api/user", userRoutes);
//   server.use("/api/quiz", quizRoutes);

//   // Let Next.js handle frontend routes
//   server.all("*", (req, res) => {
//     return handle(req, res);
//   });

//   server.listen(port, () => {
//     console.log(`🚀 Server running on http://localhost:${port}`);
//     connectDB();
//   });
// });

import path from "path";
import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import { v2 as cloudinary } from "cloudinary";

// Import routes
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import quizRoutes from "./routes/quiz.route.js";

// Configure App
dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Setup Middleware
const allowedOrigins = ["https://kwikly-xi.vercel.app"]; // Replace with your actual frontend domain
app.use(
  cors({
    origin: allowedOrigins,
    methods: "GET,POST",
    allowedHeaders: "Content-Type, Authorization",
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Define Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/quiz", quizRoutes);

// Starting the server

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDB();
});
