import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store/index";
import App from "./App";
import "./styles/global.css";
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:4040" : "");
axios.defaults.baseURL = API_URL;
ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}><App /></Provider>
);
