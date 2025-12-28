import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App.tsx";
import "./index.css";

// Ensure the root element exists before rendering
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found. Make sure there is a div with id 'root' in your HTML.");
}

// Create and render the React application
const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
