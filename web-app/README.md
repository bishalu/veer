# Golo Web App

> Goal Manifestation & Matchmaking Platform for Nepali Communities

A modern web application with mobile app-style interface that helps users articulate their goals and connect with like-minded individuals who can support their journey. Designed as a mobile-passable prototype that's easily convertible to a native phone app.

## Features

### 🎯 **Profile Settings**
- **Voice Recording**: Record your introduction and goals using browser microphone
- **AI Profile Generation**: Automatic profile creation from voice transcripts
- **Dual-Layer Profiles**: Public outward profile + private matching algorithm data
- **4-Step Wizard**: Guided profile creation process

### 💬 **Chat & Messaging**
- **Real-time Messaging**: Chat with your connections
- **Contact Management**: Organized list of your network
- **Status Indicators**: See who's online, away, or offline
- **Search & Filter**: Find conversations quickly

### 📈 **Goal Setting & Tracking**
- **Goal Management**: Create, track, and update your goals
- **Progress Visualization**: Beautiful progress bars and metrics
- **Milestone Tracking**: Break goals into manageable milestones
- **Connection Insights**: See how many people are supporting each goal
- **Categories & Tags**: Organize goals by type and interests

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Design**: Mobile-app-style UI with bottom navigation
- **Audio**: Web Audio API, MediaRecorder API
- **Storage**: LocalStorage for offline persistence
- **Styling**: CSS Custom Properties, Flexbox, Responsive Design
- **Icons**: Font Awesome 6
- **Mobile Features**: Haptic feedback, touch optimizations
- **Development**: Live Server with hot reload

## Quick Start

### Prerequisites
- Node.js 14+ installed
- Modern web browser with microphone support

### Installation & Running

```bash
# Navigate to the web app directory
cd web-app

# Install dependencies
npm install

# Start development server
npm start
```

The app will automatically open at `http://localhost:3000`

### Testing Mobile vs Desktop Layouts

**Force Mobile Mode on Desktop:**
- `http://localhost:3000#mobile` - Mobile app layout on desktop
- `http://localhost:3000?mobile=true` - Alternative mobile override
- Click the toggle button in top-right corner

**Force Desktop Mode:**
- `http://localhost:3000#desktop` - Desktop layout (default)
- `http://localhost:3000?desktop=true` - Alternative desktop override

### Alternative Methods

**Using Python (if Node.js not available):**
```bash
cd web-app
python -m http.server 8000
# Visit http://localhost:8000
```

**Using any static file server:**
Simply serve the `web-app` directory with any HTTP server.

## Available Scripts

- `npm start` - Start development server with live reload
- `npm run dev` - Same as start but with file watching
- `npm run serve` - Alternative Python-based server
- `npm run build` - Prepare for production (placeholder)
- `npm test` - Run tests (placeholder)

## Project Structure

```
web-app/
├── index.html              # Main HTML file
├── css/
│   ├── main.css            # Global styles & layout
│   ├── profile.css         # Profile creation styles
│   ├── chat.css           # Chat interface styles
│   └── goals.css          # Goals management styles
├── js/
│   ├── main.js            # App initialization & utilities
│   ├── profile.js         # Profile creation logic
│   ├── audio.js           # Audio recording functionality
│   ├── chat.js            # Chat & messaging features
│   └── goals.js           # Goals management
├── assets/
│   └── logo.png           # Golo logo
├── components/            # Future component files
├── package.json           # Node.js dependencies
└── README.md             # This file
```

## Key Features Explained

### Voice Recording
- **Browser Support**: Uses MediaRecorder API with fallbacks
- **Audio Processing**: Chunked recording for longer sessions
- **File Upload**: Fallback option for unsupported browsers
- **Speech-to-Text**: Placeholder implementation (ready for API integration)

### Profile Creation
- **Step-by-Step Wizard**: 4 intuitive steps
- **Data Persistence**: Saves progress in localStorage
- **Validation**: Form validation at each step
- **AI Integration Ready**: Structured for backend AI processing

### Real-time Features
- **Mock Real-time Chat**: Simulated messaging with auto-responses
- **Live Updates**: Dynamic UI updates without page refresh
- **Notifications**: In-app notification system

### Goal Management
- **Visual Progress**: Interactive progress bars
- **Status Tracking**: Planning → Active → In Progress → Completed
- **Insights Dashboard**: Progress analytics and metrics
- **Connection Tracking**: See who's helping with each goal

## Browser Compatibility

- **Chrome**: Full support with all mobile features (recommended)
- **Firefox**: Full support with haptic feedback
- **Safari**: Full support with microphone permissions
- **Edge**: Full support
- **Mobile**: Optimized mobile-app-style interface on all devices
- **Touch**: Full touch gesture support with visual feedback

## Development Notes

### Audio Recording
The app uses the Web Audio API for recording. For production:
- Implement proper speech-to-text service (Google Cloud Speech, AWS Transcribe, etc.)
- Add audio compression for better upload performance
- Include noise cancellation and audio enhancement

### Data Persistence
Currently uses localStorage. For production:
- Implement backend API for data storage
- Add user authentication
- Enable real-time synchronization

### Chat System
Mock implementation ready for:
- WebSocket integration for real-time messaging
- Backend user management
- File sharing and rich media support

## Customization

### Styling
- Edit CSS custom properties in `css/main.css` for theme changes
- Component-specific styles in respective CSS files
- Mobile-first responsive design

### Functionality
- Modular JavaScript architecture
- Event-driven pattern for easy extension
- Clear separation of concerns

## Deployment

For production deployment:
1. Build optimized assets
2. Configure web server (nginx, Apache, etc.)
3. Set up HTTPS (required for microphone access)
4. Configure proper CORS headers
5. Add backend API integration

## Contributing

This is a prototype/demo application. For production use:
- Add comprehensive error handling
- Implement proper testing suite
- Add accessibility features (ARIA labels, keyboard navigation)
- Optimize for performance
- Add internationalization support

## License

MIT License - See LICENSE file for details

---

**Built with ❤️ for the Nepali community worldwide**