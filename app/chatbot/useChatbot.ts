import { useState } from "react";
import qs from "qs";
import { fetchEventSource } from '@microsoft/fetch-event-source';

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
    const [controller, setController] = useState<AbortController | null>(null);

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

            // const queryString = qs.stringify(params);
            // const es = new EventSource(`${baseURL}chat?${queryString}`);
            const ctrl = new AbortController();
            setController(ctrl);
            const url = `${baseURL}chat-test`;
            await fetchEventSource(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(params),
                signal: ctrl.signal,

                onopen: async (response) => {
                    console.log("SSE connection opened", response);
                    if(response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
                        return; // everything's good
                    } else {
                        throw new Error('Failed to open SSE connection');
                    }
                },

                onmessage(e) {
                    try {
                        const eventData = JSON.parse(e.data);
                        const msgType = eventData.type;
                        if(msgType === "final_output" && eventData.chunk) {
                            console.log("final_output", eventData.chunk);
                            setCurrentAiResponse((prev) => prev + eventData.chunk);
                        } else if(msgType === "done") {
                            setLoading(false);
                            setStatus(ChatStatus.DONE);
                            ctrl.abort();
                        }
                    } catch(parseError) {
                        console.error("Error parsing SSE data:", parseError);
                        setError(new Error("Error parsing SSE data"));
                        setStatus(ChatStatus.ERROR);
                    }
                },

                onerror(err) {
                    console.error("SSE error event:", err);
                    setError(new Error("SSE connection error"));
                    setStatus(ChatStatus.ERROR);
                    ctrl.abort();
                    setLoading(false);
                },

                onclose() {
                    console.log("SSE connection closed");
                    setLoading(false);
                    setStatus(ChatStatus.DONE);
                },
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