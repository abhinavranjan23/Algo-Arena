const { createClient } = require("redis");

const client = createClient({
  url: "redis://127.0.0.1:6379",
});

client.on("error", (err) => {
  console.error("❌ Redis Error:", err);
});

client.on("connect", () => {
  console.log("✅ Redis Connected");
});

// Export a ready promise so other files can await it if needed
const redisReady = client.connect().catch((err) => {
  console.error("❌ Redis connection failed:", err);
});

module.exports = { client, redisReady };
