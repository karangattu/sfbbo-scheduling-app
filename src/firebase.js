// firebase.js
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

const firebaseConfig = {
  // Replace with your actual Firebase config
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "your-api-key",
  authDomain:
    process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ||
    "your-project.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "your-app-id",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Firebase operations
export const firebaseOperations = {
  // Get all events
  getEvents: async () => {
    try {
      const eventsRef = collection(db, "events");
      const q = query(eventsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting events:", error);
      throw error;
    }
  },

  // Add new event
  addEvent: async (eventData) => {
    try {
      const eventsRef = collection(db, "events");
      const docRef = await addDoc(eventsRef, {
        ...eventData,
        attendees: [],
        createdAt: new Date().toISOString(),
      });
      return {
        id: docRef.id,
        ...eventData,
        attendees: [],
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error adding event:", error);
      throw error;
    }
  },

  // Update event (for signups)
  updateEvent: async (eventId, updates) => {
    try {
      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, updates);
      return { id: eventId, ...updates };
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  },

  // Delete event
  deleteEvent: async (eventId) => {
    try {
      const eventRef = doc(db, "events", eventId);
      await deleteDoc(eventRef);
      return eventId;
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },

  // Get notifications
  getNotifications: async () => {
    try {
      const notificationsRef = collection(db, "notifications");
      const q = query(notificationsRef, orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting notifications:", error);
      throw error;
    }
  },

  // Add notification
  addNotification: async (notificationData) => {
    try {
      const notificationsRef = collection(db, "notifications");
      const docRef = await addDoc(notificationsRef, {
        ...notificationData,
        timestamp: new Date().toISOString(),
      });
      return {
        id: docRef.id,
        ...notificationData,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error adding notification:", error);
      throw error;
    }
  },

  // Clear all notifications
  clearNotifications: async () => {
    try {
      const notificationsRef = collection(db, "notifications");
      const querySnapshot = await getDocs(notificationsRef);
      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Error clearing notifications:", error);
      throw error;
    }
  },

  // Listen to real-time updates for events
  onEventsChange: (callback) => {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, orderBy("createdAt", "desc"));
    return onSnapshot(q, (querySnapshot) => {
      const events = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(events);
    });
  },

  // Listen to real-time updates for notifications
  onNotificationsChange: (callback) => {
    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, orderBy("timestamp", "desc"));
    return onSnapshot(q, (querySnapshot) => {
      const notifications = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(notifications);
    });
  },
};

export { db };
