import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  ClipboardCheck,
  BarChart3,
  UserCheck,
  Baby,
  Mail,
  Edit,
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
  const [showMetricsModal, setShowMetricsModal] = useState(false);
  const [metricsEventId, setMetricsEventId] = useState(null);
  const [metricsData, setMetricsData] = useState({
    adultAttendees: "",
    childAttendees: "",
    newsletterSignups: "",
    notes: "",
  });

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
  const isEventPast = useCallback((event) => {
    // Use local date construction for correct comparison
    const [toHour, toMinute] = event.toTime ? event.toTime.split(":") : ["0", "0"];
    const eventDate = getLocalDateFromString(event.date);
    if (!eventDate) return false;
    eventDate.setHours(Number(toHour), Number(toMinute));
    const now = new Date();
    return eventDate < now;
  }, []);

  // Helper function to sort events by date and time
  const sortEventsByDateTime = useCallback((events) => {
    return events.sort((a, b) => {
      const [fromHourA, fromMinuteA] = a.fromTime ? a.fromTime.split(":") : ["0", "0"];
      const [fromHourB, fromMinuteB] = b.fromTime ? b.fromTime.split(":") : ["0", "0"];
      const dateA = getLocalDateFromString(a.date);
      const dateB = getLocalDateFromString(b.date);
      if (dateA) dateA.setHours(Number(fromHourA), Number(fromMinuteA));
      if (dateB) dateB.setHours(Number(fromHourB), Number(fromMinuteB));
      return dateA - dateB;
    });
  }, []);

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
    {
      value: "tabling",
      label: "Tabling",
      color: "bg-blue-100 text-blue-800",
      darkColor: "bg-blue-500/20 text-blue-200",
      gradient: "from-blue-500/80 via-blue-400/40 to-blue-500/5",
    },
    {
      value: "outreach",
      label: "Outreach",
      color: "bg-green-100 text-green-800",
      darkColor: "bg-emerald-500/20 text-emerald-200",
      gradient: "from-emerald-500/80 via-emerald-400/40 to-emerald-500/5",
    },
    {
      value: "training",
      label: "Training",
      color: "bg-purple-100 text-purple-800",
      darkColor: "bg-purple-500/20 text-purple-200",
      gradient: "from-purple-500/80 via-purple-400/40 to-purple-500/5",
    },
    {
      value: "meeting",
      label: "Meeting",
      color: "bg-orange-100 text-orange-800",
      darkColor: "bg-orange-500/20 text-orange-200",
      gradient: "from-orange-500/80 via-orange-400/40 to-orange-500/5",
    },
    {
      value: "other",
      label: "Other",
      color: "bg-gray-100 text-gray-800",
      darkColor: "bg-slate-500/20 text-slate-200",
      gradient: "from-slate-500/70 via-slate-400/30 to-slate-500/5",
    },
  ];

  const onboardingSteps = [
    {
      title: "Browse available opportunities",
      description:
        "Review upcoming tabling, outreach, training, and meeting events. Each card highlights key details like time, location, and capacity.",
      icon: Calendar,
    },
    {
      title: "Reserve your spot in seconds",
      description:
        "Enter your name and email to join the attendee list. You will receive a calendar link instantly so the event stays on your radar.",
      icon: Users,
    },
    {
      title: "Coordinate smoothly with the team",
      description:
        "Admins can edit events, track attendees, and export rosters. Volunteers can check back anytime for updates or new opportunities.",
      icon: ClipboardCheck,
    },
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
  const categorizedEvents = useCallback(() => {
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
  }, [events, isEventPast, sortEventsByDateTime]);

  // Helper to show toast
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const categorized = useMemo(() => categorizedEvents(), [events, categorizedEvents]);
  const upcomingEvents = categorized.upcoming;
  const pastEvents = categorized.past;

  const totalAttendees = useMemo(
    () =>
      events.reduce((acc, event) => acc + (event.attendees?.length || 0), 0),
    [events]
  );

  const uniqueVolunteers = useMemo(() => {
    const emailSet = new Set();
    events.forEach((event) => {
      event.attendees?.forEach((attendee) => {
        if (attendee.email) {
          emailSet.add(attendee.email.toLowerCase());
        }
      });
    });
    return emailSet.size;
  }, [events]);

  const totalCapacity = useMemo(
    () =>
      events.reduce(
        (acc, event) =>
          acc + (event.maxAttendees ? parseInt(event.maxAttendees) : 0),
        0
      ),
    [events]
  );

  const remainingSpots =
    totalCapacity > 0 ? Math.max(totalCapacity - totalAttendees, 0) : null;

  const statsHighlights = [
    {
      label: "Upcoming events",
      value: upcomingEvents.length,
      caption:
        pastEvents.length > 0
          ? `${pastEvents.length} archived listings`
          : "New opportunities added often",
      icon: Calendar,
    },
    {
      label: "Volunteer RSVPs",
      value: totalAttendees,
      caption:
        uniqueVolunteers > 0
          ? `${uniqueVolunteers} unique volunteers`
          : "Be the first to sign up",
      icon: Users,
    },
    {
      label: remainingSpots !== null ? "Spots remaining" : "Active listings",
      value: remainingSpots !== null ? remainingSpots : events.length,
      caption:
        remainingSpots !== null
          ? `${totalCapacity} total capacity`
          : "Across all categories",
      icon: ClipboardCheck,
    },
  ];

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

  const signUpForEvent = async (eventId, attendeeName, attendeeEmail, shiftPreference = "full") => {
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
        shiftPreference: shiftPreference,
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

  // Metrics modal handlers
  const openMetricsModal = (event) => {
    setMetricsEventId(event.id);
    setMetricsData({
      adultAttendees: event.postEventMetrics?.adultAttendees || "",
      childAttendees: event.postEventMetrics?.childAttendees || "",
      newsletterSignups: event.postEventMetrics?.newsletterSignups || "",
      notes: event.postEventMetrics?.notes || "",
    });
    setShowMetricsModal(true);
  };

  const closeMetricsModal = () => {
    setShowMetricsModal(false);
    setMetricsEventId(null);
    setMetricsData({
      adultAttendees: "",
      childAttendees: "",
      newsletterSignups: "",
      notes: "",
    });
  };

  const saveEventMetrics = async () => {
    if (!metricsEventId) return;

    const metrics = {
      adultAttendees: parseInt(metricsData.adultAttendees) || 0,
      childAttendees: parseInt(metricsData.childAttendees) || 0,
      newsletterSignups: parseInt(metricsData.newsletterSignups) || 0,
      notes: metricsData.notes.trim(),
    };

    try {
      await firebaseOperations.updateEventMetrics(metricsEventId, metrics);
      showToast("Event metrics saved successfully");
      closeMetricsModal();
    } catch (error) {
      console.error("Failed to save metrics:", error);
      showToast("Failed to save metrics. Please try again.");
    }
  };

  const EventCard = ({ event }) => {
    const [signupName, setSignupName] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [shiftPreference, setShiftPreference] = useState("full");
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
      await signUpForEvent(event.id, signupName, signupEmail, shiftPreference);
      setSignupName("");
      setSignupEmail("");
      setShiftPreference("full");
      setSigningUp(false);
    };

    return (
      <article
        className={`rounded-lg border transition-colors ${
          isDarkMode
            ? isPast
              ? "bg-gray-900/30 border-gray-800"
              : "bg-gray-900/50 border-gray-800 hover:border-gray-700"
            : isPast
            ? "bg-gray-50 border-gray-200"
            : "bg-white border-gray-300 hover:border-gray-400"
        }`}
        role="region"
        aria-label={`Event card: ${event.title}`}
      >
        <div className="p-5 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className={`text-lg font-semibold ${
                    isPast
                      ? isDarkMode
                        ? "text-gray-400"
                        : "text-gray-500"
                      : isDarkMode
                      ? "text-white"
                      : "text-gray-900"
                  }`}
                  tabIndex={0}
                  aria-label={`Event title: ${event.title}`}
                >
                  {event.title}
                </h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    isDarkMode
                      ? "bg-gray-800 text-gray-400"
                      : "bg-gray-100 text-gray-600"
                  }`}
                  aria-label={`Category: ${categoryInfo.label}`}
                >
                  {categoryInfo.label}
                </span>
                {isPast && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      isDarkMode
                        ? "bg-gray-800 text-gray-400"
                        : "bg-gray-100 text-gray-600"
                    }`}
                    aria-label="Past event"
                  >
                    Past
                  </span>
                )}
              </div>
              <div
                className={`text-sm flex flex-wrap items-center gap-x-3 gap-y-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <span>{event.creatorName}</span>
                <span>•</span>
                <span>
                  {event.attendees.length} signed up
                </span>
                {event.maxAttendees && (
                  <>
                    <span>•</span>
                    <span>{event.maxAttendees} max</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isAdmin && (
                <div className="flex items-center gap-1">
                  {isPast && (
                    <button
                      onClick={() => openMetricsModal(event)}
                      className={`p-2 rounded transition-colors ${
                        isDarkMode
                          ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                          : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                      aria-label="Add metrics"
                      title="Add post-event metrics"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(event)}
                    className={`p-2 rounded transition-colors ${
                      isDarkMode
                        ? "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                    aria-label="Edit event"
                    title="Edit event"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteEvent(event.id, event.title)}
                    className={`p-2 rounded transition-colors ${
                      isDarkMode
                        ? "text-gray-400 hover:text-red-400 hover:bg-gray-800"
                        : "text-gray-500 hover:text-red-600 hover:bg-gray-100"
                    }`}
                    aria-label="Delete event"
                    title="Delete event"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {event.description && (
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-600"
              }`}
            >
              {event.description}
            </p>
          )}

          <div
            className={`flex flex-wrap items-center gap-x-4 gap-y-2 text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
            role="list"
            aria-label="Event details"
          >
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(event.date)}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {formatTime(event.fromTime)} – {formatTime(event.toTime)}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {event.location}
            </span>
          </div>

          {!isPast && (
            <div className="flex items-center gap-3">
              <AddToCalendarButton
                name={event.title}
                description={event.description}
                startDate={event.date}
                startTime={event.fromTime}
                endTime={event.toTime}
                timeZone="America/Los_Angeles"
                location={event.location}
                options={["Apple", "Google", "iCal", "Microsoft365", "Outlook.com", "Yahoo"]}
                buttonStyle="round"
                size="3"
                hideIconButton
                hideTextLabelButton={false}
                label="Add to Calendar"
                trigger="click"
                inline={false}
                listStyle="modal"
                iCalFileName={`sfbbo-${event.title
                  .toLowerCase()
                  .replace(/\s+/g, "-")}`}
              />
            </div>
          )}

          {event.attendees.length > 0 && (
            <div aria-label="Attendee list">
              <button
                onClick={() => setShowAttendees(!showAttendees)}
                className={`inline-flex items-center gap-2 text-sm font-medium transition-colors ${
                  isDarkMode
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                aria-label={`${showAttendees ? "Hide" : "Show"} attendees list`}
              >
                <span>View {event.attendees.length} volunteer{event.attendees.length === 1 ? "" : "s"}</span>
                {showAttendees ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {showAttendees && (
                <div className="mt-3 space-y-2">
                  {event.attendees.map((attendee, index) => {
                    const shiftLabel = attendee.shiftPreference === "first-half" 
                      ? "First Half" 
                      : attendee.shiftPreference === "second-half" 
                      ? "Second Half" 
                      : "Full Shift";
                    const shiftBadgeColor = attendee.shiftPreference === "full"
                      ? isDarkMode ? "bg-green-500/20 text-green-300" : "bg-green-100 text-green-700"
                      : isDarkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-700";
                    
                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between px-3 py-2 text-sm ${
                          isDarkMode ? "text-gray-300" : "text-gray-700"
                        }`}
                        aria-label={`Attendee: ${attendee.name}, Shift: ${shiftLabel}`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{attendee.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded ${shiftBadgeColor}`}>
                            {shiftLabel}
                          </span>
                          {isAdmin && attendee.email && (
                            <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                              ({attendee.email})
                            </span>
                          )}
                        </div>
                        {!isPast && isAdmin && (
                          <button
                            onClick={() =>
                              removeAttendee(event.id, index, attendee.name)
                            }
                            className={`p-1 rounded transition-colors ${
                              isDarkMode
                                ? "text-gray-500 hover:text-red-400"
                                : "text-gray-400 hover:text-red-600"
                            }`}
                            title={`Remove ${attendee.name}`}
                            aria-label={`Remove ${attendee.name}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {isPast && event.postEventMetrics && (
            <div
              className={`rounded-2xl border px-4 py-4 sm:px-6 sm:py-5 ${
                isDarkMode
                  ? "border-green-500/30 bg-green-500/10"
                  : "border-green-200 bg-green-50"
              }`}
              aria-label="Post-event metrics"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className={`w-5 h-5 ${isDarkMode ? "text-green-300" : "text-green-600"}`} />
                  <h4 className={`font-semibold text-sm ${isDarkMode ? "text-green-100" : "text-green-800"}`}>
                    Post-Event Metrics
                  </h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className={`text-center rounded-xl px-3 py-2 ${
                    isDarkMode ? "bg-green-900/30" : "bg-white"
                  }`}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <UserCheck className="w-4 h-4" />
                      <span className={`text-xs font-medium ${
                        isDarkMode ? "text-green-200" : "text-green-700"
                      }`}>Adults</span>
                    </div>
                    <div className={`text-lg font-bold ${
                      isDarkMode ? "text-green-100" : "text-green-800"
                    }`}>
                      {event.postEventMetrics.adultAttendees}
                    </div>
                  </div>
                  <div className={`text-center rounded-xl px-3 py-2 ${
                    isDarkMode ? "bg-green-900/30" : "bg-white"
                  }`}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Baby className="w-4 h-4" />
                      <span className={`text-xs font-medium ${
                        isDarkMode ? "text-green-200" : "text-green-700"
                      }`}>Kids</span>
                    </div>
                    <div className={`text-lg font-bold ${
                      isDarkMode ? "text-green-100" : "text-green-800"
                    }`}>
                      {event.postEventMetrics.childAttendees}
                    </div>
                  </div>
                  <div className={`text-center rounded-xl px-3 py-2 ${
                    isDarkMode ? "bg-green-900/30" : "bg-white"
                  }`}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Mail className="w-4 h-4" />
                      <span className={`text-xs font-medium ${
                        isDarkMode ? "text-green-200" : "text-green-700"
                      }`}>Newsletter</span>
                    </div>
                    <div className={`text-lg font-bold ${
                      isDarkMode ? "text-green-100" : "text-green-800"
                    }`}>
                      {event.postEventMetrics.newsletterSignups}
                    </div>
                  </div>
                </div>
                {event.postEventMetrics.notes && (
                  <div className={`rounded-xl px-3 py-2 ${
                    isDarkMode ? "bg-green-900/30" : "bg-white"
                  }`}>
                    <div className={`text-xs font-medium mb-1 ${
                      isDarkMode ? "text-green-200" : "text-green-700"
                    }`}>
                      Notes:
                    </div>
                    <div className={`text-sm ${
                      isDarkMode ? "text-green-100" : "text-green-800"
                    }`}>
                      {event.postEventMetrics.notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isPast && !isEventFull && (
            <div className={`rounded-lg border p-4 ${
              isDarkMode ? "border-gray-800 bg-gray-900/30" : "border-gray-300 bg-gray-50"
            }`} aria-label="Signup form">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <input
                      type="text"
                      placeholder="Your full name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className={`flex-1 rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                        isDarkMode
                          ? "border-gray-600 bg-gray-800/80 text-white placeholder-gray-400"
                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                      }`}
                      aria-label="Your name"
                    />
                    <input
                      type="email"
                      placeholder="name@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className={`flex-1 rounded-xl border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                        isDarkMode
                          ? "border-gray-600 bg-gray-800/80 text-white placeholder-gray-400"
                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                      }`}
                      aria-label="Your email"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      Shift preference
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setShiftPreference("first-half")}
                        className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                          shiftPreference === "first-half"
                            ? isDarkMode
                              ? "bg-blue-500 text-white ring-2 ring-blue-400"
                              : "bg-blue-600 text-white ring-2 ring-blue-500"
                            : isDarkMode
                            ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                        }`}
                        aria-label="Select first half shift"
                      >
                        First Half
                      </button>
                      <button
                        type="button"
                        onClick={() => setShiftPreference("second-half")}
                        className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                          shiftPreference === "second-half"
                            ? isDarkMode
                              ? "bg-blue-500 text-white ring-2 ring-blue-400"
                              : "bg-blue-600 text-white ring-2 ring-blue-500"
                            : isDarkMode
                            ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                        }`}
                        aria-label="Select second half shift"
                      >
                        Second Half
                      </button>
                      <button
                        type="button"
                        onClick={() => setShiftPreference("full")}
                        className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                          shiftPreference === "full"
                            ? isDarkMode
                              ? "bg-blue-500 text-white ring-2 ring-blue-400"
                              : "bg-blue-600 text-white ring-2 ring-blue-500"
                            : isDarkMode
                            ? "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-600"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                        }`}
                        aria-label="Select full shift"
                      >
                        Full Shift
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleSignUp}
                    disabled={!signupName.trim() || !signupEmail.trim() || signingUp}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                      isDarkMode
                        ? "bg-blue-500 text-white hover:bg-blue-400 disabled:bg-gray-600"
                        : "bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-300"
                    } disabled:cursor-not-allowed`}
                    aria-label="Sign up for event"
                  >
                    {signingUp && <Loader className="w-4 h-4 animate-spin" />}
                    {signingUp ? "Signing you up..." : "Reserve my spot"}
                  </button>
                  <p
                    className={`text-xs ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    We’ll share event updates with the email you provide. Your
                    information stays with SFBBO.
                  </p>
                </div>
            </div>
          )}
        </div>
      </article>
    );
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${
        isDarkMode ? "bg-gray-950" : "bg-slate-50"
      }`}
      role="main"
      aria-label="SFBBO Event Signup App"
    >
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        <header
          className={`border-b pb-6 ${
            isDarkMode
              ? "border-gray-800"
              : "border-gray-200"
          }`}
        >
          <div className="space-y-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={sfbboLogo}
                  alt="SFBBO Logo"
                  className="h-12 w-12 object-contain"
                />
                <div className="space-y-1">
                  <h1
                    className={`text-2xl font-bold ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    SFBBO Event Signup
                  </h1>
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Browse events, sign up, and manage your schedule
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={toggleDarkMode}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isDarkMode
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
                  title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
                >
                  {isDarkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </button>
                {isAdmin ? (
                  <div className="flex items-center gap-3">
                    <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Admin
                    </span>
                    <button
                      onClick={handleAdminLogout}
                      className={`text-sm transition-colors ${
                        isDarkMode
                          ? "text-gray-400 hover:text-gray-200"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAdminLogin(true)}
                    className={`text-sm transition-colors ${
                      isDarkMode
                        ? "text-gray-400 hover:text-gray-200"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Admin
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowAddForm(!showAddForm);
                    if (!showAddForm) {
                      setTimeout(() => {
                        const formSection = document.getElementById("create-event");
                        formSection?.scrollIntoView({ behavior: "smooth" });
                      }, 50);
                    }
                  }}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                    isDarkMode
                      ? "bg-blue-600 text-white hover:bg-blue-500"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  <CalendarPlus className="h-4 w-4" />
                  {showAddForm ? "Close" : "Add Event"}
                </button>
              </div>
            </div>
          </div>
        </header>

        {isAdmin && (
          <section
            aria-label="Statistics"
            className={`rounded-lg border p-4 ${
              isDarkMode ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-white"
            }`}
          >
            <div className="grid gap-6 sm:grid-cols-3">
              {statsHighlights.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
                      <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        {stat.label}
                      </p>
                    </div>
                    <p className={`text-2xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      {stat.value}
                    </p>
                    {stat.caption && (
                      <p className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                        {stat.caption}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section
          id="how-it-works"
          className={`rounded-lg border p-6 ${
            isDarkMode ? "border-gray-800 bg-gray-900/50" : "border-gray-200 bg-gray-50"
          }`}
          aria-label="How the signup process works"
        >
          <h2
            className={`text-lg font-semibold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            How it works
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {onboardingSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="flex gap-3"
                >
                  <div className={`flex-shrink-0 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {step.title}
                    </h3>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {showAddForm && (
          <section
            id="create-event"
            className={`scroll-mt-32 rounded-3xl border px-6 py-8 sm:px-8 ${
              isDarkMode ? "border-gray-800 bg-gray-900/70" : "border-slate-200 bg-white"
            }`}
            aria-label="Create a new event"
          >
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  Create a new event
                </h2>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-slate-600"
                  }`}
                >
                  Provide a clear title, description, and timing so volunteers know what to expect.
                </p>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                  isDarkMode
                    ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <X className="h-4 w-4" /> Close form
              </button>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Event title *
                </label>
                <input
                  type="text"
                  placeholder="Enter event title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    formErrors.title
                      ? "border-red-500 focus:ring-red-400"
                      : isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400"
                  }`}
                  required
                />
                {formErrors.title && (
                  <p className="text-xs font-medium text-red-500">{formErrors.title}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Event category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-slate-200 bg-white text-slate-900"
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
              <div className="space-y-1.5">
                <label
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Your name *
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={formData.creatorName}
                  onChange={(e) =>
                    setFormData({ ...formData, creatorName: e.target.value })
                  }
                  className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    formErrors.creatorName
                      ? "border-red-500 focus:ring-red-400"
                      : isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400"
                  }`}
                  required
                />
                {formErrors.creatorName && (
                  <p className="text-xs font-medium text-red-500">
                    {formErrors.creatorName}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Event date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    formErrors.date
                      ? "border-red-500 focus:ring-red-400"
                      : isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-slate-200 bg-white text-slate-900"
                  }`}
                  required
                />
                {formErrors.date && (
                  <p className="text-xs font-medium text-red-500">{formErrors.date}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Location *
                </label>
                <input
                  type="text"
                  placeholder="Enter event location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    formErrors.location
                      ? "border-red-500 focus:ring-red-400"
                      : isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400"
                  }`}
                  required
                />
                {formErrors.location && (
                  <p className="text-xs font-medium text-red-500">
                    {formErrors.location}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Start time *
                </label>
                <input
                  type="time"
                  value={formData.fromTime}
                  onChange={(e) =>
                    setFormData({ ...formData, fromTime: e.target.value })
                  }
                  className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    formErrors.fromTime
                      ? "border-red-500 focus:ring-red-400"
                      : isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-slate-200 bg-white text-slate-900"
                  }`}
                  required
                />
                {formErrors.fromTime && (
                  <p className="text-xs font-medium text-red-500">
                    {formErrors.fromTime}
                  </p>
                )}
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-gray-500" : "text-slate-500"
                  }`}
                >
                  Select when the event begins.
                </p>
              </div>
              <div className="space-y-1.5">
                <label
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  End time *
                </label>
                <input
                  type="time"
                  value={formData.toTime}
                  onChange={(e) => setFormData({ ...formData, toTime: e.target.value })}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    formErrors.toTime
                      ? "border-red-500 focus:ring-red-400"
                      : isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-slate-200 bg-white text-slate-900"
                  }`}
                  required
                />
                {formErrors.toTime && (
                  <p className="text-xs font-medium text-red-500">
                    {formErrors.toTime}
                  </p>
                )}
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-gray-500" : "text-slate-500"
                  }`}
                >
                  End time must come after the start time.
                </p>
              </div>
              <div className="space-y-1.5">
                <label
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Max attendees (optional)
                </label>
                <input
                  type="number"
                  placeholder="Leave blank for unlimited"
                  value={formData.maxAttendees}
                  onChange={(e) =>
                    setFormData({ ...formData, maxAttendees: e.target.value })
                  }
                  className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400"
                  }`}
                  min="1"
                />
              </div>
              <div className="md:col-span-2 space-y-1.5">
                <label
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Event description *
                </label>
                <textarea
                  placeholder="Share what volunteers will be doing, who they'll meet, and any preparation required."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={`h-28 w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    formErrors.description
                      ? "border-red-500 focus:ring-red-400"
                      : isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400"
                  }`}
                  required
                />
                {formErrors.description && (
                  <p className="text-xs font-medium text-red-500">
                    {formErrors.description}
                  </p>
                )}
              </div>
              <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={addEvent}
                  disabled={submitting}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors ${
                    isDarkMode
                      ? "bg-green-500 text-white hover:bg-green-400 disabled:bg-gray-600"
                      : "bg-green-500 text-white hover:bg-green-400 disabled:bg-gray-300"
                  } disabled:cursor-not-allowed`}
                >
                  {submitting && <Loader className="h-4 w-4 animate-spin" />}
                  {submitting ? "Creating..." : "Create event"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors ${
                    isDarkMode
                      ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </section>
        )}

        <section
          id="upcoming"
          className="scroll-mt-32 space-y-6"
          aria-label="Upcoming events"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                className={`flex items-center gap-3 text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                <Calendar className="h-6 w-6 text-blue-500" />
                Upcoming events
              </h2>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-slate-600"
                }`}
              >
                Secure your spot early—spaces can fill quickly for popular activities.
              </p>
            </div>
            {!loading && upcomingEvents.length > 0 && (
              <p
                className={`text-xs uppercase tracking-wide ${
                  isDarkMode ? "text-gray-500" : "text-slate-500"
                }`}
              >
                {upcomingEvents.length} event{upcomingEvents.length === 1 ? "" : "s"} listed
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center rounded-3xl border border-dashed border-blue-300/60 px-6 py-10 text-blue-500">
              <Loader className="h-6 w-6 animate-spin" />
              <span className="ml-3 text-sm font-medium">Loading events...</span>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div
              className={`rounded-3xl border px-6 py-10 text-center ${
                isDarkMode
                  ? "border-gray-800 bg-gray-900/60 text-gray-300"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              <Calendar className="mx-auto mb-4 h-12 w-12 text-blue-400" />
              <h3
                className={`text-xl font-semibold ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                No events yet
              </h3>
              <p className="mt-2 text-sm">
                Hang tight—new SFBBO opportunities will appear here soon. Admins can create the first listing with the
                button above.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        {pastEvents.length > 0 && (
          <section
            id="archived"
            className="scroll-mt-32 space-y-4"
            aria-label="Archived events"
          >
            <button
              onClick={() => setShowArchivedEvents(!showArchivedEvents)}
              className={`flex w-full items-center justify-between rounded-3xl border px-5 py-4 text-left text-lg font-semibold transition ${
                isDarkMode
                  ? "border-gray-800 bg-gray-900/60 text-gray-200 hover:bg-gray-900/80"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <Archive className="h-5 w-5 text-purple-400" />
                Archived events ({pastEvents.length})
              </div>
              {showArchivedEvents ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
            {showArchivedEvents && (
              <div className="space-y-4">
                {pastEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {showAdminLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div
            className={`w-full max-w-md rounded-3xl border px-6 py-8 shadow-2xl ${
              isDarkMode ? "border-gray-800 bg-gray-900" : "border-slate-200 bg-white"
            }`}
          >
            <div className="mb-6 space-y-2 text-center">
              <h2
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Admin login
              </h2>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-slate-600"
                }`}
              >
                Enter the shared credentials to manage events and attendee lists.
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-slate-700"
                  }`}
                >
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
                  className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400"
                  }`}
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-slate-700"
                  }`}
                >
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
                  className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400"
                  }`}
                  placeholder="Enter password"
                  onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleAdminLogin}
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setShowAdminLogin(false);
                    setAdminCredentials({ username: "", password: "" });
                  }}
                  className={`inline-flex flex-1 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                    isDarkMode
                      ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editFormData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div
            className={`w-full max-w-2xl rounded-3xl border px-6 py-8 shadow-2xl ${
              isDarkMode ? "border-gray-800 bg-gray-900" : "border-slate-200 bg-white"
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Edit event"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-white" : "text-slate-900"
                  }`}
                >
                  Edit event
                </h2>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-gray-400" : "text-slate-600"
                  }`}
                >
                  Update details and attendees will instantly see the changes.
                </p>
              </div>
              <button
                onClick={closeEditModal}
                className={`rounded-full p-2 transition-colors ${
                  isDarkMode
                    ? "text-gray-400 hover:bg-gray-800"
                    : "text-slate-500 hover:bg-slate-100"
                }`}
                aria-label="Close edit modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Event title *
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => handleEditChange("title", e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400"
                  }`}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Event category *
                </label>
                <select
                  value={editFormData.category}
                  onChange={(e) => handleEditChange("category", e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-slate-200 bg-white text-slate-900"
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
              <div className="space-y-1.5">
                <label
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Your name *
                </label>
                <input
                  type="text"
                  value={editFormData.creatorName}
                  onChange={(e) => handleEditChange("creatorName", e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400"
                  }`}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Event date *
                </label>
                <input
                  type="date"
                  value={editFormData.date}
                  onChange={(e) => handleEditChange("date", e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-slate-200 bg-white text-slate-900"
                  }`}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Location *
                </label>
                <input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) => handleEditChange("location", e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400"
                  }`}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Start time *
                </label>
                <input
                  type="time"
                  value={editFormData.fromTime}
                  onChange={(e) => handleEditChange("fromTime", e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-slate-200 bg-white text-slate-900"
                  }`}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  End time *
                </label>
                <input
                  type="time"
                  value={editFormData.toTime}
                  onChange={(e) => handleEditChange("toTime", e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white"
                      : "border-slate-200 bg-white text-slate-900"
                  }`}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Max attendees (optional)
                </label>
                <input
                  type="number"
                  value={editFormData.maxAttendees}
                  onChange={(e) => handleEditChange("maxAttendees", e.target.value)}
                  className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400"
                  }`}
                  min="1"
                />
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Event description *
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => handleEditChange("description", e.target.value)}
                  className={`h-28 w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400"
                  }`}
                  required
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={saveEditedEvent}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                aria-label="Save changes"
              >
                Save changes
              </button>
              <button
                onClick={closeEditModal}
                className={`inline-flex flex-1 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                  isDarkMode
                    ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                aria-label="Cancel editing"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showMetricsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div
            className={`w-full max-w-md rounded-3xl border px-6 py-8 shadow-2xl ${
              isDarkMode ? "border-gray-800 bg-gray-900" : "border-slate-200 bg-white"
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Add post-event metrics"
          >
            <div className="mb-6 space-y-2 text-center">
              <h2
                className={`text-2xl font-bold ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Post-Event Metrics
              </h2>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-slate-600"
                }`}
              >
                Record attendance and engagement data for this completed event.
              </p>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-slate-700"
                    }`}
                  >
                    Adult Attendees
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={metricsData.adultAttendees}
                    onChange={(e) =>
                      setMetricsData({
                        ...metricsData,
                        adultAttendees: e.target.value,
                      })
                    }
                    className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      isDarkMode
                        ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                        : "border-slate-200 bg-white text-slate-900 placeholder-slate-400"
                    }`}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-slate-700"
                    }`}
                  >
                    Child Attendees
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={metricsData.childAttendees}
                    onChange={(e) =>
                      setMetricsData({
                        ...metricsData,
                        childAttendees: e.target.value,
                      })
                    }
                    className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                      isDarkMode
                        ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                        : "border-slate-200 bg-white text-slate-900 placeholder-slate-400"
                    }`}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Newsletter Signups
                </label>
                <input
                  type="number"
                  min="0"
                  value={metricsData.newsletterSignups}
                  onChange={(e) =>
                    setMetricsData({
                      ...metricsData,
                      newsletterSignups: e.target.value,
                    })
                  }
                  className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400"
                  }`}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-slate-700"
                  }`}
                >
                  Notes (optional)
                </label>
                <textarea
                  value={metricsData.notes}
                  onChange={(e) =>
                    setMetricsData({
                      ...metricsData,
                      notes: e.target.value,
                    })
                  }
                  className={`h-20 w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    isDarkMode
                      ? "border-gray-700 bg-gray-800 text-white placeholder-gray-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder-slate-400"
                  }`}
                  placeholder="Any additional observations or feedback..."
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={saveEventMetrics}
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-500"
                >
                  Save Metrics
                </button>
                <button
                  onClick={closeMetricsModal}
                  className={`inline-flex flex-1 items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${
                    isDarkMode
                      ? "bg-gray-800 text-gray-200 hover:bg-gray-700"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
};

export default EventApp;
