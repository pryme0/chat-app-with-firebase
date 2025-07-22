import React, { useState } from "react";
import { User, Conversation } from "../../types";
import {
  MoreVertical,
  Phone,
  Video,
  Info,
  Users,
  UserPlus,
  UserMinus,
  Settings,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ChatHeaderProps {
  conversation: Conversation | null;
  participants: User[];
  users: User[];
  currentUserId: string;
  typingUsers: string[];
  onSignOut: () => void;
  onAddUserToGroup?: (userId: string) => void;
  onRemoveUserFromGroup?: (userId: string) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  participants,
  users,
  currentUserId,
  typingUsers,
  onSignOut,
  onAddUserToGroup,
  onRemoveUserFromGroup,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);

  if (!conversation) return null;

  const getConversationName = () => {
    if (conversation.isGroup) {
      return conversation.groupName || "Group Chat";
    }
    return participants.length > 0 ? participants[0].username : "Unknown User";
  };

  const getStatusText = () => {
    if (conversation.isGroup) {
      const onlineCount = participants.filter((p) => p.isOnline).length;
      return `${participants.length} members, ${onlineCount} online`;
    }

    const participant = participants[0];
    if (!participant) return "Unknown User";

    return participant.isOnline
      ? "Online"
      : `Last seen ${formatDistanceToNow(
          participant.lastSeen?.toDate() || new Date()
        )} ago`;
  };

  const availableUsers = users.filter(
    (user) =>
      !conversation.participants.includes(user.uid) &&
      user.uid !== currentUserId
  );

  const renderTypingStatus = () => {
    if (typingUsers.length === 0) return null;

    console.log({ typingUsers });

    const displayNames = typingUsers
      .map(
        (uid) => users.find((user) => user.uid === uid)?.username || "Someone"
      )
      .join(", ");

    return (
      <p className="text-sm text-blue-500 mt-0.5 italic">
        {displayNames} {typingUsers.length === 1 ? "is" : "are"} typing...
      </p>
    );
  };

  return (
    <div className="p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative">
            {conversation.isGroup ? (
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {getConversationName().charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {!conversation.isGroup &&
              participants.length > 0 &&
              participants[0].isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
          </div>

          <div className="ml-3">
            <h3 className="font-semibold text-gray-900">
              {getConversationName()}
            </h3>
            <p className="text-sm text-gray-500">{getStatusText()}</p>
            {renderTypingStatus()}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Info className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                {conversation.isGroup && (
                  <button
                    onClick={() => {
                      setShowGroupSettings(!showGroupSettings);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Group Settings
                  </button>
                )}
                <button
                  onClick={() => {
                    onSignOut();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Group Settings Modal */}
      {showGroupSettings && conversation.isGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Group Settings</h3>

            <div className="mb-4">
              <h4 className="font-medium mb-2">
                Members ({participants.length})
              </h4>
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div
                    key={participant.uid}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {participant.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="ml-2 text-sm">
                        {participant.username}
                      </span>
                    </div>
                    {onRemoveUserFromGroup && (
                      <button
                        onClick={() => onRemoveUserFromGroup(participant.uid)}
                        className="text-red-600 hover:bg-red-100 p-1 rounded"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {availableUsers.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Add Members</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableUsers.map((user) => (
                    <button
                      key={user.uid}
                      onClick={() =>
                        onAddUserToGroup && onAddUserToGroup(user.uid)
                      }
                      className="w-full flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="ml-2 text-sm">{user.username}</span>
                      <UserPlus className="w-4 h-4 ml-auto text-green-600" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGroupSettings(false)}
              className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
