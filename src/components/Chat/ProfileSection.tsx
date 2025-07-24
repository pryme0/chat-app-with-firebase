import { useEffect, useState, ChangeEvent } from "react";
import { authHelpers } from "../../lib/firebase";

interface ProfileSectionProps {
  currentUserId: string;
}

interface UserProfile {
  username: string;
  avatar: string;
}

export const ProfileSection = ({ currentUserId }: ProfileSectionProps) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUserId) return;

      const user = await authHelpers.getUserById(currentUserId);

      if (user) {
        setUserProfile({
          username: user.username || "",
          avatar: user.avatar || "",
        });
        setUsernameInput(user.username || "");
      }
    };

    fetchUserProfile();
  }, [currentUserId]);

  const handleUsernameSave = async () => {
    if (!currentUserId || !usernameInput.trim()) return;

    await authHelpers.updateUsername(usernameInput.trim());
    setUserProfile((prev) =>
      prev ? { ...prev, username: usernameInput.trim() } : prev
    );
    setIsEditing(false);
  };

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !currentUserId) return;
    const file = e.target.files[0];

    try {
      setUploading(true);
      const newAvatarUrl = await authHelpers.updateAvatar(currentUserId, file);

      setUserProfile((prev) =>
        prev ? { ...prev, avatar: newAvatarUrl } : prev
      );
    } catch (err) {
      console.error("Error uploading avatar:", err);
    } finally {
      setUploading(false);
    }
  };

  if (!userProfile) return null;

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex flex-col items-center">
        <div className="w-20 h-20 rounded-full overflow-hidden mb-2 bg-gray-300">
          {userProfile.avatar ? (
            <img
              src={userProfile.avatar}
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-400" />
          )}
        </div>

        <label className="text-xs text-blue-600 cursor-pointer mb-2">
          {uploading ? "Uploading..." : "Change Avatar"}
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </label>

        {isEditing ? (
          <div className="w-full mt-2 flex flex-col items-center">
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="border border-gray-300 p-1 rounded text-sm w-full"
            />
            <button
              onClick={handleUsernameSave}
              className="text-sm mt-2 bg-blue-500 text-white py-1 px-3 rounded"
            >
              Save
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm font-semibold">{userProfile.username}</p>
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs mt-1 text-blue-500 underline"
            >
              Edit Profile
            </button>
          </>
        )}
      </div>
    </div>
  );
};
