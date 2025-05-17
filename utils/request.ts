import axios from "axios";

export const baseURL = "http://127.0.0.1:8000/";

const request = axios.create({
    baseURL: "http://127.0.0.1:8000/",
    timeout: 1000000,
    headers: {
        "Content-Type": "application/json",
    },
});

export default request;
