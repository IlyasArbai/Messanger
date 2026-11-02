import { Routes, Route, BrowserRouter } from "react-router-dom";

import ProtectedRoute from "./utils/ProtectedRoute";
import GuestRoute from "./utils/GuestRoute";

import Nav from "./components/Nav";
import Home from "./pages/Home";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Conversations from "./pages/Conversations";
import Requests from "./pages/Requests";

import NotFound from "./pages/NotFound";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <>
      <Nav />

      <ToastContainer
        position="top-right"
        autoClose={4000}
        newestOnTop
        theme="light"
      />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/conversations" element={<Conversations />} />
          <Route path="/requests" element={<Requests />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
