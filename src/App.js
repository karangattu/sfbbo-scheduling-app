import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  Loader,
  X,
  Archive,
  ChevronDown,
  ChevronUp,
  MapPin,
  CalendarPlus,
  Moon,
  Sun,
} from "lucide-react";
import { AddToCalendarButton } from "add-to-calendar-button-react";
import { firebaseOperations } from "./firebase";
import sfbboLogo from "./sfbbo_logo.png";

// Toast component for confirmation messages
const Toast = ({ message, onClose }) => (
  <div
    role="status"
    aria-live="polite"
    className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded shadow-lg flex items-center gap-3 animate-fade-in"
  >
    <span>{message}</span>
    <button
      aria-label="Close notification"
      onClick={onClose}
      className="ml-4 text-white hover:text-gray-200 focus:outline-none"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
);

const EventApp = () => {
  const [events, setEvents] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showArchivedEvents, setShowArchivedEvents] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("sfbbo_dark_mode") === "true"
  );
  const [isAdmin, setIsAdmin] = useState(
    localStorage.getItem("sfbbo_admin") === "true"
  );
  const [adminCredentials, setAdminCredentials] = useState({
    username: "",
    password: "",
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    fromTime: "",
    toTime: "",
    location: "",
    maxAttendees: "",
    creatorName: "",
    category: "tabling",
  });
  const [toast, setToast] = useState(null);
  const [editEventId, setEditEventId] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Load initial data from Firebase with real-time updates
  useEffect(() => {
    setLoading(true);

    // Set up real-time listener for events only
    const unsubscribeEvents = firebaseOperations.onEventsChange(
      (eventsData) => {
        setEvents(eventsData);
        setLoading(false);
      }
    );

    // Cleanup function to unsubscribe from listener
    return () => {
      unsubscribeEvents();
    };
  }, []);

  // Helper function to create a local date from YYYY-MM-DD
  function getLocalDateFromString(dateString) {
    if (!dateString) return null;
    const [year, month, day] = dateString.split("-");
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  // Helper function to check if an event is in the past
  const isEventPast = (event) => {
    // Use local date construction for correct comparison
    const [toHour, toMinute] = event.toTime ? event.toTime.split(":") : ["0", "0"];
    const eventDate = getLocalDateFromString(event.date);
    if (!eventDate) return false;
    eventDate.setHours(Number(toHour), Number(toMinute));
    const now = new Date();
    return eventDate < now;
  };

  // Helper function to sort events by date and time
  const sortEventsByDateTime = (events) => {
    return events.sort((a, b) => {
      const [fromHourA, fromMinuteA] = a.fromTime ? a.fromTime.split(":") : ["0", "0"];
      const [fromHourB, fromMinuteB] = b.fromTime ? b.fromTime.split(":") : ["0", "0"];
      const dateA = getLocalDateFromString(a.date);
      const dateB = getLocalDateFromString(b.date);
      if (dateA) dateA.setHours(Number(fromHourA), Number(fromMinuteA));
      if (dateB) dateB.setHours(Number(fromHourB), Number(fromMinuteB));
      return dateA - dateB;
    });
  };

  // Admin login function
  const handleAdminLogin = () => {
    if (
      adminCredentials.username === "sfbbo" &&
      adminCredentials.password === "sfbaybirds"
    ) {
      setIsAdmin(true);
      localStorage.setItem("sfbbo_admin", "true");
      setShowAdminLogin(false);
      setAdminCredentials({ username: "", password: "" });
    } else {
      alert("Invalid credentials. Please try again.");
    }
  };

  // Admin logout function
  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("sfbbo_admin");
  };

  // Dark mode toggle function
  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem("sfbbo_dark_mode", newDarkMode.toString());
  };

  // Event categories
  const eventCategories = [
    { value: "tabling", label: "Tabling", color: "bg-blue-100 text-blue-800" },
    {
      value: "outreach",
      label: "Outreach",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "training",
      label: "Training",
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "meeting",
      label: "Meeting",
      color: "bg-orange-100 text-orange-800",
    },
    { value: "other", label: "Other", color: "bg-gray-100 text-gray-800" },
  ];

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) errors.title = "Event title is required";
    if (!formData.creatorName.trim())
      errors.creatorName = "Your name is required";
    if (!formData.date) errors.date = "Event date is required";
    if (!formData.fromTime) errors.fromTime = "Start time is required";
    if (!formData.toTime) errors.toTime = "End time is required";
    if (!formData.location.trim()) errors.location = "Location is required";
    if (!formData.description.trim())
      errors.description = "Description is required";

    // Check if start time is before end time
    if (
      formData.fromTime &&
      formData.toTime &&
      formData.fromTime >= formData.toTime
    ) {
      errors.toTime = "End time must be after start time";
    }

    // Check if date is not in the past
    if (formData.date) {
      const selectedDate = getLocalDateFromString(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        errors.date = "Event date cannot be in the past";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = getLocalDateFromString(dateString);
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to format time
  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Helper function to format date and time for calendar
  const formatDateTimeForCalendar = (dateString, timeString) => {
    const [year, month, day] = dateString.split("-");
    const [hours, minutes] = timeString.split(":");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // Categorize and sort events
  const categorizedEvents = () => {
    const upcomingEvents = [];
    const pastEvents = [];

    events.forEach((event) => {
      if (isEventPast(event)) {
        pastEvents.push(event);
      } else {
        upcomingEvents.push(event);
      }
    });

    return {
      upcoming: sortEventsByDateTime(upcomingEvents),
      past: sortEventsByDateTime(pastEvents).reverse(), // Most recent past events first
    };
  };

  // Helper to show toast
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const addEvent = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      const eventData = {
        ...formData,
        attendees: [],
        createdAt: new Date().toISOString(),
      };

      // Add event to Firebase (real-time listener will update local state)
      await firebaseOperations.addEvent(eventData);

      setFormData({
        title: "",
        description: "",
        date: "",
        fromTime: "",
        toTime: "",
        location: "",
        maxAttendees: "",
        creatorName: "",
        category: "tabling",
      });
      setFormErrors({});
      setShowAddForm(false);
      showToast("Event created successfully!");
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const signUpForEvent = async (eventId, attendeeName, attendeeEmail) => {
    if (!attendeeName.trim() || !attendeeEmail.trim()) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(attendeeEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      const event = events.find((e) => e.id === eventId);
      if (!event) return;

      // Check for duplicate signup
      const isDuplicate = event.attendees.some(
        (attendee) =>
          attendee.email.toLowerCase() === attendeeEmail.toLowerCase()
      );

      if (isDuplicate) {
        alert("This email address is already registered for this event.");
        return;
      }

      const newAttendee = {
        name: attendeeName,
        email: attendeeEmail,
        signedUpAt: new Date().toISOString(),
      };

      const updatedAttendees = [...event.attendees, newAttendee];

      // Update event in Firebase (real-time listener will update local state)
      await firebaseOperations.updateEvent(eventId, {
        attendees: updatedAttendees,
      });
      showToast("Signed up successfully!");
    } catch (error) {
      console.error("Error signing up for event:", error);
      alert("Failed to sign up. Please try again.");
    }
  };

  const removeAttendee = async (eventId, attendeeIndex, attendeeName) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${attendeeName} from this event?`
    );
    if (!confirmed) return;

    try {
      const event = events.find((e) => e.id === eventId);
      if (!event) return;

      const updatedAttendees = event.attendees.filter(
        (_, index) => index !== attendeeIndex
      );

      // Update event in Firebase (real-time listener will update local state)
      await firebaseOperations.updateEvent(eventId, {
        attendees: updatedAttendees,
      });
      showToast("Attendee removed.");
    } catch (error) {
      console.error("Error removing attendee:", error);
      alert("Failed to remove attendee. Please try again.");
    }
  };

  // Edit event handler
  const openEditModal = (event) => {
    setEditEventId(event.id);
    setEditFormData({ ...event });
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditEventId(null);
    setEditFormData(null);
  };

  const handleEditChange = (field, value) => {
    setEditFormData({ ...editFormData, [field]: value });
  };

  const saveEditedEvent = async () => {
    if (
      !editFormData.title.trim() ||
      !editFormData.creatorName.trim() ||
      !editFormData.date ||
      !editFormData.fromTime ||
      !editFormData.toTime ||
      !editFormData.location.trim() ||
      !editFormData.description.trim()
    ) {
      showToast("Please fill all required fields.");
      return;
    }
    if (editFormData.fromTime >= editFormData.toTime) {
      showToast("End time must be after start time.");
      return;
    }

    // Check if date is not in the past (optional - you may want to allow editing past events)
    const selectedDate = getLocalDateFromString(editFormData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      const confirmPastDate = window.confirm(
        "You are setting a date in the past. Are you sure you want to continue?"
      );
      if (!confirmPastDate) {
        return;
      }
    }

    try {
      // Remove id and any other Firestore-specific fields before updating
      const { id, ...updateData } = editFormData;

      // Handle maxAttendees field - convert empty string to null
      if (
        updateData.maxAttendees === "" ||
        updateData.maxAttendees === undefined
      ) {
        updateData.maxAttendees = null;
      } else if (updateData.maxAttendees) {
        updateData.maxAttendees = parseInt(updateData.maxAttendees);
      }

      await firebaseOperations.updateEvent(editEventId, updateData);
      showToast("Event updated successfully!");
      closeEditModal();
    } catch (error) {
      console.error("Error updating event:", error);
      showToast("Failed to update event. Please try again.");
    }
  };

  const deleteEvent = async (eventId, eventTitle) => {
    if (
      !window.confirm(
        `Are you sure you want to delete the event "${eventTitle}"? This cannot be undone.`
      )
    )
      return;
    try {
      await firebaseOperations.deleteEvent(eventId);
      showToast("Event deleted.");
    } catch (error) {
      alert("Failed to delete event.");
    }
  };

  const EventCard = ({ event }) => {
    const [signupName, setSignupName] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signingUp, setSigningUp] = useState(false);
    const [showAttendees, setShowAttendees] = useState(false);
    const isPast = isEventPast(event);
    const isEventFull =
      event.maxAttendees &&
      event.attendees.length >= parseInt(event.maxAttendees);
    const categoryInfo =
      eventCategories.find((cat) => cat.value === event.category) ||
      eventCategories[0];

    const handleSignUp = async () => {
      if (!signupName.trim() || !signupEmail.trim()) return;

      setSigningUp(true);
      await signUpForEvent(event.id, signupName, signupEmail);
      setSignupName("");
      setSignupEmail("");
      setSigningUp(false);
    };

    // Export attendees to CSV (only for admins)
    const exportAttendees = () => {
      if (event.attendees.length === 0 || !isAdmin) return;

      const csvContent = [
        ["Name", "Email", "Signed Up At"],
        ...event.attendees.map((attendee) => [
          attendee.name,
          attendee.email || "N/A",
          new Date(attendee.signedUpAt).toLocaleString(),
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${event.title}-attendees.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    };

    return (
      <div
        className={`rounded-lg shadow-md p-6 mb-4 border transition-all hover:shadow-lg ${
          isDarkMode
            ? isPast 
              ? "bg-gray-800 border-gray-600" 
              : "bg-gray-800 border-gray-700"
            : isPast 
              ? "bg-gray-50 border-gray-300" 
              : "bg-white border-gray-200"
        }`}
        role="region"
        aria-label={`Event card: ${event.title}`}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <h3
              className={`text-xl font-semibold transition-colors ${
                isPast 
                  ? isDarkMode ? "text-gray-400" : "text-gray-700"
                  : isDarkMode ? "text-white" : "text-gray-800"
              }`}
              tabIndex={0}
              aria-label={`Event title: ${event.title}`}
            >
              {event.title}
              {isPast && (
                <span className="ml-2 text-sm font-normal text-gray-600">
                  (Past Event)
                </span>
              )}
            </h3>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${categoryInfo.color}`}
              aria-label={`Category: ${categoryInfo.label}`}
            >
              {categoryInfo.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button
                  onClick={() => openEditModal(event)}
                  className="text-blue-500 hover:text-blue-700 bg-blue-50 rounded-full p-1 mr-1"
                  aria-label={`Edit event: ${event.title}`}
                  title="Edit event"
                >
                  <svg
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => deleteEvent(event.id, event.title)}
                  className="text-red-500 hover:text-red-700 bg-red-50 rounded-full p-1"
                  aria-label={`Delete event: ${event.title}`}
                  title="Delete event"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
            {event.attendees.length > 0 && isAdmin && (
              <button
                onClick={exportAttendees}
                className="text-gray-400 hover:text-blue-600 transition-colors"
                title="Export attendee list (Admin only)"
                aria-label="Export attendee list"
              >
                📊
              </button>
            )}
            <span
              className={`text-sm px-2 py-1 rounded ${
                isPast
                  ? "text-gray-700 bg-gray-200"
                  : "text-gray-700 bg-gray-200"
              }`}
              aria-label={
                isPast ? "Archived event" : `Created by ${event.creatorName}`
              }
            >
              {isPast ? "Archived" : `By ${event.creatorName}`}
            </span>
          </div>
        </div>

        <p className={`mb-4 transition-colors ${
          isPast 
            ? isDarkMode ? "text-gray-400" : "text-gray-700"
            : isDarkMode ? "text-gray-300" : "text-gray-700"
        }`}>
          {event.description}
        </p>

        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm transition-colors ${
            isPast 
              ? isDarkMode ? "text-gray-400" : "text-gray-700"
              : isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
          role="list"
          aria-label="Event details"
        >
          <div
            className="flex items-center"
            aria-label={`Date: ${formatDate(event.date)}`}
          >
            <Calendar
              className={`w-4 h-4 mr-2 ${
                isPast ? "text-gray-600" : "text-blue-500"
              }`}
            />
            <span>{formatDate(event.date)}</span>
          </div>
          <div
            className="flex items-center"
            aria-label={`Time: ${formatTime(event.fromTime)} to ${formatTime(
              event.toTime
            )}`}
          >
            <Clock
              className={`w-4 h-4 mr-2 ${
                isPast ? "text-gray-600" : "text-green-500"
              }`}
            />
            <span>
              {formatTime(event.fromTime)} - {formatTime(event.toTime)}
            </span>
          </div>
          <div
            className="flex items-center"
            aria-label={`Location: ${event.location}`}
          >
            <MapPin
              className={`w-4 h-4 mr-2 ${
                isPast ? "text-gray-600" : "text-purple-500"
              }`}
            />
            <span>{event.location}</span>
          </div>
        </div>

        {/* Add to Calendar Button */}
        {!isPast && (
          <div className="mb-4">
            <AddToCalendarButton
              name={event.title}
              description={event.description}
              startDate={event.date}
              startTime={event.fromTime}
              endTime={event.toTime}
              timeZone="America/Los_Angeles"
              location={event.location}
              options={['Apple', 'Google', 'iCal', 'Microsoft365', 'Outlook.com', 'Yahoo']}
              buttonStyle="3d"
              size="3"
              hideIconButton
              hideTextLabelButton={false}
              label="Add to Calendar"
              trigger="click"
              inline={false}
              listStyle="modal"
              iCalFileName={`sfbbo-${event.title.toLowerCase().replace(/\s+/g, '-')}`}
            />
          </div>
        )}

        <div
          className="flex items-center justify-between mb-4"
          aria-label="Attendee count"
        >
          <div
            className={`flex items-center text-sm transition-colors ${
              isPast 
                ? isDarkMode ? "text-gray-400" : "text-gray-700"
                : isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
            aria-label={`Attendees: ${event.attendees.length}${
              event.maxAttendees ? ` of ${event.maxAttendees}` : ""
            }`}
          >
            <Users
              className={`w-4 h-4 mr-2 ${
                isPast ? "text-gray-600" : "text-orange-500"
              }`}
            />
            <span className="font-medium">{event.attendees.length}</span>
            <span className="mx-1">signed up</span>
            {event.maxAttendees && (
              <>
                <span>/ {event.maxAttendees} max</span>
                <div
                  className={`ml-3 w-20 h-2 rounded-full ${
                    isPast ? "bg-gray-200" : "bg-gray-200"
                  }`}
                  aria-label="Attendee progress bar"
                >
                  <div
                    className={`h-full rounded-full transition-all ${
                      isPast
                        ? "bg-gray-600"
                        : isEventFull
                        ? "bg-red-500"
                        : event.attendees.length / event.maxAttendees > 0.8
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        (event.attendees.length / event.maxAttendees) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </>
            )}
          </div>
          {!isPast && isEventFull && (
            <span
              className="text-red-500 text-sm font-medium bg-red-50 px-2 py-1 rounded"
              aria-label="Event full"
            >
              Event Full
            </span>
          )}
        </div>

        {event.attendees.length > 0 && (
          <div className="mb-4" aria-label="Attendee list">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setShowAttendees(!showAttendees)}
                className={`flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition-colors ${
                  isPast 
                    ? isDarkMode ? "text-gray-400" : "text-gray-700"
                    : isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
                aria-label={`${showAttendees ? "Hide" : "Show"} attendees list`}
              >
                <span>Attendees ({event.attendees.length})</span>
                {showAttendees ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {isAdmin && (
                <span
                  className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded"
                  aria-label="Admin view"
                >
                  Admin View
                </span>
              )}
            </div>
            {showAttendees && (
              <div className="space-y-2">
                {event.attendees.map((attendee, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                      isPast 
                        ? isDarkMode ? "bg-gray-700" : "bg-gray-100"
                        : isDarkMode ? "bg-gray-700" : "bg-blue-50"
                    }`}
                    aria-label={`Attendee: ${attendee.name}${
                      isAdmin ? `, Email: ${attendee.email}` : ""
                    }`}
                  >
                    <div className="flex flex-col">
                      <span
                        className={`text-sm font-medium transition-colors ${
                          isPast 
                            ? isDarkMode ? "text-gray-300" : "text-gray-600"
                            : isDarkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {attendee.name}
                      </span>
                      {isAdmin && (
                        <span
                          className={`text-xs transition-colors ${
                            isPast 
                              ? isDarkMode ? "text-gray-400" : "text-gray-600"
                              : isDarkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          {attendee.email || "No email provided"}
                        </span>
                      )}
                    </div>
                    {!isPast && isAdmin && (
                      <button
                        onClick={() =>
                          removeAttendee(event.id, index, attendee.name)
                        }
                        className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1 transition-colors"
                        title={`Remove ${attendee.name} from event`}
                        aria-label={`Remove ${attendee.name} from event`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!isPast && !isEventFull && (
          <div className="space-y-3" aria-label="Signup form">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Enter your name"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  isDarkMode 
                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400" 
                    : "border-gray-300 bg-white text-gray-900"
                }`}
                aria-label="Your name"
              />
              <input
                type="email"
                placeholder="Enter your email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  isDarkMode 
                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400" 
                    : "border-gray-300 bg-white text-gray-900"
                }`}
                aria-label="Your email"
              />
            </div>
            <button
              onClick={handleSignUp}
              disabled={!signupName.trim() || !signupEmail.trim() || signingUp}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              aria-label="Sign up for event"
            >
              {signingUp && <Loader className="w-4 h-4 animate-spin" />}
              {signingUp ? "Signing Up..." : "Sign Up for Event"}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen p-4 transition-colors duration-200 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
      role="main"
      aria-label="SFBBO Event Signup App"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <img
              src={sfbboLogo}
              alt="SFBBO Logo"
              className="h-12 w-auto object-contain"
            />
            <h1 className={`text-2xl lg:text-3xl font-bold transition-colors ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}>
              SFBBO Tabling and Outreach Event Signup
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors ${
                isDarkMode
                  ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
              aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
              title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {isAdmin ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-white bg-green-600 px-3 py-1 rounded-full font-medium">
                  🔑 Admin
                </span>
                <button
                  onClick={handleAdminLogout}
                  className={`text-sm underline transition-colors ${
                    isDarkMode ? "text-gray-300 hover:text-red-400" : "text-gray-600 hover:text-red-600"
                  }`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAdminLogin(true)}
                className={`text-sm underline transition-colors ${
                  isDarkMode ? "text-gray-300 hover:text-blue-400" : "text-gray-600 hover:text-blue-600"
                }`}
              >
                Admin Login
              </button>
            )}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <CalendarPlus className="w-4 h-4" />
              Add Event
            </button>
          </div>
        </div>

        {/* Admin Login Modal */}
        {showAdminLogin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`rounded-lg p-6 w-full max-w-md mx-4 transition-colors ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}>
              <h2 className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}>Admin Login</h2>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={adminCredentials.username}
                    onChange={(e) =>
                      setAdminCredentials({
                        ...adminCredentials,
                        username: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      isDarkMode 
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={adminCredentials.password}
                    onChange={(e) =>
                      setAdminCredentials({
                        ...adminCredentials,
                        password: e.target.value,
                      })
                    }
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      isDarkMode 
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                    placeholder="Enter password"
                    onKeyPress={(e) => e.key === "Enter" && handleAdminLogin()}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAdminLogin}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setShowAdminLogin(false);
                      setAdminCredentials({ username: "", password: "" });
                    }}
                    className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Event Form */}
        {showAddForm && (
          <div className={`rounded-lg shadow-md p-6 mb-6 border transition-colors ${
            isDarkMode 
              ? "bg-gray-800 border-gray-700" 
              : "bg-white border-gray-200"
          }`}>
            <h2 className={`text-xl font-semibold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}>Create New Event</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Event Title *
                </label>
                <input
                  type="text"
                  placeholder="Enter event title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    formErrors.title 
                      ? "border-red-500" 
                      : isDarkMode 
                        ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400" 
                        : "border-gray-300 bg-white text-gray-900"
                  }`}
                  required
                />
                {formErrors.title && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.title}
                  </p>
                )}
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Event Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isDarkMode 
                      ? "border-gray-600 bg-gray-700 text-white" 
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                  required
                >
                  {eventCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Your Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={formData.creatorName}
                  onChange={(e) =>
                    setFormData({ ...formData, creatorName: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    formErrors.creatorName
                      ? "border-red-500"
                      : isDarkMode 
                        ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400" 
                        : "border-gray-300 bg-white text-gray-900"
                  }`}
                  required
                />
                {formErrors.creatorName && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.creatorName}
                  </p>
                )}
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Event Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    formErrors.date 
                      ? "border-red-500" 
                      : isDarkMode 
                        ? "border-gray-600 bg-gray-700 text-white" 
                        : "border-gray-300 bg-white text-gray-900"
                  }`}
                  required
                />
                {formErrors.date && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>
                )}
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Location *
                </label>
                <input
                  type="text"
                  placeholder="Enter event location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    formErrors.location 
                      ? "border-red-500" 
                      : isDarkMode 
                        ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400" 
                        : "border-gray-300 bg-white text-gray-900"
                  }`}
                  required
                />
                {formErrors.location && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.location}
                  </p>
                )}
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Start Time *
                </label>
                <input
                  type="time"
                  value={formData.fromTime}
                  onChange={(e) =>
                    setFormData({ ...formData, fromTime: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    formErrors.fromTime 
                      ? "border-red-500" 
                      : isDarkMode 
                        ? "border-gray-600 bg-gray-700 text-white" 
                        : "border-gray-300 bg-white text-gray-900"
                  }`}
                  required
                />
                {formErrors.fromTime && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.fromTime}
                  </p>
                )}
                <p className={`text-xs mt-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  Select when the event starts
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  End Time *
                </label>
                <input
                  type="time"
                  value={formData.toTime}
                  onChange={(e) =>
                    setFormData({ ...formData, toTime: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    formErrors.toTime 
                      ? "border-red-500" 
                      : isDarkMode 
                        ? "border-gray-600 bg-gray-700 text-white" 
                        : "border-gray-300 bg-white text-gray-900"
                  }`}
                  required
                />
                {formErrors.toTime && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.toTime}
                  </p>
                )}
                <p className={`text-xs mt-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  Select when the event ends
                </p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Max Attendees (Optional)
                </label>
                <input
                  type="number"
                  placeholder="Leave blank for unlimited"
                  value={formData.maxAttendees}
                  onChange={(e) =>
                    setFormData({ ...formData, maxAttendees: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    isDarkMode 
                      ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400" 
                      : "border-gray-300 bg-white text-gray-900"
                  }`}
                  min="1"
                />
              </div>
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>
                  Event Description *
                </label>
                <textarea
                  placeholder="Describe your event in detail"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none transition-colors ${
                    formErrors.description
                      ? "border-red-500"
                      : isDarkMode 
                        ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400" 
                        : "border-gray-300 bg-white text-gray-900"
                  }`}
                  required
                />
                {formErrors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.description}
                  </p>
                )}
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="button"
                  onClick={addEvent}
                  disabled={submitting}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting && <Loader className="w-4 h-4 animate-spin" />}
                  {submitting ? "Creating..." : "Create Event"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
            <span className={`ml-3 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}>Loading events...</span>
          </div>
        ) : (
          <div>
            {events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className={`w-16 h-16 mx-auto mb-4 ${
                  isDarkMode ? "text-gray-600" : "text-gray-300"
                }`} />
                <h3 className={`text-xl mb-2 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}>No events yet</h3>
                <p className={`${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}>
                  Create your first event to get started!
                </p>
              </div>
            ) : (
              <div>
                {/* Upcoming Events Section */}
                {categorizedEvents().upcoming.length > 0 && (
                  <div className="mb-8">
                    <h2 className={`text-2xl font-bold mb-6 flex items-center transition-colors ${
                      isDarkMode ? "text-white" : "text-gray-800"
                    }`}>
                      <Calendar className="w-6 h-6 mr-3 text-blue-500" />
                      Upcoming Events
                    </h2>
                    {categorizedEvents().upcoming.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                )}

                {/* Archived Events Section */}
                {categorizedEvents().past.length > 0 && (
                  <div>
                    <div className="mb-6">
                      <button
                        onClick={() =>
                          setShowArchivedEvents(!showArchivedEvents)
                        }
                        className={`flex items-center text-xl font-bold transition-colors ${
                          isDarkMode 
                            ? "text-gray-300 hover:text-white" 
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        <Archive className={`w-5 h-5 mr-3 ${
                          isDarkMode ? "text-gray-400" : "text-gray-600"
                        }`} />
                        Archived Events ({categorizedEvents().past.length})
                        {showArchivedEvents ? (
                          <ChevronUp className="w-5 h-5 ml-2" />
                        ) : (
                          <ChevronDown className="w-5 h-5 ml-2" />
                        )}
                      </button>
                    </div>

                    {showArchivedEvents && (
                      <div>
                        {categorizedEvents().past.map((event) => (
                          <EventCard key={event.id} event={event} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* No Events Message */}
                {categorizedEvents().upcoming.length === 0 &&
                  categorizedEvents().past.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl text-gray-700 mb-2">
                        No events yet
                      </h3>
                      <p className="text-gray-600">
                        Create your first event to get started!
                      </p>
                    </div>
                  )}
              </div>
            )}
          </div>
        )}
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}

        {/* Edit Event Modal */}
        {showEditModal && editFormData && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            role="dialog"
            aria-modal="true"
            aria-label="Edit Event Modal"
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
              <h2 className="text-xl font-bold mb-4">Edit Event</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => handleEditChange("title", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Category *
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) =>
                      handleEditChange("category", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {eventCategories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={editFormData.creatorName}
                    onChange={(e) =>
                      handleEditChange("creatorName", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    value={editFormData.date}
                    onChange={(e) => handleEditChange("date", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    value={editFormData.location}
                    onChange={(e) =>
                      handleEditChange("location", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={editFormData.fromTime}
                    onChange={(e) =>
                      handleEditChange("fromTime", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={editFormData.toTime}
                    onChange={(e) => handleEditChange("toTime", e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Attendees (Optional)
                  </label>
                  <input
                    type="number"
                    value={editFormData.maxAttendees}
                    onChange={(e) =>
                      handleEditChange("maxAttendees", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Description *
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) =>
                      handleEditChange("description", e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={saveEditedEvent}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  aria-label="Save changes"
                >
                  Save Changes
                </button>
                <button
                  onClick={closeEditModal}
                  className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                  aria-label="Cancel editing"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventApp;
