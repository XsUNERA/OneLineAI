
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const messages = document.getElementById("messages");
const conversationSection = document.getElementById("conversation");
const welcome = document.getElementById("welcome-screen");
const sendButton = document.getElementById("send-button");
const chatHistory = document.getElementById("chat-history");
const newChatButton = document.getElementById("new-chat-button");
const currentChatLabel = document.getElementById("current-chat-label");
const characterCount = document.getElementById("character-count");

const appShell = document.querySelector(".app-shell");
const menuButton = document.getElementById("menu-button");
const sidebarOverlay = document.getElementById("sidebar-overlay");

// Backend URL
const API_URL = "http://127.0.0.1:5000/chat";

// Local storage keys
const STORAGE_KEY = "oneline_ai_conversations";
const ACTIVE_CHAT_KEY = "oneline_ai_active_chat";

// Conversations state
let conversations = [];
let activeConversationId = null;
let nextId = 1;
let isSending = false;

function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
        if (activeConversationId !== null) {
            localStorage.setItem(ACTIVE_CHAT_KEY, String(activeConversationId));
        } else {
            localStorage.removeItem(ACTIVE_CHAT_KEY);
        }
    } catch (error) {
        console.error("Failed to save conversations to localStorage:", error);
    }
}

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                // Keep only valid conversations that have messages (discard abandoned empty ones on reload)
                conversations = parsed.filter(
                    chat => chat && typeof chat.id !== "undefined" && Array.isArray(chat.messages) && chat.messages.length > 0
                );

                const maxId = conversations.reduce(
                    (max, chat) => Math.max(max, Number(chat.id) || 0),
                    0
                );
                nextId = maxId + 1;
            }
        }

        const savedActiveId = localStorage.getItem(ACTIVE_CHAT_KEY);
        const parsedActiveId = savedActiveId ? Number(savedActiveId) : null;

        if (parsedActiveId && conversations.some(c => c.id === parsedActiveId)) {
            activeConversationId = parsedActiveId;
        } else if (conversations.length > 0) {
            activeConversationId = conversations[0].id;
        } else {
            activeConversationId = null;
        }
    } catch (error) {
        console.error("Failed to load conversations from localStorage:", error);
        conversations = [];
        activeConversationId = null;
    }
}

function scrollToBottom() {
    if (conversationSection) {
        conversationSection.scrollTop = conversationSection.scrollHeight;
    }
    if (messages) {
        messages.scrollTop = messages.scrollHeight;
    }
}

function getActiveConversation() {
    return conversations.find(
        chat => chat.id === activeConversationId
    );
}

function createConversation() {
    // If an empty conversation already exists, reuse it instead of creating duplicates
    const existingEmpty = conversations.find(chat => chat.messages.length === 0);
    if (existingEmpty) {
        activeConversationId = existingEmpty.id;
        saveToStorage();
        renderHistory();
        renderConversation();
        return existingEmpty;
    }

    const conversation = {
        id: nextId++,
        title: "New conversation",
        messages: []
    };

    conversations.unshift(conversation);
    activeConversationId = conversation.id;

    saveToStorage();
    renderHistory();
    renderConversation();

    return conversation;
}

function deleteConversation(id) {
    if (isSending) return;

    const index = conversations.findIndex(chat => chat.id === id);
    if (index === -1) return;

    conversations.splice(index, 1);

    // If the active conversation was deleted, select another one or reset to empty
    if (activeConversationId === id) {
        if (conversations.length > 0) {
            activeConversationId = conversations[0].id;
        } else {
            activeConversationId = null;
        }
    }

    saveToStorage();
    renderHistory();
    renderConversation();
}

function renderHistory() {
    chatHistory.replaceChildren();

    conversations.forEach(chat => {
        const item = document.createElement("div");
        item.className = "history-item";
        item.setAttribute("role", "button");
        item.setAttribute("tabindex", "0");

        if (chat.id === activeConversationId) {
            item.classList.add("active");
        }

        const icon = document.createElement("span");
        icon.className = "history-icon";
        icon.textContent = "↳";

        const title = document.createElement("span");
        title.className = "history-title";
        title.textContent = chat.title;

        const deleteButton = document.createElement("button");
        deleteButton.className = "history-delete-button";
        deleteButton.setAttribute("type", "button");
        deleteButton.setAttribute("aria-label", "Delete conversation");
        deleteButton.setAttribute("title", "Delete conversation");
        deleteButton.innerHTML = `
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
        `;

        deleteButton.addEventListener("click", event => {
            event.stopPropagation();
            deleteConversation(chat.id);
        });

        item.append(icon, title, deleteButton);

        const selectChat = () => {
            if (isSending || chat.id === activeConversationId) return;

            activeConversationId = chat.id;
            saveToStorage();

            renderHistory();
            renderConversation();
            closeMobileSidebar();
        };

        item.addEventListener("click", selectChat);
        item.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                selectChat();
            }
        });

        chatHistory.appendChild(item);
    });
}

function renderConversation() {
    const chat = getActiveConversation();

    messages.replaceChildren();

    const hasMessages = chat && chat.messages.length > 0;

    welcome.hidden = hasMessages;

    currentChatLabel.textContent = hasMessages
        ? chat.title.toUpperCase()
        : "NEW CONVERSATION";

    if (!hasMessages) {
        return;
    }

    chat.messages.forEach(message => {
        addMessageElement(message.role, message.content);
    });

    scrollToBottom();
}

function addMessageElement(role, content) {
    const group = document.createElement("div");
    group.className = "message-group";

    const label = document.createElement("span");
    label.className = "message-label";

    const body = document.createElement("div");
    body.className = "message";

    if (role === "user") {
        label.textContent = "YOU";
        body.classList.add("user-message");
    } else {
        label.textContent = "ONELINE";
        body.classList.add("bot-message");
    }

    // Display messages as plain text for safety.
    body.textContent = content;

    group.append(label, body);
    messages.appendChild(group);

    scrollToBottom();

    return { group, body };
}

function setLoading(loading) {
    isSending = loading;
    sendButton.disabled = loading;
    input.disabled = loading;

    sendButton.querySelector("span").textContent =
        loading ? "…" : "↑";

    sendButton.setAttribute(
        "aria-label",
        loading ? "Waiting for response" : "Send message"
    );
}

function closeMobileSidebar() {
    appShell.classList.remove("sidebar-open");
    menuButton.setAttribute("aria-expanded", "false");
}

async function sendMessage(prompt) {
    if (!prompt || isSending) return;

    const chat = getActiveConversation() || createConversation();
    const isFirstMessage = chat.messages.length === 0;

    // Set the conversation title from the first message.
    if (isFirstMessage) {
        chat.title = prompt.length > 32
            ? prompt.slice(0, 32).trimEnd() + "…"
            : prompt;

        renderHistory();
    }

    // Add the user's message.
    chat.messages.push({
        role: "user",
        content: prompt
    });
    saveToStorage();

    if (isFirstMessage) {
        renderConversation();
    } else {
        addMessageElement("user", prompt);
    }

    input.value = "";
    input.style.height = "auto";
    characterCount.textContent = "0 characters";

    setLoading(true);

    const loadingMessage = addMessageElement(
        "assistant",
        "Thinking..."
    );

    try {
        // Send the user's message to the Flask backend.
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: prompt
            })
        });

        // Read the backend's JSON response.
        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || `Request failed (${response.status}).`
            );
        }

        if (typeof data.reply !== "string" || !data.reply.trim()) {
            throw new Error("The AI returned an empty response.");
        }

        const reply = data.reply.trim();

        // Save the assistant's response.
        chat.messages.push({
            role: "assistant",
            content: reply
        });
        saveToStorage();

        // Replace the loading message with the real response.
        loadingMessage.group.remove();
        addMessageElement("assistant", reply);

    } catch (error) {
        console.error("Chat request failed:", error);

        loadingMessage.body.textContent =
            error.name === "TypeError"
                ? "Unable to connect to OneLine AI. Check that the backend is running."
                : error.message || "Something went wrong. Please try again.";

        loadingMessage.body.classList.add("message-error");

    } finally {
        setLoading(false);
        input.focus();
        renderHistory();
    }
}

// Submit messages using the send button.
form.addEventListener("submit", event => {
    event.preventDefault();
    sendMessage(input.value.trim());
});

// Enter sends a message; Shift + Enter adds a new line.
input.addEventListener("keydown", event => {
    if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !event.isComposing
    ) {
        event.preventDefault();
        form.requestSubmit();
    }
});

// Automatically resize the input and update the character count.
input.addEventListener("input", () => {
    input.style.height = "auto";

    input.style.height =
        Math.min(input.scrollHeight, 150) + "px";

    characterCount.textContent =
        `${input.value.length} characters`;
});

// Start a new conversation.
newChatButton.addEventListener("click", () => {
    if (isSending) return;

    input.value = "";
    input.style.height = "auto";
    characterCount.textContent = "0 characters";

    createConversation();
    closeMobileSidebar();
    input.focus();
});

// Example prompts.
document.querySelectorAll(".suggestion").forEach(button => {
    button.addEventListener("click", () => {
        sendMessage(button.dataset.prompt);
    });
});

// Toggle the sidebar.
menuButton.addEventListener("click", () => {
    if (window.innerWidth <= 760) {
        const isOpen = appShell.classList.toggle("sidebar-open");

        menuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    } else {
        appShell.classList.toggle("sidebar-collapsed");
    }
});

sidebarOverlay.addEventListener("click", closeMobileSidebar);

// Clicking the brand starts a fresh conversation.
document.getElementById("brand-link").addEventListener(
    "click",
    event => {
        event.preventDefault();

        if (isSending) return;

        input.value = "";
        input.style.height = "auto";
        characterCount.textContent = "0 characters";

        createConversation();
        input.focus();
    }
);

// Initialize from storage on page load
loadFromStorage();
renderHistory();
renderConversation();
