import React, { useEffect, useState, useRef } from "react";
import socket from "../socket";
import API from "../services/api";
import { FaCircle } from "react-icons/fa";
import "./App.css";

function Chat() {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [receiverId, setReceiverId] = useState(localStorage.getItem("receiverId") || "");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(false);

  useEffect(() => {
    if (!socketRef.current) {
      socket.emit("join", currentUser._id);
      socketRef.current = true;

      socket.on("receiveMessage", (data) => {
        setChat((prev) => [...prev, data]);
      });

      socket.on("updateOnlineUsers", (users) => {
        setOnlineUsers(users);
      });
    }

    return () => {
      socket.off("receiveMessage");
      socket.off("updateOnlineUsers");
    };
  }, [currentUser]);

  useEffect(() => {
    const fetchUsersWithMessages = async () => {
      try {
        const { data } = await API.get(`/users/with-last-message/${currentUser._id}`);
        setUsers(data);

        if (!receiverId && data.length > 0) {
          const firstUserId = data[0]._id;
          setReceiverId(firstUserId);
          localStorage.setItem("receiverId", firstUserId);
        }
      } catch (err) {
        console.error("Error fetching users with messages:", err);
      }
    };

    fetchUsersWithMessages();
  }, [currentUser._id, receiverId]);

  useEffect(() => {
    if (!receiverId) return;

    const fetchHistory = async () => {
      try {
        const { data } = await API.get(`/chat/history/${currentUser._id}/${receiverId}`);
        setChat(data);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    fetchHistory();
  }, [receiverId, currentUser._id]);

  const handleUserSelect = (userId) => {
    localStorage.setItem("receiverId", userId);
    setReceiverId(userId);
  };

  const sendMessage = () => {
    if (!receiverId || !message) return;

    const msgData = {
      senderId: currentUser._id,
      receiverId,
      message,
    };

    socket.emit("sendMessage", msgData);

    setChat((prev) => [
      ...prev,
      {
        ...msgData,
        timestamp: new Date(),
        senderName: "You",
      },
    ]);
    setMessage("");
  };

  return (
    <div className="chat-app">
      <div className="chat-header">
        <div className="chat-profile">
          <strong>{currentUser.name}</strong>
          <span>{currentUser.phone}</span>
        </div>

        <div className="chat-logo">
          <img src="/logo.png" alt="Logo" />
        </div>

        <div className="chat-actions">
          <button onClick={() => alert(`Phone: ${currentUser.phone}`)}>Profile</button>
          <button onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}>Logout</button>
        </div>
      </div>

      <div className="chat-container">
        <div className="sidebar">
          <h3>Chats</h3>
          <div className="user-list">
            {users.length === 0 ? (
              <p>No recent chats</p>
            ) : (
              users.map((user) => (
                <div
                  key={user._id}
                  className={`user-card ${receiverId === user._id ? "active" : ""}`}
                  onClick={() => handleUserSelect(user._id)}
                >
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-last-message">{user.lastMessage?.text || "No messages yet"}</div>
                  </div>
                  <div className="user-status">
                    <FaCircle
                      color={onlineUsers.includes(user._id) ? "green" : "gray"}
                      size={10}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chat-window">
          <div className="messages">
            {chat.map((msg, i) => (
              <div
                key={i}
                className={`message-bubble ${msg.senderId === currentUser._id ? "sent" : "received"}`}
              >
                <div>{msg.message}</div>
                <div className="message-meta">
                  {msg.senderId === currentUser._id ? "You" : msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
