const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/databaseConfig.js");
const authRouter = require("./routes/auth.js");
const cookieParser = require("cookie-parser");
const leaderRouter = require("./routes/leaderBoard.js");
const problemRouter = require("./routes/problems.js");
const followRouter = require("./routes/followRouter.js");
const submitRouter = require("./routes/submitRouter.js");
const { initializeSocket } = require("./utils/sockets.js");
dotenv.config();
const app = express();
const server = createServer(app);

// const io = new Server(server, {
//   cors: { origin: "http://localhost:5173", credentials: true },
// });

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", leaderRouter);
app.use("/", problemRouter);
app.use("/", followRouter);
app.use("/", submitRouter);
connectDB()
  .then(() => {
    console.log("MongoDB connected");

    // ✅ Initialize WebSocket
    initializeSocket(server);

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// module.exports = { app };
