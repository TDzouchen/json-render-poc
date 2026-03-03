"use client";

import { useState, useRef } from "react";
import {
  Minus,
  Square,
  Power,
  Paperclip,
  Smile,
  Send,
  MessageCircle,
} from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: string;
  time: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Gen LLM Rich UI STG",
    sender: "ChatBot",
    time: "",
  },
  {
    id: 2,
    text: "Hello! Welcome to Talkdesk. How can I assist you today?",
    sender: "ChatBot",
    time: "04:11 PM",
  },
];

function BotAvatar() {
  return (
    <div className="shrink-0 w-8 h-8 rounded-full bg-[#5c2d91] flex items-center justify-center mt-0.5">
      <MessageCircle className="w-4 h-4 text-white" strokeWidth={2} />
    </div>
  );
}

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const now = () => {
    const d = new Date();
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    const hour = h % 12 || 12;
    return `${hour}:${m} ${ampm}`;
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: input, sender: "User", time: now() },
    ]);
    setInput("");
    setTimeout(
      () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 py-15 px-20">
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
              <div key={msg.id} className="flex items-start gap-2">
                <BotAvatar />
                <div className="flex flex-col gap-1 max-w-[80%]">
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {msg.text}
                    </p>
                  </div>
                  {msg.time && (
                    <p className="text-[11px] text-gray-400 pl-1">
                      ChatBot · {msg.time}
                    </p>
                  )}
                </div>
              </div>
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
            ),
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="shrink-0 bg-transparent mx-3 mb-3">
          <div className="flex items-end gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
            <textarea
              rows={1}
              className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent resize-none overflow-y-auto leading-relaxed"
              style={{ minHeight: "64px", maxHeight: "240px" }}
              placeholder="Type a message..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height =
                  Math.min(e.target.scrollHeight, 240) + "px";
              }}
              onKeyDown={(e) => {
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
                className="hover:text-gray-600 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
