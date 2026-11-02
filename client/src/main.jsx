import "./index.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./utils/AuthProvider";
import { SocketProvider } from "./utils/SocketProvider";
import App from "./App";

import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
