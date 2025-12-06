// src/scripts/chatSocket.js
import { io } from 'socket.io-client';

export function setupChat(roomId, currentUserId) {
  const socket = io("http://localhost:3000", {
    auth: { userId: currentUserId }
  });

  socket.emit("joinRoom", { roomId });

  socket.on("previousMessages", ({ messages }) => {
    const chatList = document.querySelector(".chat-list-detail");
    chatList.innerHTML = "";
    messages.forEach(msg => renderMessage(msg, currentUserId, chatList));
  });

  socket.on("newMessage", (msg) => {
    const chatList = document.querySelector(".chat-list-detail");
    renderMessage(msg, currentUserId, chatList);
  });

  const form = document.querySelector(".chat-input-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector("input");
    const message = input.value.trim();
    if (!message) return;

    const chatList = document.querySelector(".chat-list-detail");
    renderMessage(
      {
        userId: currentUserId,
        username: "Yo",
        message,
        createdAt: new Date().toISOString()
      },
      currentUserId,
      chatList
    );

    socket.emit("sendMessage", { roomId, message });
    input.value = "";
  });

  function renderMessage(msg, currentUserId, chatList) {
    const li = document.createElement("li");
    if (msg.userId === currentUserId) {
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
      li.innerHTML = `
        <img src="/user_icon.svg" alt="${msg.username} Avatar" class="avatar" />
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