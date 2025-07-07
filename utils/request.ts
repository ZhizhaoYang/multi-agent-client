import axios from "axios";

export const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const request = axios.create({
    baseURL: baseURL,
    timeout: 1000000,
    headers: {
        "Content-Type": "application/json",
    },
});

export default request;
