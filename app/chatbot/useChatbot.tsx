import { useState } from "react";
import { fetchEventSource } from '@microsoft/fetch-event-source';

import { baseURL } from "@/utils/request";

export enum ChatStatus {
    IDLE = "idle",
    PROCESSING = "processing",
    ERROR = "error",
    DONE = "done",
}

const requestUrl = `${baseURL}chat-test`;

// Helper function to insert character at specific position
const insertCharAtPosition = (currentText: string, newChar: string, position: number): string => {
    const textArray = currentText.split('');

    // Extend array if needed (handle out-of-order arrival)
    while(textArray.length < position) {
        textArray.push('');
    }

    // Insert character at correct position (1-indexed to 0-indexed)
    textArray[position - 1] = newChar;

    return textArray.join('');
};

const useChatbot = () => {
    const [currentAiResponse, setCurrentAiResponse] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    // Reset loading state properly
    const updateLoading = (value: boolean) => {
        setLoading(value);
    };

    const [status, setStatus] = useState<ChatStatus>(ChatStatus.IDLE);
    const [controller, setController] = useState<AbortController | null>(null);

    // Pure states for thought chain data
    const [departmentTexts, setDepartmentTexts] = useState<Map<string, string>>(new Map());
    const [activeDepartments, setActiveDepartments] = useState<Set<string>>(new Set());
    const [completedDepartments, setCompletedDepartments] = useState<Set<string>>(new Set());

                // Handle thought chunks from departments
    const handleThoughtChunk = (eventData: any) => {
        const { chunk, source, segment_id, type } = eventData;

        if(type === "thought") {
            // Add department to active list if new
            if(!activeDepartments.has(source)) {
                setActiveDepartments(prev => new Set(prev).add(source));
            }

            // Update department text content
            setDepartmentTexts(prev => {
                const currentText = prev.get(source) || "";
                const updatedText = insertCharAtPosition(currentText, chunk, segment_id);
                return new Map(prev).set(source, updatedText);
            });
        }

        if(type === "thought_complete") {
            setCompletedDepartments(prev => new Set(prev).add(source));
        }
    };

    // Reset thought chain states
    const resetThoughtChain = () => {
        setDepartmentTexts(new Map());
        setActiveDepartments(new Set());
        setCompletedDepartments(new Set());
    };

    // Cancel current chat and reset everything
    const cancelChat = () => {
        // Abort the current SSE connection if it exists
        if (controller) {
            controller.abort();
            setController(null);
        }

        // Reset all states to initial values
        setCurrentAiResponse("");
        updateLoading(false);
        setError(null);
        setStatus(ChatStatus.IDLE);

        // Reset thought chain data
        resetThoughtChain();
    };

    // Reset all chat data for new conversation
    const resetChat = () => {
        // Abort any ongoing SSE connection
        if (controller) {
            controller.abort();
            setController(null);
        }

        // Reset all states to initial values
        setCurrentAiResponse("");
        updateLoading(false);
        setError(null);
        setStatus(ChatStatus.IDLE);

        // Reset thought chain data
        resetThoughtChain();
    };

    const fetchChatStream = async ({ threadId, userQuery }: {
        threadId?: string;
        userQuery?: string;
    }) => {
        setCurrentAiResponse("");
        setError(null);
        setStatus(ChatStatus.IDLE);
        resetThoughtChain(); // Reset thought chain data for new conversation

        try {
            updateLoading(true);
            setStatus(ChatStatus.PROCESSING);
            const params = {
                thread_id: threadId,
                user_query: userQuery,
            };

            const ctrl = new AbortController();
            setController(ctrl);

            await fetchEventSource(requestUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(params),
                signal: ctrl.signal,

                onopen: async (response) => {
                    console.log("SSE connection opened", response);
                    if(response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
                        return;
                    } else {
                        throw new Error('Failed to open SSE connection');
                    }
                },

                onmessage(e) {
                    try {
                        const eventData = JSON.parse(e.data);
                        const type = eventData.type;

                        if(type === "thought" || type === "thought_complete") {
                            handleThoughtChunk(eventData);

                        } else if(type === "final_output" && eventData.chunk) {
                            // console.log("final_output", eventData.chunk);
                            setCurrentAiResponse((prev) => prev + eventData.chunk);

                        } else if(type === "done" || type === "final_output_complete") {
                            updateLoading(false);
                            setStatus(ChatStatus.DONE);
                            ctrl.abort();
                        }
                    } catch(parseError) {
                        console.error("Error parsing SSE data:", parseError);
                        setError(new Error("Error parsing SSE data"));
                        setStatus(ChatStatus.ERROR);
                        updateLoading(false);
                    }
                },

                onerror(err) {
                    console.error("SSE error event:", err);
                    setError(new Error("SSE connection error"));
                    setStatus(ChatStatus.ERROR);
                    ctrl.abort();
                    updateLoading(false);
                },

                onclose() {
                    updateLoading(false);
                    setStatus(ChatStatus.DONE);
                },
            });
        } catch(setupError) {
            console.error("Error setting up SSE connection:", setupError);
            setError(new Error("Failed to set up SSE connection"));
            updateLoading(false);
            setStatus(ChatStatus.ERROR);
        }
    };

    return {
        currentAiResponse,
        loading,
        fetchChatStream,
        error,
        status,
        // Pure thought chain data exports
        departmentTexts,
        activeDepartments: Array.from(activeDepartments),
        completedDepartments: Array.from(completedDepartments),
        resetThoughtChain,
        cancelChat,
        resetChat,
    };
};

export default useChatbot;