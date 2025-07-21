import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, LogIn } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../contants/constant";
import { toast } from "react-toastify";
import { clearUser } from "../redux/userSlice"; // or use logoutUser() if you have

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);

  const handleLogout = async () => {
    try {
      const res = await fetch(`${BASE_URL}logout`, {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        dispatch(clearUser()); // or dispatch(logoutUser())
        toast.success("Logged out successfully");
        navigate("/login");
      } else {
        const data = await res.json();
        toast.error(data.message || "Logout failed");
      }
    } catch (error) {
      toast.error("Error logging out");
      console.error(error);
    }
  };

  return (
    <header className='w-[100vw] flex fixed top-0 z-30 items-center justify-between px-4 md:px-8 py-2 md:py-1 bg-white dark:bg-gray-900 shadow-sm'>
      <Link
        to='/'
        className='text-xl md:text-3xl logo-text leading-[1.9] text-transparent overflow-visible whitespace-nowrap bg-clip-text bg-gradient-to-r from-indigo-400 to-gray-500 dark:from-indigo-300 dark:to-gray-300 transition-transform hover:scale-105 hover:tracking-wide duration-300 ease-in-out'
      >
        AlgoArena
      </Link>
      {isLoggedIn && (
        <div className='flex items-center gap-4'>
          <Link to='/leaderboard'>
            <button className='px-4 py-2 bg-gradient-to-r from-indigo-400 to-gray-500 text-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out cursor-pointer'>
              Leaderboard
            </button>
          </Link>
          <Link
            to='/follower'
            className='md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-400 to-gray-500 text-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out cursor-pointer'
          >
            <span className='text-sm font-semibold'>Get Social</span>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 text-white'
              viewBox='0 0 20 20'
              fill='currentColor'
              aria-hidden='true'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zm-1.5-4.5a.5.5 0 01-.5-.5V9a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v4a.5.5 0 01-.5.5h-3z'
                clipRule='evenodd'
              />
            </svg>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className='p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-300 transition duration-200'
            title='Logout'
          >
            <LogOut className='h-5 w-5 text-red-600 dark:text-red-400' />
          </button>
        </div>
      )}
      {!isLoggedIn && (
        <Link
          to='/login'
          className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-400 to-gray-500 text-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out cursor-pointer'
        >
          <LogIn className='h-5 w-5' />
          <span className='text-sm font-semibold'>Login</span>
        </Link>
      )}
    </header>
  );
};

export default Header;
