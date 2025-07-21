import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/userSlice";
import { BASE_URL } from "../contants/constant";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);

  const [isSignUpForm, setIsSignUpForm] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    userimageurl: "",
    role: "user",
    gender: "",
    usercountry: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch(BASE_URL + "user", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        dispatch(setUser(data.data));
        navigate("/");
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) return toast.warn("Please fill all fields");

    try {
      const response = await fetch(`${BASE_URL}login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      dispatch(setUser(data.data));
      toast.success("Login successful!");
      navigate(from);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const {
      username,
      userimageurl,
      role,
      email,
      gender,
      usercountry,
      password,
    } = formData;

    if (!username || !email || !password || !gender || !usercountry)
      return toast.warn("Please fill all required fields");

    try {
      const res = await fetch(`${BASE_URL}signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username,
          userimageurl,
          role,
          email,
          gender,
          usercountry,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      toast.success("Signup successful! Please log in.");
      setIsSignUpForm(false);
      setFormData({
        email: "",
        password: "",
        username: "",
        userimageurl: "",
        role: "user",
        gender: "",
        usercountry: "",
      });
    } catch (err) {
      toast.error(err.message || "Signup failed");
    }
  };

  return (
    <div className='w-[100vw] flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4'>
      <form
        onSubmit={isSignUpForm ? handleSignup : handleLogin}
        className='bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md transition-all duration-300 flex flex-col gap-4'
      >
        <h2 className='text-3xl font-bold mb-6 text-center text-indigo-700'>
          {isSignUpForm ? "Sign Up" : "Login"}
        </h2>

        {isSignUpForm && (
          <>
            <input
              type='text'
              name='username'
              placeholder='Username'
              value={formData.username}
              onChange={handleChange}
              className='input-style'
              required
            />
            <input
              type='text'
              name='userimageurl'
              placeholder='Profile Image URL (optional)'
              value={formData.userimageurl}
              onChange={handleChange}
              className='input-style'
            />
            <input
              type='text'
              name='gender'
              placeholder='Gender'
              value={formData.gender}
              onChange={handleChange}
              className='input-style'
              required
            />
            <input
              type='text'
              name='usercountry'
              placeholder='Country'
              value={formData.usercountry}
              onChange={handleChange}
              className='input-style'
              required
            />
          </>
        )}

        <input
          type='email'
          name='email'
          placeholder='Email'
          value={formData.email}
          onChange={handleChange}
          className='input-style'
          required
        />

        <input
          type='password'
          name='password'
          placeholder='Password'
          value={formData.password}
          onChange={handleChange}
          className='input-style'
          required
        />

        <button
          type='submit'
          className='w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded font-semibold transition'
        >
          {isSignUpForm ? "Register" : "Login"}
        </button>

        <p className='mt-4 text-center text-sm'>
          {isSignUpForm ? "Already have an account?" : "Don't have an account?"}{" "}
          <span
            onClick={() => setIsSignUpForm(!isSignUpForm)}
            className='text-indigo-600 hover:underline cursor-pointer font-semibold'
          >
            {isSignUpForm ? "Login" : "Sign Up"}
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
