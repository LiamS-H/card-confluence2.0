import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { FunctionCall, FunctionResponse } from "@google/genai";
export function FunctionCallCard({
    functionCall,
    functionResponse,
}: {
    functionCall: FunctionCall;
    functionResponse?: FunctionResponse | null;
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-black/10 dark:bg-white/10 p-3 rounded border font-mono text-xs">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 w-full text-left focus:outline-none focus:ring-1 focus:ring-blue-500 rounded"
            >
                {isExpanded ? (
                    <ChevronDown className="w-3 h-3 flex-shrink-0" />
                ) : (
                    <ChevronRight className="w-3 h-3 flex-shrink-0" />
                )}
                <span className="flex items-center gap-1">
                    🔧{" "}
                    <span className="font-semibold">{functionCall.name}</span>
                </span>
            </button>

            {isExpanded && (
                <div className="mt-2 pl-5 space-y-2">
                    {functionCall.args && (
                        <div>
                            <div className="text-gray-600 dark:text-gray-400 mb-1">
                                Arguments:
                            </div>
                            <pre className="bg-black/5 dark:bg-white/5 p-2 rounded text-xs overflow-x-auto">
                                {JSON.stringify(functionCall.args, null, 2)}
                            </pre>
                        </div>
                    )}

                    {functionResponse !== null && (
                        <div>
                            <div className="text-gray-600 dark:text-gray-400 mb-1">
                                Response:
                            </div>
                            <pre className="bg-black/5 dark:bg-white/5 p-2 rounded text-xs overflow-x-auto">
                                {functionResponse
                                    ? typeof functionResponse.response ===
                                      "string"
                                        ? functionResponse.response
                                        : JSON.stringify(
                                              functionResponse.response,
                                              null,
                                              2
                                          )
                                    : "loading..."}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
