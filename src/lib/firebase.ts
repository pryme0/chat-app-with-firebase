import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  doc,
  updateDoc,
  serverTimestamp,
  getDocs,
  arrayUnion,
  arrayRemove,
  getDoc,
  writeBatch,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Auth helpers
export const authHelpers = {
  async signUp(email: string, password: string, username: string) {
    try {
      // Step 1: Create user account

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Step 2: Update profile with username
      await updateProfile(user, { displayName: username });

      return { user, error: null };
    } catch (error: any) {
      console.error("❌ SignUp error:", error);

      // If user was created but Firestore failed, you might want to handle cleanup
      if (error.code && error.code.includes("firestore")) {
        console.error("Firestore error occurred after user creation");
      }

      return { user: null, error };
    }
  },

  async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update user online status
      await updateDoc(doc(db, "users", userCredential.user.uid), {
        isOnline: true,
        lastSeen: serverTimestamp(),
      });

      return { user: userCredential.user, error: null };
    } catch (error: any) {
      return { user: null, error };
    }
  },

  async signOut() {
    try {
      if (auth.currentUser) {
        // Update user offline status
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          isOnline: false,
          lastSeen: serverTimestamp(),
        });
      }
      await signOut(auth);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  onAuthStateChange(callback: (user: any) => void) {
    return onAuthStateChanged(auth, callback);
  },
};

// Chat helpers
export const chatHelpers = {
  // Create a new conversation (1-on-1 or group)
  async createConversation(
    participants: string[],
    isGroup: boolean = false,
    groupName?: string
  ) {
    try {
      const currentUserId = auth.currentUser?.uid;
      if (!currentUserId) throw new Error("User not authenticated");

      const conversationData = {
        participants,
        isGroup,
        groupName: isGroup ? groupName : null,
        createdAt: serverTimestamp(),
        createdBy: currentUserId,
        lastMessage: null,
        lastMessageTime: serverTimestamp(),
        receivers: isGroup
          ? participants.filter((id) => id !== currentUserId)
          : [participants.find((id) => id !== currentUserId)],
      };

      // Create the conversation
      const docRef = await addDoc(
        collection(db, "conversations"),
        conversationData
      );

      // Add typing status for each participant
      const typingStatusRef = collection(docRef, "typingStatus");

      const batch = writeBatch(db);
      participants.forEach((userId) => {
        const userTypingDocRef = doc(typingStatusRef, userId);
        batch.set(userTypingDocRef, { isTyping: false });
      });

      await batch.commit();

      return { conversationId: docRef.id, error: null };
    } catch (error: any) {
      return { conversationId: null, error };
    }
  },
  // Send a message
  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    messageType: "text" | "image" | "file" = "text"
  ) {
    try {
      const messageData = {
        conversationId,
        senderId,
        content,
        messageType,
        timestamp: serverTimestamp(),
        readBy: [senderId],
      };

      await addDoc(collection(db, "messages"), messageData);

      // Update conversation's last message
      await updateDoc(doc(db, "conversations", conversationId), {
        lastMessage: content,
        lastMessageTime: serverTimestamp(),
      });

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  // Listen to messages in a conversation
  subscribeToMessages(
    conversationId: string,
    callback: (messages: any[]) => void
  ) {
    const q = query(
      collection(db, "messages"),
      where("conversationId", "==", conversationId),
      orderBy("timestamp", "asc")
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(messages);
    });
  },

  // Listen to conversations for a user
  subscribeToConversations(
    userId: string,
    callback: (conversations: any[]) => void
  ) {
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", userId)
    );

    return onSnapshot(q, (snapshot) => {
      const conversations = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      callback(conversations);
    });
  },

  // Get all users (for creating conversations)
  async getAllUsers() {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return { users, error: null };
    } catch (error: any) {
      return { users: [], error };
    }
  },

  // Listen to user presence
  subscribeToUserPresence(callback: (users: any[]) => void) {
    return onSnapshot(collection(db, "users"), (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(users);
    });
  },

  // Mark message as read
  async markMessageAsRead(messageId: string, userId: string) {
    try {
      await updateDoc(doc(db, "messages", messageId), {
        readBy: arrayUnion(userId),
      });
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  // Add user to group
  async addUserToGroup(conversationId: string, userId: string) {
    try {
      await updateDoc(doc(db, "conversations", conversationId), {
        participants: arrayUnion(userId),
      });
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  // Remove user from group
  async removeUserFromGroup(conversationId: string, userId: string) {
    try {
      await updateDoc(doc(db, "conversations", conversationId), {
        participants: arrayRemove(userId),
      });
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

  async getUserById(uid: string) {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  },

  listenToTypingStatus(
    conversationId: string,
    currentUserId: string,
    setTypingUsers: (typingUsers: string[]) => void
  ) {
    const ref = collection(db, "conversations", conversationId, "typingStatus");
    return onSnapshot(ref, (snapshot) => {

      const typingUsers = snapshot.docs
        .filter(
          (doc) =>
            doc.data()?.userId === currentUserId &&
            doc.data()?.isTyping === true
        )
        .map((doc) => doc.id);

      console.log({ typingUsers });
      setTypingUsers(typingUsers);
    });
  },
  setTypingStatus(conversationId: string, userId: string, isTyping: boolean) {
    const typingDocRef = doc(
      db,
      "conversations",
      conversationId,
      "typingStatus",
      userId
    );

    if (isTyping) {
      return setDoc(typingDocRef, { isTyping: true, userId });
    } else {
      return deleteDoc(typingDocRef);
    }
  },
};
