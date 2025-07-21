import React, { useEffect, useState } from "react";
import { BASE_URL } from "../contants/constant";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import useUserAuth from "../hooks/useUserAuth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
const FollowSuggestion = () => {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeTab, setActiveTab] = useState("followers");
  const navigate = useNavigate();
  const userId = useSelector((state) => state.user?.user?._id);

  const { user, loading } = useUserAuth();
  console.log(userId);
  useEffect(() => {
    if (loading) return;
    if (!user) {
      toast.error("You need to be logged in to view this page.");
      navigate("/login");
    }
  }, [loading, user]);

  useEffect(() => {
    if (!userId) return;
    fetchData();
  }, [loading, userId]);

  const fetchData = async () => {
    try {
      const fetchOptions = {
        credentials: "include",
      };

      const [followersRes, followingRes, suggestionRes] = await Promise.all([
        fetch(`${BASE_URL}followers/${userId}`, fetchOptions),
        fetch(`${BASE_URL}following/${userId}`, fetchOptions),
        fetch(`${BASE_URL}suggestions`, fetchOptions),
      ]);

      const [followersData, followingData, suggestionsData] = await Promise.all(
        [followersRes.json(), followingRes.json(), suggestionRes.json()]
      );

      setFollowers(followersData);
      setFollowing(followingData);
      setSuggestions(suggestionsData);
    } catch (error) {
      toast.error("Failed to load data");
      console.error("Error fetching follow data:", error);
    }
  };

  const handleFollow = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}follow/${id}`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        toast.success("Followed successfully!");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Follow failed");
      }
    } catch {
      toast.error("Follow failed");
    }
  };

  const handleUnfollow = async (id) => {
    try {
      const res = await fetch(`${BASE_URL}unfollow/${id}`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        toast.info("Unfollowed");
        fetchData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Unfollow failed");
      }
    } catch {
      toast.error("Unfollow failed");
    }
  };

  const renderUsers = (users, isSuggestion = false) =>
    users.length === 0 ? (
      <p className='text-center text-gray-500 mt-4 text-lg'>
        {isSuggestion
          ? "No user suggestions at the moment."
          : activeTab === "followers"
          ? "You have no followers yet."
          : "You're not following anyone yet."}
      </p>
    ) : (
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4'>
        {users.map((user) => (
          <Link
            key={user._id}
            to={`/profile/${user._id}`}
            className='flex-1 flex flex-col gap-1 hover:cursor-pointer'
          >
            <div
              key={user._id}
              className='bg-white p-5 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-200 flex items-center gap-4'
            >
              <img
                src={user.userimageurl}
                alt='profile'
                className='w-14 h-14 rounded-full object-cover border-2 border-indigo-300'
              />
              <div className='flex-1'>
                <div className='font-semibold text-gray-800 text-lg'>
                  {user.username}
                </div>
                <div className='text-sm text-gray-500'>
                  {user.gender} • {user.usercountry}
                </div>
              </div>
              {isSuggestion ? (
                <button
                  onClick={() => handleFollow(user._id)}
                  className='bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1 rounded-md text-sm shadow-sm'
                >
                  Follow
                </button>
              ) : following.some((f) => f._id === user._id) ? (
                <button
                  onClick={() => handleUnfollow(user._id)}
                  className='bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-md text-sm shadow-sm'
                >
                  Unfollow
                </button>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    );

  return (
    <div className='p-6 bg-gradient-to-br from-purple-100 via-indigo-100 to-pink-100 min-h-screen mt-20 md:mt-16 w-[100vw]'>
      <div className='max-w-6xl mx-auto bg-white p-8 rounded-3xl shadow-2xl'>
        <h1 className='text-4xl font-extrabold text-center text-indigo-700 mb-8'>
          🌐 Social Connect
        </h1>

        <div className='flex justify-center gap-4 sm:gap-8 mb-6 flex-wrap'>
          {["followers", "following", "suggestions"].map((tab) => (
            <button
              key={tab}
              className={`px-5 py-2 text-sm sm:text-base rounded-full font-semibold transition-all duration-150 ${
                activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-indigo-100"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "followers" && renderUsers(followers)}
        {activeTab === "following" && renderUsers(following)}
        {activeTab === "suggestions" && renderUsers(suggestions, true)}
      </div>
    </div>
  );
};

export default FollowSuggestion;
