import { useState } from "react";
import { fetchEventSource } from '@microsoft/fetch-event-source';

import { baseURL } from "@/utils/request";
import { StreamBufferManager } from "@/lib/stream-buffer";

export enum ChatStatus {
    IDLE = "idle",
    PROCESSING = "processing",
    ERROR = "error",
    DONE = "done",
}

const requestUrl = `${baseURL}/chat-stream`;

// Create a unique key for source + task combination
const createSourceKey = (source: string, taskId?: string): string => {
    if (taskId) {
        return `${source}::${taskId}`;
    }
    return source; // For non-task-specific streams (supervisor, assessment, etc.)
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

    // Stream buffer manager for ordered segment handling
    const [bufferManager] = useState(() => new StreamBufferManager());

    // Pure states for thought chain data - now handles ALL sources (departments + HQ nodes)
    const [sourceTexts, setSourceTexts] = useState<Map<string, string>>(new Map());
    const [activeSources, setActiveSources] = useState<Set<string>>(new Set());
    const [completedSources, setCompletedSources] = useState<Set<string>>(new Set());

    // Handle thought chunks from ALL nodes - now using StreamBufferManager
    const handleThoughtChunk = (eventData: any) => {
        const { chunk, source, segment_id, task_id, type } = eventData;

        if(type === "thought") {
            const sourceKey = createSourceKey(source, task_id);

            // Add ALL sources to active list (departments AND HQ nodes)
            setActiveSources(prev => {
                if (!prev.has(sourceKey)) {
                    console.log(`🆕 Adding thought source: ${sourceKey}`);
                    return new Set(prev).add(sourceKey);
                }
                return prev;
            });

            // Use buffer manager to handle ordered segments for ALL sources
            const displayText = bufferManager.addSegment(sourceKey, segment_id, chunk);

            // Update source text content with buffered result
            setSourceTexts(prev => new Map(prev).set(sourceKey, displayText));
        }

        if(type === "thought_complete") {
            const sourceKey = createSourceKey(source, task_id);

            // Mark stream as complete in buffer manager
            bufferManager.markComplete(sourceKey);

            // Mark source as complete - using functional update
            setCompletedSources(prev => new Set(prev).add(sourceKey));
        }
    };

    // Reset thought chain states
    const resetThoughtChain = () => {
        // Reset buffer manager
        bufferManager.reset();

        // Reset React state
        setSourceTexts(new Map());
        setActiveSources(new Set());
        setCompletedSources(new Set());
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
        // Abort any existing connection first
        if (controller) {
            controller.abort();
            setController(null);
        }

        setCurrentAiResponse("");
        setError(null);
        setStatus(ChatStatus.IDLE);

        // Reset thought chain data at the start of new conversation
        resetThoughtChain();

        // Small delay to ensure state is reset properly
        await new Promise(resolve => setTimeout(resolve, 10));

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
                            // Use buffer manager for final output too (prevent out-of-order issues)
                            const finalResponseText = bufferManager.addSegment("final_output", eventData.segment_id, eventData.chunk);
                            setCurrentAiResponse(finalResponseText);

                        } else if(type === "final_output_complete") {
                            // Mark final response as complete - data layer
                            bufferManager.markComplete("final_output");

                            // Update UI immediately for user experience
                            updateLoading(false);
                            setStatus(ChatStatus.DONE);

                            // Trust backend to close connection naturally - prevents race conditions
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
        // Pure thought chain data exports (backward compatible names)
        departmentTexts: sourceTexts,
        activeDepartments: Array.from(activeSources),
        completedDepartments: Array.from(completedSources),
        resetThoughtChain,
        cancelChat,
        resetChat,
    };
};

export default useChatbot;