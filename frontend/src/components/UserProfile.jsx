import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../contants/constant";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
const difficultyColors = {
  Easy: "bg-green-200 text-green-800",
  Medium: "bg-yellow-200 text-yellow-800",
  Hard: "bg-red-200 text-red-800",
};

const UserProfile = () => {
  const { userId } = useParams();

  // Current logged-in user id (aap apne auth logic ke hisaab se update kar lena)
  const currentUserId = useSelector((state) => state.user?.user?._id);

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await fetch(`${BASE_URL}profile/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        setUserData(data);

        // Check if current user is following this profile user
        const following = data.followers.some(
          (follower) => follower._id === currentUserId
        );
        setIsFollowing(following);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleFollowToggle = async () => {
    setButtonLoading(true);
    try {
      const url = `${BASE_URL}${isFollowing ? "unfollow" : "follow"}/${userId}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const result = await res.json();
      if (res.ok) {
        setIsFollowing(!isFollowing);

        setUserData((prev) => {
          let updatedFollowers;
          if (isFollowing) {
            // Unfollow: remove current user from followers
            updatedFollowers = prev.followers.filter(
              (follower) => follower._id !== currentUserId
            );
          } else {
            // Follow: add current user to followers
            updatedFollowers = [
              ...prev.followers,
              {
                _id: currentUserId,
                username: "You",
                userimageurl: "your-image-url",
              },
            ];
          }
          return { ...prev, followers: updatedFollowers };
        });
      } else {
        alert(result.message || "Failed to update follow status");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setButtonLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-96 text-gray-400 text-xl animate-pulse'>
        Loading user data...
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex justify-center items-center h-96 text-red-600 text-xl'>
        Error: {error}
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className='max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-20'>
      {/* Header */}
      <div className='flex flex-col md:flex-row items-center md:items-start gap-6'>
        <div className='relative group w-40 h-40 rounded-full overflow-hidden shadow-lg cursor-pointer'>
          <img
            src={userData.userimageurl}
            alt={userData.username}
            className='w-full h-full object-cover transform group-hover:scale-110 transition duration-500'
          />
          <div className='absolute inset-0 bg-black bg-opacity-25 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-semibold text-lg transition duration-500'>
            {userData.username}
          </div>
        </div>

        <div className='flex-1'>
          <h1 className='text-4xl font-extrabold text-gray-900'>
            {userData.username}
          </h1>
          <p className='text-gray-600 text-lg mt-1 flex items-center gap-2'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6 text-blue-500'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M17.657 16.657L13.414 12.414M16 10a4 4 0 11-8 0 4 4 0 018 0z'
              />
            </svg>
            {userData.usercountry}
          </p>
          <p className='text-gray-600 text-lg mt-1'>
            Gender: <span className='font-semibold'>{userData.gender}</span>
          </p>
          <p className='text-gray-600 text-lg mt-1'>
            Email:{" "}
            <a
              href={`mailto:${userData.email}`}
              className='text-blue-600 hover:underline'
            >
              {userData.email}
            </a>
          </p>

          {/* Follow/Unfollow Button */}
          {currentUserId !== userId && (
            <button
              onClick={handleFollowToggle}
              disabled={buttonLoading}
              className={`mt-6 px-6 py-2 rounded-full font-semibold text-white transition-colors ${
                isFollowing
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              } ${buttonLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {buttonLoading
                ? isFollowing
                  ? "Unfollowing..."
                  : "Following..."
                : isFollowing
                ? "Unfollow"
                : "Follow"}
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-10'>
        {/* Followers */}
        <div className='bg-gradient-to-tr from-blue-400 to-blue-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform cursor-pointer'>
          <h2 className='text-2xl font-bold'>
            {userData.followers?.length || 0}
          </h2>
          <p className='uppercase tracking-wider text-sm opacity-90'>
            Followers
          </p>
          <div className='mt-4 flex flex-wrap gap-3'>
            {userData.followers?.length > 0 ? (
              userData.followers.map((follower) => (
                <Link
                  to={`/profile/${follower._id}`}
                  className='flex items-center gap-3 hover:cursor-pointer'
                >
                  <img
                    key={follower._id}
                    src={follower.userimageurl}
                    alt={follower.username}
                    title={follower.username}
                    className='w-10 h-10 rounded-full object-cover border-2 border-white shadow-md'
                  />
                </Link>
              ))
            ) : (
              <p className='opacity-75 italic text-sm'>No followers yet.</p>
            )}
          </div>
        </div>

        {/* Following */}
        <div className='bg-gradient-to-tr from-purple-400 to-purple-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform cursor-pointer'>
          <h2 className='text-2xl font-bold'>
            {userData.following?.length || 0}
          </h2>
          <p className='uppercase tracking-wider text-sm opacity-90'>
            Following
          </p>
          <div className='mt-4 flex flex-wrap gap-3'>
            {userData.following?.length > 0 ? (
              userData.following.map((following) => (
                <Link
                  to={`/profile/${following._id}`}
                  className='flex items-center gap-3 hover:cursor-pointer'
                >
                  <img
                    key={following._id}
                    src={following.userimageurl}
                    alt={following.username}
                    title={following.username}
                    className='w-10 h-10 rounded-full object-cover border-2 border-white shadow-md'
                  />
                </Link>
              ))
            ) : (
              <p className='opacity-75 italic text-sm'>Not following anyone.</p>
            )}
          </div>
        </div>

        {/* Problems Solved */}
        <div className='bg-gradient-to-tr from-pink-400 to-pink-600 rounded-xl p-6 text-white shadow-lg cursor-default'>
          <h2 className='text-2xl font-bold'>
            {userData.solvedProblems?.length || 0}
          </h2>
          <p className='uppercase tracking-wider text-sm opacity-90'>
            Problems Solved
          </p>
          <div className='mt-4 max-h-48 overflow-y-auto'>
            {userData.solvedProblems?.length > 0 ? (
              userData.solvedProblems.map((problem) => (
                <div
                  key={problem._id}
                  className='flex justify-between items-center mb-2'
                >
                  <span>{problem.title}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      difficultyColors[problem.difficulty] || ""
                    }`}
                  >
                    {problem.difficulty}
                  </span>
                </div>
              ))
            ) : (
              <p className='opacity-75 italic text-sm'>
                No problems solved yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
