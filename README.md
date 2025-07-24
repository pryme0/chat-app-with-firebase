# Real-time Messaging Application with Firebase Backend

A modern real-time chat application built using React (Vite), TypeScript, and Firebase. This project demonstrates real-time communication, user management, and scalable architecture using Firebase services.

## 🚀 Features

### ✅ Core Functionality

- **User Authentication** – Email/password login with Firebase Auth
- **Real-time Messaging** – Send and receive messages instantly via Firestore listeners
- **One-on-One & Group Chats** – Support for private and group conversations
- **User Presence** – Track online/offline status and last seen
- **Persistent History** – Store messages and sync across sessions
- **Avatar Upload** – Upload profile pictures with Firebase Storage

### ⚙️ Advanced Features

- Message Read Receipts
- Group Management (Add/Remove members)
- Real-time Group Updates
- Responsive UI (Mobile & Desktop)
- Username Editing & Avatar Updating
- **Reply to Specific Messages** – Reply functionality with message context
- **Typing Indicators** – Real-time typing status notifications

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript (Vite)
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Realtime Sync:** Firestore listeners
- **File Uploads:** Firebase Storage
- **Styles:** Tailwind CSS / custom CSS

## 📦 Getting Started

### ⚙️ Prerequisites

- Node.js v18+ and yarn (npm will work as well)
- Firebase account and project

### 📁 Project Setup

1. **Clone Repository**

   ```bash
   git clone https://github.com/pryme0/chat-app-with-firebase.git
   cd chat-app-with-firebase
   yarn install
   ```

2. **Firebase Setup**
   - Create a Firebase project at <https://console.firebase.google.com>
   - Enable:
     - Authentication (Email/Password)
     - Firestore (Start in production mode)
     - Storage (Allow avatar uploads)
   - Go to Project Settings → Web App → Copy config

3. **Environment Configuration**

   Create a `.env` file in the root directory:

   ```bash
   cp .env.example .env
   ```

   Fill in your Firebase values:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

## 🔒 Security Rules

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Conversations
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in resource.data.participants;
      allow create: if request.auth != null &&
        request.auth.uid in request.resource.data.participants;
    }

    // Messages
    match /messages/{messageId} {
      allow read, write: if request.auth != null &&
        exists(/databases/$(database)/documents/conversations/$(resource.data.conversationId)) &&
        request.auth.uid in get(/databases/$(database)/documents/conversations/$(resource.data.conversationId)).data.participants;
    }
  }
}
```

### Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🧪 Run the App Locally

```bash
yarn dev
```

Then visit: <http://localhost:5173>

## 📚 How It Works

### 🔐 Authentication

- Firebase Auth handles sign-up/login
- User data is stored separately in a `users` Firestore collection
- Custom authHelpers handle Firestore updates (e.g. username, avatar)

### 💬 Chat System

- Messages and conversations are stored in Firestore
- Real-time updates via Firestore listeners
- Supports both individual and group chats

### 👤 Avatar Upload

- Avatars are uploaded to Firebase Storage at: `avatars/{uid}/filename`
- Old avatars are deleted before new ones are uploaded
- Download URL is saved to the users document

### 🔄 Presence Tracking

- Updates user `isOnline` and `lastSeen` in real time using Firestore

## 🧱 Database Structure

### 📘 users

```typescript
{
  uid: string;
  email: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  lastSeen: timestamp;
  createdAt: timestamp;
}
```

### 💬 conversations

```typescript
{
  id: string;
  participants: string[];
  isGroup: boolean;
  groupName?: string;
  createdAt: timestamp;
  lastMessage?: string;
  lastMessageTime: timestamp;
}
```

### 📨 messages

```typescript
{
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  messageType: "text" | "image";
  timestamp: timestamp;
  readBy: string[];
  replyTo?: {
    messageId: string;
    senderId: string;
    content: string;
    messageType: "text" | "image" | "file";
  }
}
```

## 🎯 Advanced Features Implementation

### 💬 Reply to Specific Messages

**Approach:**
Users can reply to specific messages by storing metadata within each message indicating the reply context. This metadata includes the original message ID, content, and sender ID.

**Key Implementation Details:**

- `replyTo` field added to the Message interface with original message context
- When replying, the UI captures the selected message and includes the `replyTo` data when sending the new message
- In the chat UI, replied messages are visually linked to the original message with a preview box or quote
- Clicking on a replied message scrolls to the original message (optional but supported for better UX)

### ⌨️ Typing Indicators

**Approach:**
Real-time typing indicators are implemented using a `typingStatus` subcollection under each conversation document in Firestore. When a user starts typing, we update a document inside this subcollection with their typing status.

**Key Implementation Details:**

- Each conversation has a `typingStatus` subcollection where each user's typing status is stored under their user ID
- When a user starts typing, their document in the `typingStatus` subcollection is updated to `{ isTyping: true }`
- Status resets to `{ isTyping: false }` after a delay (e.g., 2 seconds) of inactivity
- Typing updates are throttled or debounced to avoid excessive writes to Firestore
- Other participants subscribe to this subcollection and show a "User is typing..." message when any other participant's `isTyping` status is true

## 🧑‍💻 Contributing

Pull requests are welcome! Please follow coding standards and include relevant tests.

## 📝 License

MIT License. See LICENSE for more info.
