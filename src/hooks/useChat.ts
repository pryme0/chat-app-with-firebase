import { useState, useEffect, useCallback } from "react";
import { chatHelpers } from "../lib/firebase";
import { Conversation, Message, User } from "../types";

export const useChat = (currentUserId: string) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Subscribe to conversations
  useEffect(() => {
    if (!currentUserId) return;
    
    const unsubscribe = chatHelpers.subscribeToConversations(
      currentUserId,
      (conversationData) => {
        setConversations(conversationData);
      }
    );
    
    return () => unsubscribe();
  }, [currentUserId]);

  // Subscribe to messages for selected conversation
  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }
    
    const unsubscribe = chatHelpers.subscribeToMessages(
      selectedConversationId,
      (messageData) => {
        setMessages(messageData);
      }
    );
    
    return () => unsubscribe();
  }, [selectedConversationId]);

  // Subscribe to all users - FIXED: Moved async call inside useEffect
  useEffect(() => {
    if (!currentUserId) return;

    // Get initial users data
    const getInitialUsers = async () => {
      try {
        const usersData = await chatHelpers.getAllUsers();
        console.log({ users2: usersData });
        console.log({currentUserId})
        if (usersData.users) {
          setUsers(usersData.users.filter((user: User) => user.uid !== currentUserId));
        }
      } catch (error) {
        console.error("Error getting initial users:", error);
      }
    };

    getInitialUsers();

    // Subscribe to user presence updates
    const unsubscribe = chatHelpers.subscribeToUserPresence((userData) => {
      setUsers(userData.filter((user) => user.uid !== currentUserId));
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // FIXED: Use useCallback to prevent recreation on every render
  const sendMessage = useCallback(async (content: string) => {
    if (!selectedConversationId || !currentUserId) return;
    
    const { error } = await chatHelpers.sendMessage(
      selectedConversationId,
      currentUserId,
      content
    );
    
    if (error) {
      console.error("Error sending message:", error);
    }
  }, [selectedConversationId, currentUserId]);

  // FIXED: Use useCallback to prevent recreation on every render
  const createConversation = useCallback(async (
    participantIds: string[],
    isGroup: boolean = false,
    groupName?: string
  ) => {
    const allParticipants = [currentUserId, ...participantIds];
    const { conversationId, error } = await chatHelpers.createConversation(
      allParticipants,
      isGroup,
      groupName
    );
    
    if (error) {
      console.error("Error creating conversation:", error);
      return null;
    }
    
    return conversationId;
  }, [currentUserId]);

  // FIXED: Use useCallback to prevent recreation on every render
  const selectConversation = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId);
  }, []);

  // FIXED: Use useCallback to prevent recreation on every render
  const getConversationParticipants = useCallback((conversation: Conversation) => {
    return users.filter(
      (user) =>
        conversation.participants.includes(user.uid) &&
        user.uid !== currentUserId
    );
  }, [users, currentUserId]);

  // FIXED: Use useCallback to prevent recreation on every render
  const getConversationName = useCallback((conversation: Conversation) => {
    if (conversation.isGroup) {
      return conversation.groupName || "Group Chat";
    }
    
    const otherParticipants = users.filter(
      (user) =>
        conversation.participants.includes(user.uid) &&
        user.uid !== currentUserId
    );
    
    return otherParticipants.length > 0
      ? otherParticipants[0].username
      : "Unknown User";
  }, [users, currentUserId]);

  return {
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
  };
};