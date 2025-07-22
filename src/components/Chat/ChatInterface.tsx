import { MessageCircle } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useChat } from "../../hooks/useChat";
import { chatHelpers } from "../../lib/firebase";
import { User } from "../../types";
import { ChatHeader } from "./ChatHeader";
import { ConversationList } from "./ConversationList";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";

interface ChatInterfaceProps {
  currentUser: User;
  onSignOut: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  currentUser,
  onSignOut,
}) => {
  const {
    conversations,
    messages,
    users,
    selectedConversationId,
    isLoading,
    sendMessage,
    createConversation,
    selectConversation,
    getConversationParticipants,
    getConversationName,
  } = useChat(currentUser.uid);

  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [replyToMessage, setReplyToMessage] = useState<any>(null);

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );
  const selectedParticipants = selectedConversation
    ? getConversationParticipants(selectedConversation)
    : [];

  const handleCreateConversation = async (
    participantIds: string[],
    isGroup: boolean = false,
    groupName?: string
  ) => {
    const allNewParticipantIds = [...participantIds, currentUser.uid];

    const areSameParticipants = (a: string[], b: string[]) => {
      if (a.length !== b.length) return false;
      const setA = new Set(a);
      return b.every((id) => setA.has(id));
    };

    const matchingConversation = conversations.find((conv) => {
      const existingIds = conv.participants;
      return (
        areSameParticipants(existingIds, allNewParticipantIds) &&
        conv.isGroup === isGroup
      );
    });

    if (matchingConversation) {
      selectConversation(matchingConversation.id);
    } else {
      const conversationId = await createConversation(
        participantIds,
        isGroup,
        groupName
      );
      if (conversationId) {
        selectConversation(conversationId);
      }
    }
  };

  const handleAddUserToGroup = async (userId: string) => {
    if (!selectedConversationId) return;
    await chatHelpers.addUserToGroup(selectedConversationId, userId);
  };

  const handleRemoveUserFromGroup = async (userId: string) => {
    if (!selectedConversationId) return;
    await chatHelpers.removeUserFromGroup(selectedConversationId, userId);
  };

  useEffect(() => {
    if (!selectedConversationId || !currentUser.uid) return;

    const unsubscribe = chatHelpers.listenToTypingStatus(
      selectedConversationId,
      currentUser.uid,
      setTypingUsers
    );

    return () => unsubscribe();
  }, [selectedConversationId, currentUser.uid]);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleTyping = () => {
    if (!selectedConversationId) return;

    chatHelpers.setTypingStatus(selectedConversationId, currentUser.uid, true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      chatHelpers.setTypingStatus(
        selectedConversationId,
        currentUser.uid,
        false
      );
    }, 4000);
  };

  const handleSendMessage = async (
    content: string,
    replyTo?: {
      id: string;
      senderId: string;
      content: string;
      messageType: "text" | "image" | "file";
    }
  ) => {
    if (!selectedConversationId) return;

    console.log({ replyTo });

    await sendMessage(content, "text",replyTo &&  {
      messageId: replyTo?.id,
      senderId: replyTo?.senderId,
      content: replyTo?.content,
      messageType: replyTo?.messageType,
    });
    setReplyToMessage(null); // Clear reply after sending
  };

  return (
    <div className="h-screen flex flex-col sm:flex-row bg-gray-50">
      {/* Sidebar */}
      <div className="w-full sm:w-72 border-r border-gray-200 bg-white flex-shrink-0">
        <ConversationList
          conversations={conversations}
          users={users}
          selectedConversationId={selectedConversationId}
          onSelectConversation={selectConversation}
          onCreateConversation={handleCreateConversation}
          getConversationName={getConversationName}
          getConversationParticipants={getConversationParticipants}
          currentUserId={currentUser.uid}
          typingUsers={typingUsers}
        />
      </div>

      {/* Chat Pane */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedConversation ? (
          <>
            <div className="flex-shrink-0">
              <ChatHeader
                conversation={selectedConversation}
                participants={selectedParticipants}
                users={users}
                currentUserId={currentUser.uid}
                onSignOut={onSignOut}
                onAddUserToGroup={handleAddUserToGroup}
                onRemoveUserFromGroup={handleRemoveUserFromGroup}
                typingUsers={typingUsers}
              />
            </div>

            <div className="flex-1 overflow-y-auto">
              <MessageList
                messages={messages}
                users={users}
                currentUserId={currentUser.uid}
                isLoading={isLoading}
                onReply={setReplyToMessage}
              />
            </div>

            <div className="flex-shrink-0">
              <MessageInput
                handleTyping={handleTyping}
                onSendMessage={handleSendMessage}
                disabled={isLoading}
                replyTo={replyToMessage}
                onCancelReply={() => setReplyToMessage(null)}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to Messages
              </h3>
              <p className="text-gray-500">
                Select a conversation from the sidebar to start messaging, or
                create a new conversation to connect with someone.
              </p>
              <div className="mt-4 text-sm text-gray-400">
                <p>💬 Create direct messages with individuals</p>
                <p>👥 Create group chats with multiple people</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
