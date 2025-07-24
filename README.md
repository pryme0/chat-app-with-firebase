# Real-time Messaging Application with Firebase backend

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

## 🛠️ Tech Stack

- **Frontend:** React + TypeScript (Vite)
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Realtime Sync:** Firestore listeners
- **File Uploads:** Firebase Storage
- **Styles:** Tailwind CSS / custom CSS

## 📦 Getting Started

### ⚙️ Prerequisites

- Node.js v18+ and npm
- Firebase account and project

### 📁 Project Setup

1. **Clone Repository**

   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   npm install
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
npm run dev
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

## 📦 Deployment

### Options

- **Firebase Hosting**
  - Great for full integration
  - Use `firebase deploy`
  
- **Netlify / Vercel**
  - Static hosting for Vite apps
  
- **Docker**
  - Containerized deployment (optional)

## 📌 Future Enhancements

- ✅ Avatar Uploading (with deletion of old)
- ⏳ File Sharing
- ⏳ Typing Indicators
- ⏳ Push Notifications
- ⏳ Dark Mode
- ⏳ Video/Audio Messaging

## 🧑‍💻 Contributing

Pull requests are welcome! Please follow coding standards and include relevant tests.

## 📝 License

MIT License. See LICENSE for more info.
