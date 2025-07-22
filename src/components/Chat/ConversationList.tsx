import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { User, Conversation } from "../../types";
import { MessageCircle, Search, Plus, Users, UserPlus } from "lucide-react";

interface ConversationListProps {
  conversations: Conversation[];
  users: User[];
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onCreateConversation: (
    participantIds: string[],
    isGroup?: boolean,
    groupName?: string
  ) => void;
  getConversationName: (conversation: Conversation) => string;
  getConversationParticipants: (conversation: Conversation) => User[];
  currentUserId: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  users,
  selectedConversationId,
  onSelectConversation,
  onCreateConversation,
  getConversationName,
  getConversationParticipants,
  currentUserId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showGroupCreation, setShowGroupCreation] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");

  console.log({ currentUserId });

  console.log({ users });

  console.log({selectedConversationId})

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log({ conversations });

  const filteredConversations = conversations.filter((conv) => {
    const name = getConversationName(conv);
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCreateGroup = async () => {
    if (selectedUsers.length < 2 || !groupName.trim()) return;

    await onCreateConversation(selectedUsers, true, groupName);
    setShowGroupCreation(false);
    setSelectedUsers([]);
    setGroupName("");
    setShowNewConversation(false);
  };

  const handleCreateDirectMessage = async (userId: string) => {
    await onCreateConversation([userId], false);
    setShowNewConversation(false);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => {
                setShowGroupCreation(false);
                setShowNewConversation(!showNewConversation);
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="New conversation"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                setShowNewConversation(false);
                setShowGroupCreation(!showGroupCreation);
              }}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Create group"
            >
              <Users className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Group Creation */}
        {showGroupCreation && (
          <div className="p-4 border-b border-gray-200 bg-green-50">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Create Group Chat
            </h3>

            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />

            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
              {filteredUsers.map((user) => (
                <button
                  key={user.uid}
                  onClick={() => toggleUserSelection(user.uid)}
                  className={`w-full flex items-center p-2 rounded-lg transition-colors ${
                    selectedUsers.includes(user.uid)
                      ? "bg-green-100 border border-green-300"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="ml-3 flex-1 text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user.username}
                    </p>
                  </div>
                  {selectedUsers.includes(user.uid) && (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleCreateGroup}
                disabled={selectedUsers.length < 2 || !groupName.trim()}
                className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Group ({selectedUsers.length})
              </button>
              <button
                onClick={() => {
                  setShowGroupCreation(false);
                  setSelectedUsers([]);
                  setGroupName("");
                }}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* New Direct Message */}
        {showNewConversation && !showGroupCreation && (
          <div className="p-4 border-b border-gray-200 bg-blue-50">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <UserPlus className="w-4 h-4 mr-2" />
              Start new conversation
            </h3>
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <button
                  key={user.uid}
                  onClick={() => handleCreateDirectMessage(user.uid)}
                  className="w-full flex items-center p-3 hover:bg-white rounded-lg transition-colors"
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {user.isOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="ml-3 flex-1 text-left">
                    <p className="font-medium text-gray-900">
                      {user.username}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="p-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No conversations yet</p>
              <p className="text-sm text-gray-400">
                Start a new conversation to begin messaging
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredConversations.map((conversation) => {
                const isSelected = selectedConversationId === conversation.id;
                const participants = getConversationParticipants(conversation);
                const conversationName = getConversationName(conversation);

                return (
                  <button
                    key={conversation.id}
                    onClick={() => onSelectConversation(conversation.id)}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      isSelected
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="relative">
                      {conversation.isGroup ? (
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {conversationName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {!conversation.isGroup &&
                        participants.length > 0 &&
                        participants[0].isOnline && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                        )}
                    </div>

                    <div className="ml-3 flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate flex items-center">
                          {conversationName}
                          {conversation.isGroup && (
                            <span className="ml-2 text-xs text-gray-500">
                              ({conversation.participants.length})
                            </span>
                          )}
                        </p>
                        {conversation.lastMessageTime && (
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(
                              conversation.lastMessageTime.toDate(),
                              {
                                addSuffix: true,
                              }
                            )}
                          </span>
                        )}
                      </div>

                      {conversation.lastMessage && (
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
