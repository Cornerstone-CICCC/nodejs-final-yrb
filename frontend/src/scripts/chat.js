// src/scripts/chatSocket.js
import { io } from 'socket.io-client';

export function setupChat(roomId, currentUserId) {
  const socket = io("http://localhost:3000", {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5
  });

  socket.emit("joinRoom", { roomId });

  socket.on("previousMessages", ({ messages }) => {
    const chatList = document.querySelector(".chat-list-detail");
    if (!chatList) return;
    chatList.innerHTML = "";
    messages.forEach(msg => renderMessage(msg, currentUserId, chatList));
  });

  socket.on("newMessage", (msg) => {
    const chatList = document.querySelector(".chat-list-detail");
    if (!chatList) return;
    renderMessage(msg, currentUserId, chatList);
  });

  socket.on("connect", () => {
    console.log("Connected to server");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from server");
  });

  socket.on("connect_error", (error) => {
    console.error("Connection error:", error);
  });

  const form = document.querySelector(".chat-input-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input");
      const message = input.value.trim();
      if (!message) return;

      socket.emit("sendMessage", { roomId, message, userId: currentUserId });
      input.value = "";
    });
  }

  function renderMessage(msg, currentUserId, chatList) {
    const li = document.createElement("li");
    const msgUserId = msg.userId?._id || msg.userId;
    const isCurrentUser = msgUserId === currentUserId || msg.userId === currentUserId;

    if (isCurrentUser) {
      li.classList.add("message", "sent");
      li.innerHTML = `
        <div class="bubble">
          <p>${msg.message}</p>
          <span class="timestamp">${new Date(msg.createdAt).toLocaleTimeString()}</span>
        </div>
        <img src="../images/user_icon.svg" alt="My Avatar" class="avatar" />
      `;
    } else {
      li.classList.add("message", "received");
      const username = msg.userId?.username || msg.username || "User";
      li.innerHTML = `
        <img src="../images/user_icon.svg" alt="${username} Avatar" class="avatar" />
        <div class="bubble">
          <p>${msg.message}</p>
          <span class="timestamp">${new Date(msg.createdAt).toLocaleTimeString()}</span>
        </div>
      `;
    }
    chatList.appendChild(li);
    chatList.scrollTop = chatList.scrollHeight;
  }
}