import React, { useEffect, useState } from "react";
import { BASE_URL } from "../contants/constant";
import { useSelector } from "react-redux";
import useUserAuth from "../hooks/useUserAuth";
import { toast } from "react-toastify";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { socket } from "../socket"; // path adjust karna agar file kahin aur hai

const medalIcons = ["🥇", "🥈", "🥉"];

// Assume logged in user's id is available somehow (maybe from context/auth)
// For example purposes, let's hardcode:

const Leaderboard = () => {
  const { user, loading } = useUserAuth();
  const [leaders, setLeaders] = useState([]);
  const [leaderloading, setleaderLoading] = useState(true);
  const [followedUsers, setFollowedUsers] = useState(new Set()); // Set for easy lookup
  const loggedInUserId = useSelector((state) => state.user?.user?._id);
  const navigate = useNavigate();
  const location = useLocation();
  console.log("user", leaders);
  useEffect(() => {
    if (loading) return;
    if (!user) {
      toast.warn("You need to be logged in to access this page.");
      navigate("/login", { state: { from: location.pathname } });
    }
  }, [loading, user]);

  useEffect(() => {
    if (loading || !user) return;
    if (socket.connected) {
      console.log("🟢 Already connected to socket:", socket.id);
    }

    socket.on("connect", () => {
      console.log("🟢 Connected to socket:", socket.id);
    });
    socket.on("connect_error", (err) => {
      console.error("❌ Connection error:", err.message);
    });
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${BASE_URL}leaderboard`);
        const data = await res.json();
        setLeaders(data);

        const followRes = await fetch(`${BASE_URL}following/${loggedInUserId}`);
        const followData = await followRes.json();
        setFollowedUsers(new Set(followData.map((user) => user._id)));
      } catch (error) {
        console.error("Failed to fetch leaderboard or followings:", error);
      } finally {
        setleaderLoading(false);
      }
    };

    fetchLeaderboard();

    // Listen to real-time leaderboard updates
    socket.on("leaderboard-update", (updatedLeaderboard) => {
      console.log("📡 Received live leaderboard:", updatedLeaderboard);
      setLeaders(updatedLeaderboard);
    });

    // Cleanup on unmount
    return () => {
      socket.off("connect");
      socket.off("leaderboard-update");
    };
  }, [loading, user]);

  const handleFollowToggle = async (userId) => {
    try {
      const isFollowing = followedUsers.has(userId);
      if (isFollowing) {
        // Unfollow API call
        await fetch(`${BASE_URL}unfollow/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        // Update state
        setFollowedUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      } else {
        // Follow API call
        await fetch(`${BASE_URL}follow/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        // Update state
        setFollowedUsers((prev) => new Set(prev).add(userId));
      }
    } catch (error) {
      console.error("Failed to follow/unfollow user:", error);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-10 px-2 sm:px-4 mt-18 md:mt-12 w-[100vw]'>
      <div className='max-w-5xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-2xl'>
        <h1 className='text-3xl sm:text-4xl font-extrabold text-center text-blue-700 mb-6 sm:mb-8'>
          🏆 Global Leaderboard
        </h1>

        {leaderloading ? (
          <p className='text-center text-gray-500 text-lg'>leaderLoading...</p>
        ) : leaders.length === 0 ? (
          <p className='text-center text-gray-500 text-lg'>No entries yet!</p>
        ) : (
          <>
            {/* Desktop/Table View */}
            <div className='hidden md:table w-full'>
              <table className='w-full table-auto text-sm md:text-base'>
                <thead>
                  <tr className='bg-gradient-to-r from-blue-200 to-purple-200 text-blue-900'>
                    <th className='py-3 px-2 text-left'>Rank</th>
                    <th className='py-3 px-2 text-left'>User</th>
                    <th className='py-3 px-2 text-left'>Country</th>
                    <th className='py-3 px-2 text-center'>Score</th>
                    <th className='py-3 px-2 text-center'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaders.map((entry, index) => {
                    const isFollowing = followedUsers.has(entry.userId._id);
                    return (
                      <tr
                        key={entry._id}
                        className='border-b hover:bg-blue-50 transition duration-200'
                      >
                        <td className='py-3 px-2 font-bold text-blue-700'>
                          {medalIcons[index] || `#${index + 1}`}
                        </td>
                        <td className='py-3 px-2 flex items-center gap-3'>
                          <Link
                            to={`/profile/${entry.userId._id}`}
                            className='flex items-center gap-3 hover:cursor-pointer'
                          >
                            <img
                              src={entry.userId.userimageurl}
                              alt='profile'
                              className='w-10 h-10 rounded-full object-cover border border-blue-300'
                            />
                            <div>
                              <div className='font-semibold text-gray-800'>
                                {entry.userId.username}
                              </div>
                              <div className='text-sm text-gray-500'>
                                {entry.userId.gender}
                              </div>
                            </div>
                          </Link>
                        </td>
                        <td className='py-3 px-2'>
                          🌍 {entry.userId.usercountry}
                        </td>
                        <td className='py-3 px-2 text-center font-semibold text-purple-600 text-base'>
                          {entry.score}
                        </td>
                        <td className='py-3 px-2 text-center'>
                          {entry.userId._id !== loggedInUserId && (
                            <button
                              onClick={() =>
                                handleFollowToggle(entry.userId._id)
                              }
                              className={`px-3 py-1 rounded-md text-sm font-semibold cursor-grab ${
                                isFollowing
                                  ? "bg-red-500 text-white hover:bg-red-600"
                                  : "bg-green-500 text-white hover:bg-green-600"
                              }`}
                            >
                              {isFollowing ? "Unfollow" : "Follow"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className='md:hidden space-y-4'>
              {leaders.map((entry, index) => {
                const isFollowing = followedUsers.has(entry.userId._id);
                return (
                  <div
                    key={entry._id}
                    className='bg-blue-50 rounded-xl p-4 flex gap-4 items-center shadow-md'
                  >
                    <div className='text-2xl font-bold text-blue-600'>
                      {medalIcons[index] || `${index + 1}`}
                    </div>
                    <Link
                      to={`/profile/${entry.userId._id}`}
                      className='flex-1 flex flex-col gap-1 hover:underline'
                    >
                      <img
                        src={entry.userId.userimageurl}
                        alt='profile'
                        className='w-14 h-14 rounded-full border border-blue-300 object-cover'
                      />
                      <div className='flex-1'>
                        <div className='font-semibold text-lg text-gray-800'>
                          {entry.userId.username}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {entry.userId.gender} • 🌍 {entry.userId.usercountry}
                        </div>
                      </div>
                      <div className='text-purple-600 font-bold text-xl'>
                        {entry.score}
                      </div>
                      {entry.userId._id !== loggedInUserId && (
                        <button
                          onClick={() => handleFollowToggle(entry.userId._id)}
                          className={`px-3 py-1 rounded-md text-sm font-semibold ${
                            isFollowing
                              ? "bg-red-500 text-white hover:bg-red-600"
                              : "bg-green-500 text-white hover:bg-green-600"
                          }`}
                        >
                          {isFollowing ? "Unfollow" : "Follow"}
                        </button>
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
