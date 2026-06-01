import React, { useState, useEffect } from "react";

import { API_BASE } from "./environment.jsx";

// Icon Components (keep these as they are)

function AdminMessagesToUser() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  useEffect(() => {
    fetchUserMessages();
  }, []);

  const fetchUserMessages = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
      showSnackbar("Please login to continue", "error");
      setLoading(false);
      return;
    }


    const url = `${API_BASE}/messages/login`;


    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!res.ok) {
      setMessages([]);
      return;
    }

    const data = await res.json();

    // ✅ ONLY show messages sent by admin
    const adminMessages = (data || []).filter(msg =>
      msg.sender?.role === "admin"
    );

    setMessages(adminMessages);

    // console.log("Filtered admin messages:", adminMessages);
  } catch (err) {
    console.error("Fetch error:", err);
    showSnackbar("Error loading messages", "error");
    setMessages([]);
  } finally {
    setLoading(false);
  }
};


  const markAsRead = async (messageId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/messages/${messageId}/read`, {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        setMessages(messages.map(msg => 
          msg._id === messageId ? { ...msg, isRead: true, readAt: new Date() } : msg
        ));
        showSnackbar("Message marked as read", "success");
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
      showSnackbar("Error updating message", "error");
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/messages/mark-all/read`, {
        method: "PATCH",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const result = await response.json();
        setMessages(messages.map(msg => ({ ...msg, isRead: true, readAt: new Date() })));
        showSnackbar(`Marked ${result.updatedCount} messages as read`, "success");
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
      showSnackbar("Error updating messages", "error");
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
    setTimeout(() => {
      setSnackbar(s => ({ ...s, open: false }));
    }, 6000);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "normal":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "low":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getSenderName = (message) => {
    if (message.sender) {
      return message.sender.name || message.sender.email || "Admin";
    }
    return "Admin";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block mb-4">
            <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-full p-3 text-blue-600">
                <MessageIcon />
              </div>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CheckIcon />
                Mark All as Read ({unreadCount})
              </button>
            )}
          </div>
        </div>

        {/* Messages List */}
        {messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`bg-white border-2 rounded-lg overflow-hidden transition-all hover:shadow-md ${
                  !message.isRead
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200"
                }`}
              >
                {/* Message Header */}
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => {
                    setExpandedMessage(expandedMessage === message._id ? null : message._id);
                    if (!message.isRead) {
                      markAsRead(message._id);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {message.subject}
                        </h3>
                        {!message.isRead && (
                          <span className="inline-block w-3 h-3 bg-blue-600 rounded-full"></span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(message.priority)}`}>
                          {message.priority?.charAt(0).toUpperCase() + message.priority?.slice(1) || "Normal"}
                        </span>
                        <span className="text-sm text-gray-600">
                          {new Date(message.sentAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                        <span className="text-sm text-gray-600">
                          From: {getSenderName(message)}
                        </span>
                        {message.isRead && (
                          <div className="flex items-center gap-1 text-gray-500 text-sm">
                            <CheckIcon />
                            <span>Read</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-gray-400 flex-shrink-0">
                      <svg className={`w-6 h-6 transition-transform ${expandedMessage === message._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Message Content */}
                {expandedMessage === message._id && (
                  <div className="border-t border-gray-200 px-6 py-6 bg-gray-50">
                    <div className="prose prose-sm max-w-none mb-6">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {message.message}
                      </p>
                    </div>

                    {/* Meeting Link */}
                    {message.meetLink && (
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-blue-600">
                            <VideoIcon />
                          </div>
                          <h4 className="font-semibold text-blue-900">Meeting Link</h4>
                        </div>
                        <a
                          href={message.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                        >
                          <span>Join Meeting</span>
                          <ExternalLinkIcon />
                        </a>
                        <p className="text-xs text-blue-700 mt-2">
                          Click the link above to join the meeting
                        </p>
                      </div>
                    )}

                    {/* Message Metadata */}
                    <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center text-xs text-gray-600">
                      <div>
                        <div className="mb-1">
                          From: <span className="font-semibold text-gray-900">{getSenderName(message)}</span>
                          {message.sender?.email && (
                            <span className="ml-2 text-gray-500">({message.sender.email})</span>
                          )}
                        </div>
                        <div>
                          To: <span className="font-semibold text-gray-900">You</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="mb-1">
                          Sent: {new Date(message.sentAt).toLocaleString()}
                        </div>
                        {message.readAt && (
                          <div>
                            Read: {new Date(message.readAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gray-100 rounded-full p-4 text-gray-400">
                <MessageIcon />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Messages Yet
            </h3>
            <p className="text-gray-600 mb-4">
              {`You hasn't received any messages yet.`}
            </p>
            <button
              onClick={fetchUserMessages}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Refresh Messages
            </button>
          </div>
        )}

        {/* Message Count */}
        {messages.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>
              Showing <span className="font-semibold">{messages.length}</span> message{messages.length !== 1 ? 's' : ''}
              {unreadCount > 0 && (
                <span className="ml-2">
                  • <span className="font-semibold text-blue-600">{unreadCount} unread</span>
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Snackbar Notification */}
      {snackbar.open && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`px-6 py-3 rounded-lg shadow-lg text-white font-medium ${
            snackbar.severity === 'success' ? 'bg-green-600' :
            snackbar.severity === 'error' ? 'bg-red-600' :
            'bg-blue-600'
          }`}>
            {snackbar.message}
          </div>
        </div>
      )}
    </div>
  );
}

// Add the missing icon components
const MessageIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const VideoIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-4l8-8m0 0H8m8 0v8" />
  </svg>
);

export default AdminMessagesToUser;