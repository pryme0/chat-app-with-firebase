export interface User {
  id: string;
  uid: string;
  email: string;
  username: string;
  displayName: string;
  isOnline: boolean;
  lastSeen: any;
  createdAt: any;
  avatar?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: "text" | "image" | "file";
  timestamp: any;
  replyTo?: {
    messageId: string;
    senderId: string;
    content: string;
    messageType: "text" | "image" | "file";
  };
}

export interface Conversation {
  id: string;
  participants: string[];
  isGroup: boolean;
  groupName?: string;
  lastMessage?: string;
  lastMessageTime: any;
  createdAt: any;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface ChatState {
  conversations: Conversation[];
  messages: Message[];
  users: User[];
  selectedConversationId: string | null;
  isLoading: boolean;
}