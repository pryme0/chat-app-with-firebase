# Real-time Messaging Application with Firebase

A modern, real-time messaging application built with React, TypeScript, and Firebase. This project demonstrates advanced backend development concepts including user authentication, real-time communication, group messaging, and scalable database design.

## Features

### Core Functionality
- **User Authentication**: Secure email/password registration and login with Firebase Auth
- **Real-time Messaging**: Instant message delivery using Firebase Firestore real-time listeners
- **Group Chat**: Create and manage group conversations with multiple participants
- **User Presence**: Online/offline status indicators and last seen timestamps
- **Message History**: Persistent message storage and retrieval
- **Conversation Management**: Create both one-on-one and group conversations

### Advanced Features
- **Group Management**: Add/remove users from group chats
- **Message Read Receipts**: Track message delivery and read status
- **User Search**: Find users and conversations quickly
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Real-time Updates**: Instant updates for new messages, user presence, and conversation changes

### Technical Highlights
- **Firebase Integration**: Complete Firebase ecosystem integration
- **Real-time Communication**: Firestore real-time listeners for instant updates
- **Type Safety**: Full TypeScript implementation with comprehensive type definitions
- **Modern UI/UX**: Clean, professional interface with smooth animations
- **Scalable Architecture**: Component-based design with clear separation of concerns

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase account and project

### Setup Instructions

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Firebase Setup**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication with Email/Password provider
   - Create a Firestore database in production mode
   - Copy your Firebase configuration

3. **Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration values:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Firestore Security Rules**
   Set up the following security rules in your Firestore database:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Users can read/write their own user document
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
         allow read: if request.auth != null;
       }
       
       // Conversations - users can only access conversations they're part of
       match /conversations/{conversationId} {
         allow read, write: if request.auth != null && 
           request.auth.uid in resource.data.participants;
         allow create: if request.auth != null && 
           request.auth.uid in request.resource.data.participants;
       }
       
       // Messages - users can only access messages in conversations they're part of
       match /messages/{messageId} {
         allow read, write: if request.auth != null && 
           exists(/databases/$(database)/documents/conversations/$(resource.data.conversationId)) &&
           request.auth.uid in get(/databases/$(database)/documents/conversations/$(resource.data.conversationId)).data.participants;
         allow create: if request.auth != null && 
           request.auth.uid == request.resource.data.senderId;
       }
     }
   }
   ```

5. **Run the Application**
   ```bash
   npm run dev
   ```

## Architecture Overview

### Frontend Architecture
- **React 18** with functional components and hooks
- **TypeScript** for type safety and better developer experience
- **Custom Hooks** for authentication and chat logic
- **Component-based Design** with clear separation of concerns

### Backend Integration
- **Firebase Auth** for user authentication and session management
- **Firestore** for real-time database with automatic synchronization
- **Real-time Listeners** for instant message delivery and presence updates
- **Security Rules** for data protection and access control

### Database Schema

#### Users Collection
```typescript
{
  uid: string;           // Firebase Auth UID
  email: string;         // User email
  username: string;      // Display username
  displayName: string;   // Full display name
  isOnline: boolean;     // Online status
  lastSeen: timestamp;   // Last activity timestamp
  createdAt: timestamp;  // Account creation time
}
```

#### Conversations Collection
```typescript
{
  participants: string[];    // Array of user UIDs
  isGroup: boolean;         // Whether it's a group chat
  groupName?: string;       // Group name (if group chat)
  lastMessage?: string;     // Last message content
  lastMessageTime: timestamp; // Last message timestamp
  createdAt: timestamp;     // Conversation creation time
}
```

#### Messages Collection
```typescript
{
  conversationId: string;   // Reference to conversation
  senderId: string;         // Message sender UID
  content: string;          // Message content
  messageType: string;      // 'text', 'image', or 'file'
  timestamp: timestamp;     // Message timestamp
  readBy: string[];         // Array of user UIDs who read the message
}
```

## Key Implementation Details

### Real-time Features
- **Firestore Listeners**: Real-time synchronization for messages and conversations
- **User Presence Tracking**: Automatic online/offline detection
- **Message Read Receipts**: Track message delivery and read status
- **Group Management**: Real-time updates for group membership changes

### Security Measures
- **Firebase Auth**: Secure user authentication with email/password
- **Firestore Security Rules**: Comprehensive rules to protect user data
- **Input Validation**: Client-side validation with server-side enforcement
- **Access Control**: Users can only access conversations they're part of

### Performance Optimizations
- **Efficient Queries**: Optimized Firestore queries with proper indexing
- **Real-time Subscriptions**: Automatic cleanup of listeners
- **Optimistic UI Updates**: Immediate feedback for better user experience
- **Lazy Loading**: Efficient loading of conversation history

## Code Quality

### Best Practices
- **Clean Architecture**: Single responsibility principle and modular design
- **TypeScript Types**: Comprehensive type definitions for all data structures
- **Error Handling**: Graceful error handling with user-friendly messages
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Accessibility**: Proper ARIA labels and keyboard navigation

### Testing Ready
- **Modular Components**: Easy to unit test individual components
- **Custom Hooks**: Isolated business logic for testing
- **Firebase Emulators**: Local development and testing environment
- **Type Safety**: Compile-time error detection

## Group Chat Features

### Creating Groups
- **Multi-user Selection**: Select multiple users to create a group
- **Custom Group Names**: Set meaningful names for group conversations
- **Minimum Participants**: Enforce minimum of 2 participants for groups

### Group Management
- **Add Members**: Dynamically add new users to existing groups
- **Remove Members**: Remove users from group conversations
- **Member List**: View all group participants with online status
- **Group Settings**: Dedicated interface for group administration

### Group Messaging
- **Sender Identification**: Clear indication of who sent each message
- **Participant Count**: Display number of members and online status
- **Group Icons**: Visual distinction between direct and group conversations

## Deployment

The application is ready for deployment on modern hosting platforms:
- **Firebase Hosting**: Seamless integration with Firebase services
- **Vercel/Netlify**: Static site deployment with environment variables
- **Docker**: Containerized deployment for any platform

## Future Enhancements

- **File Sharing**: Upload and share images, documents, and media
- **Message Search**: Full-text search across conversation history
- **Push Notifications**: Real-time notifications for new messages
- **Voice Messages**: Record and send audio messages
- **Video Calling**: Integrate WebRTC for voice and video calls
- **Message Reactions**: React to messages with emojis
- **Message Threading**: Reply to specific messages
- **Admin Roles**: Group admin permissions and moderation
- **Message Encryption**: End-to-end encryption for enhanced security

This project showcases professional-level backend development skills while providing a polished, production-ready messaging application with both individual and group communication capabilities.