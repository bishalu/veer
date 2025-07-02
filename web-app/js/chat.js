/* Chat Functionality for Golo */

const ChatManager = {
    currentChat: null,
    contacts: [],
    messages: {},

    init() {
        this.loadMockData();
        this.setupEventListeners();
        this.selectDefaultChat();
    },

    loadMockData() {
        // Mock contacts data
        this.contacts = [
            {
                id: 'sarah-chen',
                name: 'Sarah Chen',
                avatar: 'https://via.placeholder.com/40/FF6B6B/FFFFFF?text=SC',
                status: 'online',
                lastMessage: 'Thanks for the advice!',
                lastMessageTime: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
                unreadCount: 2
            },
            {
                id: 'ram-sharma',
                name: 'Ram Sharma',
                avatar: 'https://via.placeholder.com/40/4ECDC4/FFFFFF?text=RS',
                status: 'away',
                lastMessage: "Let's connect next week",
                lastMessageTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
                unreadCount: 0
            },
            {
                id: 'maya-patel',
                name: 'Maya Patel',
                avatar: 'https://via.placeholder.com/40/45B7D1/FFFFFF?text=MP',
                status: 'offline',
                lastMessage: 'Great meeting you!',
                lastMessageTime: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
                unreadCount: 0
            },
            {
                id: 'david-wong',
                name: 'David Wong',
                avatar: 'https://via.placeholder.com/40/F7B731/FFFFFF?text=DW',
                status: 'online',
                lastMessage: 'The startup event was amazing',
                lastMessageTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
                unreadCount: 1
            },
            {
                id: 'priya-thapa',
                name: 'Priya Thapa',
                avatar: 'https://via.placeholder.com/40/A55EEA/FFFFFF?text=PT',
                status: 'online',
                lastMessage: 'Looking forward to our collaboration',
                lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                unreadCount: 0
            }
        ];

        // Mock messages data
        this.messages = {
            'sarah-chen': [
                {
                    id: 1,
                    senderId: 'sarah-chen',
                    content: "Hi! I saw your profile and we have similar goals. Would love to connect!",
                    timestamp: new Date(Date.now() - 30 * 60 * 1000),
                    type: 'received'
                },
                {
                    id: 2,
                    senderId: 'me',
                    content: "That's great! I'd love to learn more about your journey. What specific goals are you working on?",
                    timestamp: new Date(Date.now() - 28 * 60 * 1000),
                    type: 'sent'
                },
                {
                    id: 3,
                    senderId: 'sarah-chen',
                    content: "I'm focusing on building my tech startup. Looking for mentors and potential co-founders!",
                    timestamp: new Date(Date.now() - 25 * 60 * 1000),
                    type: 'received'
                },
                {
                    id: 4,
                    senderId: 'me',
                    content: "That's exactly what I'm working on too! What's your startup idea about?",
                    timestamp: new Date(Date.now() - 20 * 60 * 1000),
                    type: 'sent'
                },
                {
                    id: 5,
                    senderId: 'sarah-chen',
                    content: "Thanks for the advice!",
                    timestamp: new Date(Date.now() - 2 * 60 * 1000),
                    type: 'received'
                }
            ],
            'ram-sharma': [
                {
                    id: 1,
                    senderId: 'ram-sharma',
                    content: "Hey! Fellow Nepali here. Saw you're in SF too. Would love to connect!",
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    type: 'received'
                },
                {
                    id: 2,
                    senderId: 'me',
                    content: "Amazing! Always great to meet other Nepalis in tech. How long have you been in SF?",
                    timestamp: new Date(Date.now() - 90 * 60 * 1000),
                    type: 'sent'
                },
                {
                    id: 3,
                    senderId: 'ram-sharma',
                    content: "Let's connect next week",
                    timestamp: new Date(Date.now() - 60 * 60 * 1000),
                    type: 'received'
                }
            ]
        };

        this.renderContactsList();
    },

    setupEventListeners() {
        // Chat input
        const chatInput = document.querySelector('.chat-input');
        const sendBtn = document.querySelector('.send-btn');

        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        // Search functionality
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchContacts(e.target.value));
        }

        // New chat button
        const newChatBtn = document.querySelector('.new-chat-btn');
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => this.showNewChatDialog());
        }
    },

    renderContactsList() {
        const contactsList = document.querySelector('.contacts-list');
        if (!contactsList) return;

        contactsList.innerHTML = this.contacts.map(contact => `
            <div class="contact-item ${contact.id === this.currentChat ? 'active' : ''}" data-contact-id="${contact.id}">
                <div class="contact-avatar">
                    <img src="${contact.avatar}" alt="${contact.name}">
                    <div class="status-indicator ${contact.status}"></div>
                </div>
                <div class="contact-info">
                    <div class="contact-name">${contact.name}</div>
                    <div class="last-message">${contact.lastMessage}</div>
                    <div class="message-time">${this.formatRelativeTime(contact.lastMessageTime)}</div>
                </div>
                ${contact.unreadCount > 0 ? `<div class="unread-badge">${contact.unreadCount}</div>` : ''}
            </div>
        `).join('');

        // Add click listeners to contact items
        contactsList.querySelectorAll('.contact-item').forEach(item => {
            item.addEventListener('click', () => {
                const contactId = item.getAttribute('data-contact-id');
                this.selectChat(contactId);
            });
        });
    },

    selectDefaultChat() {
        if (this.contacts.length > 0) {
            this.selectChat(this.contacts[0].id);
        }
    },

    selectChat(contactId) {
        const contact = this.contacts.find(c => c.id === contactId);
        if (!contact) return;

        this.currentChat = contactId;

        // Update contact list UI
        document.querySelectorAll('.contact-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-contact-id="${contactId}"]`)?.classList.add('active');

        // Update chat header
        this.updateChatHeader(contact);

        // Load messages
        this.loadMessages(contactId);

        // Mark messages as read
        contact.unreadCount = 0;
        this.renderContactsList();
    },

    updateChatHeader(contact) {
        const chatAvatar = document.querySelector('.chat-avatar img');
        const chatName = document.querySelector('.chat-name');
        const chatStatus = document.querySelector('.chat-status');

        if (chatAvatar) chatAvatar.src = contact.avatar;
        if (chatName) chatName.textContent = contact.name;
        if (chatStatus) {
            chatStatus.textContent = contact.status.charAt(0).toUpperCase() + contact.status.slice(1);
            chatStatus.className = `chat-status ${contact.status}`;
        }
    },

    loadMessages(contactId) {
        const chatMessages = document.querySelector('.chat-messages');
        if (!chatMessages) return;

        const messages = this.messages[contactId] || [];

        chatMessages.innerHTML = messages.map(message => `
            <div class="message ${message.type}">
                <div class="message-content">
                    <p>${message.content}</p>
                </div>
                <div class="message-time">${this.formatMessageTime(message.timestamp)}</div>
            </div>
        `).join('');

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    },

    sendMessage() {
        const chatInput = document.querySelector('.chat-input');
        if (!chatInput || !this.currentChat) return;

        const content = chatInput.value.trim();
        if (!content) return;

        // Create new message
        const newMessage = {
            id: Date.now(),
            senderId: 'me',
            content: content,
            timestamp: new Date(),
            type: 'sent'
        };

        // Add to messages
        if (!this.messages[this.currentChat]) {
            this.messages[this.currentChat] = [];
        }
        this.messages[this.currentChat].push(newMessage);

        // Update contact's last message
        const contact = this.contacts.find(c => c.id === this.currentChat);
        if (contact) {
            contact.lastMessage = content;
            contact.lastMessageTime = new Date();
        }

        // Clear input
        chatInput.value = '';

        // Reload messages and contacts
        this.loadMessages(this.currentChat);
        this.renderContactsList();

        // Simulate a response (for demo purposes)
        setTimeout(() => this.simulateResponse(), 1000 + Math.random() * 2000);

        showNotification('Message sent', 'success');
    },

    simulateResponse() {
        if (!this.currentChat) return;

        const responses = [
            "That's really interesting!",
            "I'd love to learn more about that.",
            "Thanks for sharing!",
            "Let's definitely connect on this.",
            "Great idea! How can I help?",
            "I have some experience with that too.",
            "Would you like to schedule a call?"
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];

        const responseMessage = {
            id: Date.now(),
            senderId: this.currentChat,
            content: randomResponse,
            timestamp: new Date(),
            type: 'received'
        };

        this.messages[this.currentChat].push(responseMessage);

        // Update contact's last message and unread count
        const contact = this.contacts.find(c => c.id === this.currentChat);
        if (contact) {
            contact.lastMessage = randomResponse;
            contact.lastMessageTime = new Date();
            contact.unreadCount = (contact.unreadCount || 0) + 1;
        }

        this.loadMessages(this.currentChat);
        this.renderContactsList();

        showNotification('New message received', 'info');
    },

    searchContacts(query) {
        const filteredContacts = this.contacts.filter(contact =>
            contact.name.toLowerCase().includes(query.toLowerCase())
        );

        const contactsList = document.querySelector('.contacts-list');
        if (!contactsList) return;

        contactsList.innerHTML = filteredContacts.map(contact => `
            <div class="contact-item ${contact.id === this.currentChat ? 'active' : ''}" data-contact-id="${contact.id}">
                <div class="contact-avatar">
                    <img src="${contact.avatar}" alt="${contact.name}">
                </div>
                <div class="contact-info">
                    <div class="contact-name">${contact.name}</div>
                    <div class="last-message">${contact.lastMessage}</div>
                    <div class="message-time">${this.formatRelativeTime(contact.lastMessageTime)}</div>
                </div>
                ${contact.unreadCount > 0 ? `<div class="unread-badge">${contact.unreadCount}</div>` : ''}
            </div>
        `).join('');

        // Re-add click listeners
        contactsList.querySelectorAll('.contact-item').forEach(item => {
            item.addEventListener('click', () => {
                const contactId = item.getAttribute('data-contact-id');
                this.selectChat(contactId);
            });
        });
    },

    showNewChatDialog() {
        showNotification('New chat feature coming soon!', 'info');
    },

    formatRelativeTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'yesterday';
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    },

    formatMessageTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
};

// Initialize chat when needed
function initializeChat() {
    ChatManager.init();
}

// Add chat-specific styles
const chatStyles = document.createElement('style');
chatStyles.textContent = `
    .status-indicator {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
    }

    .status-indicator.online {
        background-color: var(--success-color);
    }

    .status-indicator.away {
        background-color: var(--warning-color);
    }

    .status-indicator.offline {
        background-color: var(--secondary-color);
    }

    .contact-avatar {
        position: relative;
        margin-right: 1rem;
    }

    .chat-status.online {
        color: var(--success-color);
    }

    .chat-status.away {
        color: var(--warning-color);
    }

    .chat-status.offline {
        color: var(--secondary-color);
    }

    .message {
        margin-bottom: 1rem;
        display: flex;
        flex-direction: column;
        animation: fadeInMessage 0.3s ease;
    }

    @keyframes fadeInMessage {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .chat-messages {
        scrollbar-width: thin;
        scrollbar-color: var(--border-color) transparent;
    }

    .chat-messages::-webkit-scrollbar {
        width: 6px;
    }

    .chat-messages::-webkit-scrollbar-track {
        background: transparent;
    }

    .chat-messages::-webkit-scrollbar-thumb {
        background-color: var(--border-color);
        border-radius: 3px;
    }

    .chat-input-container {
        position: relative;
    }

    .chat-input:focus {
        outline: none;
        background: white;
    }

    .attachment-btn:hover,
    .send-btn:hover {
        background: var(--primary-color);
        color: white;
        transform: scale(1.1);
    }

    .unread-badge {
        animation: pulse 2s infinite;
    }

    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 rgba(255, 90, 95, 0.7);
        }
        70% {
            box-shadow: 0 0 0 10px rgba(255, 90, 95, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(255, 90, 95, 0);
        }
    }
`;
document.head.appendChild(chatStyles);