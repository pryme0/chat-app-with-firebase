import React, { useState } from "react";
import { Send, Paperclip, Smile, X } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string, replyTo?: any) => void;
  disabled?: boolean;
  handleTyping: () => void;
  replyTo?: any;
  onCancelReply?: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  handleTyping,
  replyTo,
  onCancelReply,
}) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), replyTo);
      setMessage("");
      if (onCancelReply) onCancelReply(); // Clear reply context after sending
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-3 border-t border-gray-200 bg-white">
      {/* Reply Preview */}
      {replyTo && (
        <div className="mb-2 px-4 py-2 bg-gray-100 border-l-4 border-blue-500 rounded-md relative">
          <div className="text-xs text-gray-500">Replying to:</div>
          <div className="text-sm text-gray-800 line-clamp-2">
            {replyTo.content}
          </div>
          <button
            onClick={onCancelReply}
            className="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-600"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap sm:flex-nowrap items-center gap-3"
      >
        {/* Attachment Button */}
        <button
          type="button"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Text Input */}
        <div className="flex-1 relative min-w-[70%] sm:min-w-0">
          <textarea
            value={message}
            onChange={(e) => {
              handleTyping();
              setMessage(e.target.value);
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            style={{ maxHeight: "120px" }}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};
