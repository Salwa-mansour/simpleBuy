import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { CartProvider } from './context/CartProvider';

import App from "./App";
import "./css/index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
         <App/>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);