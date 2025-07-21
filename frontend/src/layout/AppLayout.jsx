import React from "react";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Provider } from "react-redux";
import appStore from "../redux/appStore";
const AppLayout = () => {
  return (
    <div>
      <Provider store={appStore}>
        <ToastContainer />

        <Header />
        <div className='flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 w-[99vw] overflow-x-hidden'>
          <Outlet />
        </div>

        <Footer />
      </Provider>
    </div>
  );
};

export default AppLayout;
