import { useState } from "react";
import qs from "qs";

import { baseURL } from "@/utils/request";

export enum ChatStatus {
    IDLE = "idle",
    PROCESSING = "processing",
    ERROR = "error",
    DONE = "done",
}

const useChatbot = () => {
    const [currentAiResponse, setCurrentAiResponse] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const [status, setStatus] = useState<ChatStatus>(ChatStatus.IDLE);

    const fetchChatStream = async ({ threadId, userQuery }: {
        threadId?: string;
        userQuery?: string;
    }) => {
        setCurrentAiResponse("");
        setError(null);
        setStatus(ChatStatus.IDLE);

        try {
            setLoading(true);
            setStatus(ChatStatus.PROCESSING);
            const params = {
                thread_id: threadId,
                user_query: userQuery,
            };

            const queryString = qs.stringify(params);
            const es = new EventSource(`${baseURL}chat?${queryString}`);

            es.onmessage = (e) => {
                try {
                    const eventData = JSON.parse(e.data);
                    if(eventData.chunk) {
                        setCurrentAiResponse((prev) => prev + eventData.chunk);
                    }
                } catch(parseError) {
                    console.error("Error parsing SSE data:", parseError);
                    setError(new Error("Error parsing SSE data"));
                    setStatus(ChatStatus.ERROR);
                }
            };

            es.onerror = (err) => {
                console.error("SSE error event:", err);
                setError(new Error("SSE connection error"));
                setStatus(ChatStatus.ERROR);
                es.close();
                setLoading(false);
            };

            es.addEventListener("done", () => {
                es.close();
                setLoading(false);
                setStatus(ChatStatus.DONE);
            });
        } catch(setupError) {
            console.error("Error setting up SSE connection:", setupError);
            setError(new Error("Failed to set up SSE connection"));
            setLoading(false);
            setStatus(ChatStatus.ERROR);
        }
    };

    return { currentAiResponse, loading, fetchChatStream, error, status };
};

export default useChatbot;