import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { User, Conversation } from "../../types";
import { MessageCircle, Search, Plus, Users, Menu, X } from "lucide-react";

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
  typingUsers: string[];
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
  typingUsers,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showGroupCreation, setShowGroupCreation] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [groupName, setGroupName] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // new

  const filteredUsers = users.filter(
    (user) =>
      user.uid !== currentUserId &&
      (user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredConversations = conversations.filter((conv) => {
    const name = getConversationName(conv);
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCreateGroup = async () => {
    if (selectedUsers.length < 2 || !groupName.trim()) return;
    await onCreateConversation(selectedUsers, true, groupName);
    resetCreationUI();
  };

  const handleCreateDirectMessage = async (userId: string) => {
    await onCreateConversation([userId], false);
    resetCreationUI();
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const getTypingText = (): string | null => {
    const typing = typingUsers.filter((uid) => uid !== currentUserId);
    const typingUsernames = typing
      .map((id) => users.find((u) => u.uid === id)?.username)
      .filter(Boolean);

    if (typingUsernames.length === 0) return null;
    if (typingUsernames.length === 1)
      return `${typingUsernames[0]} is typing...`;
    return `${typingUsernames.join(", ")} are typing...`;
  };

  const resetCreationUI = () => {
    setShowNewConversation(false);
    setShowGroupCreation(false);
    setGroupName("");
    setSelectedUsers([]);
    setIsSidebarOpen(false); // hide drawer on selection (mobile)
  };

  return (
    <>
      {/* Mobile toggle button */}
      <div className="sm:hidden p-2 border-b border-gray-200 bg-white flex justify-between items-center">
        <h2 className="text-lg font-semibold">Messages</h2>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-gray-600"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar container */}
      <div
        className={`
          fixed inset-0 z-40 sm:static sm:z-auto
          transition-transform transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          sm:translate-x-0
          w-80 max-w-full h-full bg-white border-r border-gray-200 flex flex-col
        `}
      >
        {/* Mobile close button */}
        <div className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Messages</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top section */}
        <div className="p-4 border-b border-gray-200 hidden sm:block">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
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

          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Conditional conversation/group creation */}
          {showNewConversation && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-1">
                Start conversation with:
              </p>
              <ul className="space-y-1 max-h-48 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <li key={user.uid}>
                    <button
                      onClick={() => handleCreateDirectMessage(user.uid)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 text-sm text-gray-800"
                    >
                      {user.username}{" "}
                      <span className="text-gray-400">({user.email})</span>
                    </button>
                  </li>
                ))}
                {filteredUsers.length === 0 && (
                  <li className="text-sm text-gray-400 px-3 py-2">
                    No users found
                  </li>
                )}
              </ul>
            </div>
          )}

          {showGroupCreation && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-1">Create group:</p>
              <input
                type="text"
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-lg text-sm"
              />
              <ul className="space-y-1 max-h-40 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <li key={user.uid}>
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.uid)}
                        onChange={() => toggleUserSelection(user.uid)}
                      />
                      <span>{user.username}</span>
                    </label>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleCreateGroup}
                disabled={selectedUsers.length < 2 || !groupName.trim()}
                className="mt-2 w-full px-3 py-2 bg-green-600 text-white rounded-lg text-sm disabled:opacity-50"
              >
                Create Group
              </button>
            </div>
          )}
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto p-2">
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
                const showTyping = conversation.id === selectedConversationId;
                const typingText = showTyping ? getTypingText() : null;

                return (
                  <button
                    key={conversation.id}
                    onClick={() => {
                      onSelectConversation(conversation.id);
                      setIsSidebarOpen(false); // close drawer on mobile
                    }}
                    className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                      isSelected
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="relative shrink-0">
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

                    <div className="ml-3 flex-1 min-w-0 text-left">
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
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatDistanceToNow(
                              conversation.lastMessageTime.toDate(),
                              { addSuffix: true }
                            )}
                          </span>
                        )}
                      </div>

                      {typingText ? (
                        <p className="text-sm text-blue-500 italic truncate">
                          {typingText}
                        </p>
                      ) : (
                        conversation.lastMessage && (
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage}
                          </p>
                        )
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
