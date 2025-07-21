# 🚀 AlgoArena – Competitive Programming Platform

AlgoArena is a real-time, full-stack competitive programming platform built using the MERN stack. It enables users to solve algorithmic challenges, get personalized difficulty recommendations, submit code in multiple languages, and compete on real-time leaderboards — all within a secure, scalable architecture.

![AlgoArena Banner](<img width="1918" height="972" alt="image" src="https://github.com/user-attachments/assets/38326fbc-00aa-4b0e-878a-06466e2dfdcf" />
) <!-- Optional -->

---

## 🌟 Features

* ✅ **Dynamic Difficulty**: Adjusts problem level based on individual user performance using adaptive logic.
* 🔐 **Secure Authentication**: JWT + Firebase/Google OAuth for smooth and secure login.
* ⚡ **Real-Time Leaderboards**: Instant updates via Redis Pub/Sub and Socket.IO.
* 🧪 **Code Execution Engine**: Runs user code safely using Docker containers or AWS Lambda functions.
* 🧠 **DSA-Focused**: Problems based on graphs, dynamic programming, priority queues, etc.
* 🤝 **Graph-Based Friend Suggestions**: Find friends based on mutual problem-solving behavior.
* 📈 **Analytics & Progress Tracking**: Visualize your journey and improve over time.

---

## 🧑‍💻 Tech Stack

| Layer            | Technology                     |
| ---------------- | ------------------------------ |
| Frontend         | React.js, Tailwind CSS         |
| Backend          | Node.js, Express.js            |
| Database         | MongoDB                        |
| Real-Time Engine | WebSockets (Socket.IO), Redis  |
| Code Execution   | Docker Containers / AWS Lambda |
| Authentication   | JWT, Firebase (Google OAuth)   |

---

## 📦 Installation

> ⚠️ Ensure Docker is installed if running code locally.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/algoarena.git
cd algoarena
```

### 2. Install Dependencies

```bash
# For frontend
cd client
npm install

# For backend
cd ../server
npm install
```

### 3. Environment Variables

Create a `.env` file in the `server/` and `client/` folders:

Example (`server/.env`):

```env
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret
REDIS_URL=your_redis_url
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. Run Locally

```bash
# In one terminal
cd server
npm run dev

# In another terminal
cd client
npm start
```

App will be available at: [http://localhost:3000](http://localhost:3000)

---

## 📸 Screenshots

<!-- Add your own screenshots -->

* Login Page
* Problem Page
* Leaderboard

---

## 🛡️ Code Execution Engine

* Uses Docker to create isolated containers for each language (Node.js, Python, Java).
* Limits CPU & memory using flags like `--memory="128m" --cpus="0.5" --network=none`.
* AWS Lambda alternative for serverless and scalable execution.

---

## 🔮 Upcoming Features

* Contest Hosting (with timer and scoreboard)
* AI-Powered Hints using OpenAI API
* Submission History Charts
* In-depth User Stats & Topic Mastery

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork, submit issues, and create pull requests.

```bash
git checkout -b your-feature-branch
git commit -m "Add your feature"
git push origin your-feature-branch
```

---

## 📜 License

This project is licensed under the MIT License.
Feel free to use, modify, and share with proper attribution.

---

## 🙆‍♂️ Author

**Abhinav Ranjan**

