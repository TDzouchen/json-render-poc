"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Spec } from "@json-render/react";
import { useUIStream } from "@json-render/react";
import {
  Minus,
  Square,
  Power,
  Paperclip,
  Smile,
  Send,
  Loader2,
  MessageCircle,
} from "lucide-react";
import { SchemaRender } from "../lib/render/renderer";
import { Toaster } from "../components/ui/sonner";
import { toast } from "sonner";

interface Message {
  id: number;
  text?: string;
  sender: string;
  time: string;
  uiTree?: Spec | null;
  usageText?: string;
}

type UsageMeta = {
  __meta?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
};

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Design your UI by chatting with the bot. Try asking it to create a simple form, or a dashboard with charts!",
    sender: "ChatBot",
    time: "",
  },
];
// const initialMessages: Message[] = [
//   {
//     id: 1,
//     text: "Design your UI by chatting with the bot. Try asking it to create a simple form, or a dashboard with charts!",
//     sender: "ChatBot",
//     time: "",
//   },
//   {
//     id: 1772605151738,
//     text: "make a user card",
//     sender: "User",
//     time: "2:19 PM",
//   },
//   {
//     id: 1772605151739,
//     sender: "ChatBot",
//     time: "2:19 PM",
//     uiTree: {
//       root: "card",
//       elements: {
//         card: {
//           type: "Card",
//           props: {
//             maxWidth: "sm",
//             centered: true,
//           },
//           children: ["stack"],
//         },
//         stack: {
//           type: "Stack",
//           props: {
//             direction: "vertical",
//             gap: "md",
//             align: "center",
//           },
//           children: ["avatar", "name", "email", "role", "badge"],
//         },
//         badge: {
//           type: "Badge",
//           props: {
//             text: {
//               $state: "/user/status",
//             },
//             variant: {
//               $cond: {
//                 $state: "/user/status",
//               },
//               $then: "success",
//               $else: "default",
//             },
//           },
//           children: [],
//         },
//         role: {
//           type: "Text",
//           props: {
//             text: {
//               $state: "/user/role",
//             },
//             variant: "body",
//           },
//           children: [],
//         },
//         email: {
//           type: "Text",
//           props: {
//             text: {
//               $state: "/user/email",
//             },
//             variant: "muted",
//           },
//           children: [],
//         },
//         name: {
//           type: "Heading",
//           props: {
//             text: {
//               $state: "/user/name",
//             },
//             level: "h3",
//           },
//           children: [],
//         },
//         avatar: {
//           type: "Avatar",
//           props: {
//             name: {
//               $state: "/user/name",
//             },
//             size: "lg",
//           },
//           children: [],
//         },
//       },
//       state: {
//         user: {
//           name: "Alex Morgan",
//           email: "alex.morgan@example.com",
//           role: "Product Designer",
//           status: "Active",
//         },
//       },
//     },
//   },
//   {
//     id: 1772605189584,
//     text: "add form default is hidden",
//     sender: "User",
//     time: "2:19 PM",
//   },
//   {
//     id: 1772605189585,
//     sender: "ChatBot",
//     time: "2:19 PM",
//     uiTree: {
//       root: "card",
//       elements: {
//         card: {
//           type: "Card",
//           props: {
//             maxWidth: "sm",
//             centered: true,
//           },
//           children: ["stack", "edit-btn"],
//         },
//         "edit-btn": {
//           type: "Button",
//           props: {
//             label: "Edit Profile",
//             variant: "primary",
//           },
//           on: {
//             press: {
//               action: "setState",
//               params: {
//                 statePath: "/showForm",
//                 value: true,
//               },
//             },
//           },
//           children: [],
//         },
//         stack: {
//           type: "Stack",
//           props: {
//             direction: "vertical",
//             gap: "md",
//             align: "center",
//           },
//           children: ["avatar", "name", "email", "role", "badge"],
//         },
//         badge: {
//           type: "Badge",
//           props: {
//             text: {
//               $state: "/user/status",
//             },
//             variant: {
//               $cond: {
//                 $state: "/user/status",
//               },
//               $then: "success",
//               $else: "default",
//             },
//           },
//           children: [],
//         },
//         role: {
//           type: "Text",
//           props: {
//             text: {
//               $state: "/user/role",
//             },
//             variant: "body",
//           },
//           children: [],
//         },
//         email: {
//           type: "Text",
//           props: {
//             text: {
//               $state: "/user/email",
//             },
//             variant: "muted",
//           },
//           children: [],
//         },
//         name: {
//           type: "Heading",
//           props: {
//             text: {
//               $state: "/user/name",
//             },
//             level: "h3",
//           },
//           children: [],
//         },
//         avatar: {
//           type: "Avatar",
//           props: {
//             name: {
//               $state: "/user/name",
//             },
//             size: "lg",
//           },
//           children: [],
//         },
//       },
//       state: {
//         user: {
//           name: "Alex Morgan",
//           email: "alex.morgan@example.com",
//           role: "Product Designer",
//           status: "Active",
//         },
//         showForm: false,
//         form: {
//           name: "",
//           email: "",
//           role: "",
//         },
//       },
//     },
//   },
// ];

function toRenderableSpec(spec: Spec): Spec | null {
  if (!spec?.root || !spec.elements || !spec.elements[spec.root]) {
    return null;
  }

  const elements: Spec["elements"] = {};
  const visited = new Set<string>();
  const stack = [spec.root];

  while (stack.length > 0) {
    const key = stack.pop()!;
    if (visited.has(key)) continue;
    visited.add(key);

    const element = spec.elements[key];
    if (!element) continue;

    const validChildren = (element.children ?? []).filter(
      (child) => !!spec.elements[child]
    );

    elements[key] = {
      ...element,
      children: validChildren,
    };

    for (const child of validChildren) {
      stack.push(child);
    }
  }

  return {
    ...spec,
    elements,
  };
}

function getUsageTextFromRawLines(lines: string[]): string | undefined {
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index]?.trim();
    if (!line || !line.startsWith("{")) continue;

    try {
      const parsed = JSON.parse(line) as UsageMeta;
      if (parsed.__meta === "usage" && typeof parsed.totalTokens === "number") {
        return `${parsed.totalTokens.toLocaleString()} tokens`;
      }
    } catch {
      continue;
    }
  }

  return undefined;
}

function BotAvatar() {
  return (
    <div className="shrink-0 w-8 h-8 rounded-full bg-[#5c2d91] flex items-center justify-center mt-0.5">
      <MessageCircle className="w-4 h-4 text-white" strokeWidth={2} />
    </div>
  );
}

function BotLoadingBubble() {
  return (
    <div className="flex items-center gap-1.5 py-1 text-[#5c2d91]">
      <span className="text-sm font-medium animate-pulse">
        Generating UI...
      </span>
    </div>
  );
}

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingBotIdRef = useRef<number | null>(null);
  const currentTreeRef = useRef<Spec | null>(null);
  const hasCurrentStreamDataRef = useRef(false);
  const rawLinesBaselineRef = useRef(0);
  const isComposingRef = useRef(false);

  const {
    spec: apiSpec,
    isStreaming,
    rawLines,
    send,
    clear,
  } = useUIStream({
    api: "/api/generate",
    onError: (err: Error) => {
      const message = err.message || "Generation failed. Please try again.";
      toast.error(message);
      const pendingId = pendingBotIdRef.current;
      if (pendingId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === pendingId
              ? {
                  ...msg,
                  text: message,
                }
              : msg
          )
        );
      }
      pendingBotIdRef.current = null;
    },
  } as Parameters<typeof useUIStream>[0]);

  const now = () => {
    const d = new Date();
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  const handleUiStateChange = useCallback(
    (messageId: number, nextState: Record<string, unknown>) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId || !msg.uiTree) return msg;

          const nextTree: Spec = {
            ...msg.uiTree,
            state: nextState,
          };

          if (currentTreeRef.current?.root === msg.uiTree.root) {
            currentTreeRef.current = nextTree;
          }

          return {
            ...msg,
            uiTree: nextTree,
          };
        })
      );
    },
    []
  );

  const sendMessage = async () => {
    const prompt = input.trim();
    if (!prompt || isStreaming) return;

    const userMessageId = Date.now();
    const botMessageId = userMessageId + 1;

    rawLinesBaselineRef.current = rawLines.length;
    hasCurrentStreamDataRef.current = false;
    clear();
    pendingBotIdRef.current = botMessageId;

    setMessages((prev) => [
      ...prev,
      { id: userMessageId, text: prompt, sender: "User", time: now() },
      {
        id: botMessageId,
        text: "Generating UI...",
        sender: "ChatBot",
        time: now(),
      },
    ]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "64px";
    }

    try {
      await send(prompt, {
        previousSpec: currentTreeRef.current,
        history,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Generation failed. Please try again.";
      toast.error(message);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? {
                ...msg,
                text: message,
              }
            : msg
        )
      );
      pendingBotIdRef.current = null;
    }
  };

  console.log(">>> render", {
    messages,
    apiSpec,
    isStreaming,
    rawLines,
  });

  useEffect(() => {
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      50
    );
  }, [messages, isStreaming]);

  useEffect(() => {
    if (isStreaming && rawLines.length > rawLinesBaselineRef.current) {
      hasCurrentStreamDataRef.current = true;
    }
  }, [isStreaming, rawLines]);

  useEffect(() => {
    const pendingId = pendingBotIdRef.current;
    if (
      !pendingId ||
      !apiSpec?.root ||
      Object.keys(apiSpec.elements).length === 0
    ) {
      return;
    }

    const renderableSpec = toRenderableSpec(apiSpec);

    if (isStreaming && !hasCurrentStreamDataRef.current) {
      return;
    }

    if (!renderableSpec) {
      return;
    }

    currentTreeRef.current = renderableSpec;
    const usageText = !isStreaming
      ? getUsageTextFromRawLines(rawLines)
      : undefined;

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === pendingId
          ? {
              ...msg,
              text: isStreaming ? "Generating UI..." : undefined,
              uiTree: renderableSpec,
              usageText,
            }
          : msg
      )
    );

    if (!isStreaming) {
      pendingBotIdRef.current = null;
      hasCurrentStreamDataRef.current = false;
      rawLinesBaselineRef.current = 0;
    }
  }, [apiSpec, isStreaming, rawLines]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Widget container */}
      <div className="flex flex-col flex-1 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="shrink-0 bg-[#f0f0f0] px-4 py-4 flex items-center justify-between shadow-[0_2px_4px_rgba(0,0,0,0.08)] z-10">
          {/* Brand row */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5c2d91] flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-gray-900 font-semibold text-base leading-tight">
                Talkdesk
              </p>
              <p className="text-gray-700 text-xs">Powered by Talkdesk</p>
            </div>
          </div>

          {/* Window controls */}
          <div className="flex items-center gap-2">
            <button className="w-5 h-5 rounded-sm flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
              <Minus className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
            <button className="w-5 h-5 rounded-sm flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
              <Square className="w-3 h-3" strokeWidth={2.5} />
            </button>
            <button className="w-5 h-5 rounded-sm flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
              <Power className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto bg-[#f0f0f0] px-4 py-4 space-y-4">
          {messages.map((msg) =>
            msg.sender === "ChatBot" ? (
              (() => {
                const isCurrentGenerating =
                  isStreaming && pendingBotIdRef.current === msg.id;

                return (
                  <div key={msg.id} className="flex items-start gap-2">
                    <BotAvatar />
                    <div className="flex flex-col gap-1">
                      <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
                        {isCurrentGenerating ? (
                          <BotLoadingBubble />
                        ) : (
                          !!msg.text && (
                            <p className="text-sm text-gray-800 leading-relaxed">
                              {msg.text}
                            </p>
                          )
                        )}
                        {msg.uiTree && (
                          <div className="max-w-full min-w-40 overflow-auto">
                            <SchemaRender
                              uiTree={msg.uiTree}
                              onStateChange={(nextState) =>
                                handleUiStateChange(msg.id, nextState)
                              }
                            />
                          </div>
                        )}
                      </div>
                      {msg.time && (
                        <p className="text-[11px] text-gray-400 pl-1">
                          ChatBot · {msg.time}
                          {msg.usageText ? ` · ${msg.usageText}` : ""}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })()
            ) : (
              <div key={msg.id} className="flex items-end justify-end gap-2">
                <div className="flex flex-col items-end gap-1 max-w-[80%]">
                  <div className="bg-[#5c2d91] rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm">
                    <p className="text-sm text-white leading-relaxed">
                      {msg.text}
                    </p>
                  </div>
                  {msg.time && (
                    <p className="text-[11px] text-gray-400 pr-1">{msg.time}</p>
                  )}
                </div>
              </div>
            )
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="shrink-0 bg-transparent mx-3 mb-3">
          <div className="flex items-end gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
            <textarea
              ref={textareaRef}
              rows={1}
              className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent resize-none overflow-y-auto leading-relaxed"
              style={{ minHeight: "64px", maxHeight: "240px" }}
              placeholder="Type a message..."
              value={input}
              disabled={isStreaming}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 240) + "px";
              }}
              onKeyDown={(e) => {
                if (isStreaming) {
                  e.preventDefault();
                  return;
                }

                const nativeEvent = e.nativeEvent as KeyboardEvent;
                const isComposing =
                  isComposingRef.current ||
                  nativeEvent.isComposing ||
                  nativeEvent.keyCode === 229;

                if (isComposing) {
                  return;
                }

                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                  const t = e.currentTarget;
                  setTimeout(() => {
                    t.style.height = "auto";
                    t.style.height = "64px";
                  }, 0);
                }
              }}
              onCompositionStart={() => {
                isComposingRef.current = true;
              }}
              onCompositionEnd={() => {
                isComposingRef.current = false;
              }}
            />
            <div className="flex items-center gap-3 text-gray-400 pb-0.5">
              <button className="hover:text-gray-600 transition-colors">
                <Paperclip className="w-4 h-4" />
              </button>
              <button className="hover:text-gray-600 transition-colors">
                <Smile className="w-4 h-4" />
              </button>
              <button
                onClick={sendMessage}
                className="hover:text-gray-600 transition-colors disabled:opacity-50"
                disabled={isStreaming || !input.trim()}
              >
                {isStreaming ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
