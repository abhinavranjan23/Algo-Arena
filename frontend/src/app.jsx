import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Main from "./components/Main";
import Problem from "./components/Problem";
import Login from "./components/Login";
const root = ReactDOM.createRoot(document.getElementById("root"));
import Leaderboard from "./components/LeaderBoard";
import FollowSuggestion from "./components/FollowSuggestion";
import UserProfile from "./components/UserProfile";
const App = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Main />,
      },
      {
        path: "/leaderboard",
        element: <Leaderboard />,
      },
      {
        path: "/problem/:problemId",
        element: <Problem />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/profile/:userId",
        element: <UserProfile />,
      },
      {
        path: "/follower",
        element: <FollowSuggestion />,
      },
    ],
  },
]);

root.render(<RouterProvider router={App} />);
