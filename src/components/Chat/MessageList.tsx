import React, { useEffect, useRef } from "react";
import { format } from "date-fns";
import { Message, User } from "../../types";
import { Check, CheckCheck, MessageCircle } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  users: User[];
  currentUserId: string;
  isLoading: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  users,
  currentUserId,
  isLoading,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getUserById = (userId: string) => {
    return users.find((user) => user.uid === userId);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-2">No messages yet</p>
          <p className="text-sm text-gray-400">
            Send your first message to start the conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4">
      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === currentUserId;
        const sender = getUserById(message.senderId);
        const showTimestamp =
          index === 0 ||
          (message.timestamp &&
            messages[index - 1].timestamp &&
            message.timestamp.toDate().getTime() -
              messages[index - 1].timestamp.toDate().getTime() >
              300000); // 5 minutes

        return (
          <div key={message.id} className="space-y-2">
            {showTimestamp && (
              <div className="text-center">
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {message.timestamp &&
                    format(message.timestamp.toDate(), "MMM d, yyyy h:mm a")}
                </span>
              </div>
            )}

            <div
              className={`flex ${
                isCurrentUser ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] md:max-w-md ${
                  isCurrentUser ? "order-2" : "order-1"
                }`}
              >
                {!isCurrentUser && (
                  <div className="flex items-center mb-1">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs font-medium">
                        {sender?.username?.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 font-medium truncate">
                      {sender?.username || "Unknown User"}
                    </span>
                  </div>
                )}

                <div
                  className={`px-4 py-2 rounded-2xl break-words ${
                    isCurrentUser
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>

                  <div
                    className={`flex items-center justify-end mt-1 space-x-1 ${
                      isCurrentUser ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    <span className="text-xs">
                      {message.timestamp &&
                        format(message.timestamp.toDate(), "h:mm a")}
                    </span>

                    {isCurrentUser && (
                      <div className="flex items-center">
                        {message.readBy && message.readBy.length > 1 ? (
                          <CheckCheck className="w-3 h-3" />
                        ) : (
                          <Check className="w-3 h-3" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
