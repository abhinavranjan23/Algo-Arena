const socketIo = require("socket.io");
const Leaderboard = require("../models/leaderBoard");
const { client } = require("../redisClient");

class MinHeap {
  constructor(limit = 10) {
    this.heap = [];
    this.limit = limit;
  }

  size() {
    return this.heap.length;
  }

  toArray() {
    return [...this.heap];
  }

  push(item) {
    // Remove existing user (by _id)
    this.heap = this.heap.filter(
      (el) => el.userId._id.toString() !== item.userId._id.toString()
    );

    if (this.heap.length >= this.limit) {
      if (item.score <= this.heap[0].score) return;
      this.replace(item);
    } else {
      this.heap.push(item);
      this._bubbleUp(this.heap.length - 1);
    }
  }

  replace(item) {
    this.heap[0] = item;
    this._bubbleDown(0);
  }

  _bubbleUp(index) {
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      if (this.heap[parentIdx].score <= this.heap[index].score) break;
      [this.heap[index], this.heap[parentIdx]] = [
        this.heap[parentIdx],
        this.heap[index],
      ];
      index = parentIdx;
    }
  }

  _bubbleDown(index) {
    const length = this.heap.length;
    while (true) {
      let left = 2 * index + 1;
      let right = 2 * index + 2;
      let smallest = index;

      if (left < length && this.heap[left].score < this.heap[smallest].score) {
        smallest = left;
      }
      if (
        right < length &&
        this.heap[right].score < this.heap[smallest].score
      ) {
        smallest = right;
      }

      if (smallest === index) break;
      [this.heap[index], this.heap[smallest]] = [
        this.heap[smallest],
        this.heap[index],
      ];
      index = smallest;
    }
  }
}

const topUsersHeap = new MinHeap(10);
let ioInstance = null;

const initializeSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"],
    },
  });
  (async () => {
    try {
      const cachedLeaderboard = await client.get("leaderboard");
      if (cachedLeaderboard) {
        const users = JSON.parse(cachedLeaderboard);
        users.forEach((user) => topUsersHeap.push(user));
        console.log("✅ Heap initialized from Redis cache");
      } else {
        const topUsersFromDB = await Leaderboard.find({})
          .sort({ score: -1 })
          .limit(10)
          .populate("userId", "username userimageurl usercountry gender");
        topUsersFromDB.forEach((user) => {
          topUsersHeap.push({
            userId: {
              _id: user.userId._id.toString(),
              username: user.userId.username,
              userimageurl: user.userId.userimageurl,
              usercountry: user.userId.usercountry,
              gender: user.userId.gender,
            },
            score: user.score,
          });
        });
        console.log("📦 Heap initialized from MongoDB (fallback)");
      }
    } catch (err) {
      console.error("❌ Error initializing heap from Redis:", err);
    }
  })();

  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    socket.on(
      "update-score",
      async ({
        userId,
        username,
        userimageurl,
        usercountry,
        score,
        gender,
      }) => {
        try {
          // ✅ DB update
          let user = await Leaderboard.findOne({ userId });
          if (!user) user = new Leaderboard({ userId, score: 0 });
          user.score = score;
          await user.save();

          // ✅ Heap update
          topUsersHeap.push({
            userId: {
              _id: userId.toString(),
              username,
              userimageurl,
              usercountry,
              gender,
            },
            score,
          });

          // ✅ Heap → sorted top 10
          const topUsers = topUsersHeap
            .toArray()
            .sort((a, b) => b.score - a.score);

          // ✅ Redis update
          await client.set("leaderboard", JSON.stringify(topUsers), {
            EX: 300,
          });

          // ✅ Emit
          io.emit("leaderboard-update", topUsers);
        } catch (err) {
          console.error("❌ Socket update error:", err);
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("❎ Client disconnected:", socket.id);
    });
  });
};

const getIO = () => ioInstance;

module.exports = { initializeSocket, getIO };
