import React from "react";
import { createRoot } from "react-dom/client";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppContextProvider from "./context/Appcontext";
import App from "./App.jsx";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <AppContextProvider>
      <App />
    </AppContextProvider>
   
  </BrowserRouter>
);
