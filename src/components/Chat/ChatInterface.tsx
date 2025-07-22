import React from "react";
import { ConversationList } from "./ConversationList";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ChatHeader } from "./ChatHeader";
import { useChat } from "../../hooks/useChat";
import { User } from "../../types";
import { MessageCircle } from "lucide-react";
import { chatHelpers } from "../../lib/firebase";

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
    const conversationId = await createConversation(
      participantIds,
      isGroup,
      groupName
    );
    if (conversationId) {
      selectConversation(conversationId);
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

  return (
    <div className="h-screen bg-gray-50 flex">
      <ConversationList
        conversations={conversations}
        users={users}
        selectedConversationId={selectedConversationId}
        onSelectConversation={selectConversation}
        onCreateConversation={handleCreateConversation}
        getConversationName={getConversationName}
        getConversationParticipants={getConversationParticipants}
        currentUserId={currentUser.uid}
      />

      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <ChatHeader
              conversation={selectedConversation}
              participants={selectedParticipants}
              users={users}
              currentUserId={currentUser.uid}
              onSignOut={onSignOut}
              onAddUserToGroup={handleAddUserToGroup}
              onRemoveUserFromGroup={handleRemoveUserFromGroup}
            />
            <MessageList
              messages={messages}
              users={users}
              currentUserId={currentUser.uid}
              isLoading={isLoading}
            />
            <MessageInput onSendMessage={sendMessage} disabled={isLoading} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome to Messages
              </h3>
              <p className="text-gray-500 max-w-sm">
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
