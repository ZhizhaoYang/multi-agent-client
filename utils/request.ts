import axios from "axios";

// Ensure baseURL doesn't have trailing slash to avoid double slashes
const getBaseURL = () => {
    const url = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    return url.endsWith('/') ? url.slice(0, -1) : url;
};

export const baseURL = getBaseURL();

const request = axios.create({
    baseURL: baseURL,
    timeout: 1000000,
    headers: {
        "Content-Type": "application/json",
    },
});

export default request;
