# Golo (formerly Veer) - Goal Manifestation & Matchmaking Platform

## Project Overview
Golo is a goal manifestation and intelligent matchmaking platform designed specifically for Nepali communities both in Nepal and the Nepali diaspora in America. The platform helps users articulate their goals and connect with like-minded individuals who can support their journey.

## Current State
This project now has **two implementations**:

1. **Streamlit MVP** (original): Early-stage MVP focusing on profile creation through voice recording and AI-powered analysis
2. **Web App** (new): Modern HTML/CSS/JavaScript implementation with full 3-tab interface for prototyping and ideation

### Web App Implementation (`/web-app/`)
A complete modern web application featuring:
- **Profile Settings Tab**: 4-step voice recording and profile creation wizard
- **Chat/Messaging Tab**: Real-time messaging interface with contact management
- **Goal Setting Tab**: Comprehensive goal tracking and progress visualization

## Core Architecture

### Streamlit MVP Components

#### 1. **profile_app.py** - Main Streamlit Application
- Multi-step profile creation workflow (6 steps)
- Voice recording integration with multiple fallback methods
- Speech-to-text conversion using Google Speech Recognition
- AI-powered profile generation
- Session state management for user flow

#### 2. **gai_utils.py** - AI/LLM Client Interface
- Unified interface for multiple AI providers:
  - Azure OpenAI (gpt-4o, gpt-4o-mini, gpt-4.1, gpt-4.1-mini, o4-mini)
  - InceptionLabs Mercury models
  - Cohere embeddings
- Structured JSON response handling with Pydantic schemas
- Secrets management integration for API keys
- Temperature and token controls

#### 3. **veer_client_utils.py** - Profile Analysis Logic
- Pydantic-based schemas for structured profile data
- Dual-layer profile system:
  - **Outward Profile**: Public-facing information (name, background, goals, skills)
  - **Inward Profile**: Private psychological assessment for matching algorithm
- Comprehensive psychological profiling including Big Five personality traits
- Cultural awareness for Nepali diaspora experience

#### 4. **aws_utils.py** - Cloud Infrastructure
- AWS S3 integration for data storage
- AWS Secrets Manager for secure credential management
- CSV file operations and cloud dumping functionality
- Flexible credential handling (environment variables + Streamlit secrets)

### Web App Components (`/web-app/`)

#### Frontend Structure
- **index.html**: Main application with 3-tab interface
- **CSS Modules**:
  - `main.css`: Global styles, layout, and theme
  - `profile.css`: Profile creation wizard styling
  - `chat.css`: Messaging interface styling  
  - `goals.css`: Goal management interface styling
- **JavaScript Modules**:
  - `main.js`: App initialization, tab navigation, utilities
  - `profile.js`: 4-step profile creation logic
  - `audio.js`: Web Audio API recording functionality
  - `chat.js`: Mock real-time messaging system
  - `goals.js`: Goal tracking and progress management

#### Key Features
- **Voice Recording**: Browser-based audio recording with MediaRecorder API
- **Progressive Web App**: Mobile-responsive design
- **LocalStorage Persistence**: Client-side data storage
- **Mock Real-time Features**: Simulated chat and live updates
- **Component Architecture**: Modular JavaScript design

## Technology Stack

### Streamlit MVP Technologies
- **Frontend**: Streamlit with custom CSS styling
- **AI/ML**: Azure OpenAI, Google Generative AI, Mercury LLM
- **Speech Processing**: SpeechRecognition library, pydub for audio processing
- **Cloud**: AWS (S3, Secrets Manager)
- **Audio Recording**: streamlit-audiorecorder, streamlit-mic-recorder (with fallbacks)

### Web App Technologies
- **Frontend**: HTML5, CSS3 (Grid/Flexbox), Vanilla JavaScript (ES6+)
- **Audio**: Web Audio API, MediaRecorder API
- **Storage**: LocalStorage for offline-first experience
- **Development**: Live-server with hot reload
- **Icons**: Font Awesome 6
- **Responsive**: Mobile-first CSS design

### Dependencies (requirements.txt)
```
streamlit
streamlit-mic-recorder
streamlit-audiorecorder
openai
azure-ai-inference
azure-core
google-generativeai
numpy
boto3
SpeechRecognition
pydub
python-dotenv
```

## Development Guidelines

### File Organization
- Keep utility functions modular and well-separated
- Main application logic in `profile_app.py`
- AI/LLM abstractions in `gai_utils.py`
- Profile analysis and schemas in `veer_client_utils.py`
- Cloud operations in `aws_utils.py`

### Code Patterns
- Use Pydantic for data validation and structured responses
- Implement fallback mechanisms for audio recording
- Handle exceptions gracefully with user-friendly error messages
- Use Streamlit session state for multi-step workflows
- Clean up temporary files after use

### AI Integration Best Practices
- Always use structured JSON responses with schemas for consistency
- Implement temperature controls for deterministic vs creative outputs
- Use appropriate models for different tasks (o4-mini for analysis, gpt-4o for complex reasoning)
- Handle API failures gracefully with fallback strategies

### Security Considerations
- Never hardcode API keys - use AWS Secrets Manager or environment variables
- Support both local development (.env) and cloud deployment (Streamlit secrets)
- Clean up temporary audio files after processing
- Validate and sanitize user inputs

## Testing Strategy
- Test audio recording across different browsers and devices
- Verify speech-to-text accuracy across different accents and languages
- Test AI profile generation with varied input types
- Validate cloud operations and credential handling

## Common Development Tasks

### Adding New AI Models
1. Add model validation to `gai_utils.py`
2. Implement model-specific client configuration
3. Test with both simple and structured outputs
4. Update allowed_models list

### Modifying Profile Schema
1. Update Pydantic models in `veer_client_utils.py`
2. Adjust the analysis prompt accordingly
3. Update frontend display logic in `profile_app.py`
4. Test with various transcript types

### Environment Setup
```bash
# Create virtual environment
python -m venv veer-venv
source veer-venv/bin/activate  # On Windows: veer-venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env  # Create and configure .env file
```

### Running the Applications

**Streamlit MVP:**
```bash
streamlit run profile_app.py
```

**Web App:**
```bash
cd web-app
npm start
# Opens at http://localhost:3000 with live reload
```

**Alternative (Python server):**
```bash
cd web-app
python3 -m http.server 3000
# Visit http://localhost:3000
```

## Known Issues & Considerations

### Streamlit MVP
- Audio recording compatibility varies across browsers
- Speech recognition accuracy depends on accent and background noise
- Large audio files need chunking for Google Speech Recognition API limits
- Profile generation quality depends on transcript clarity and detail

### Web App
- Uses mock data for chat and profiles (ready for backend integration)
- Speech-to-text currently uses placeholder implementation
- LocalStorage has size limitations for production use
- Requires HTTPS for microphone access in production

## Future Enhancements

### Immediate (Web App)
- Backend API integration for real data persistence
- WebSocket implementation for real-time chat
- Speech-to-text service integration (Google Cloud Speech, AWS Transcribe)
- User authentication and account management

### Long-term
- Mobile app development (React Native/Flutter)
- Advanced matching algorithm implementation
- Push notifications system
- Analytics dashboard and insights
- Video calling integration
- AI-powered goal recommendations

---

## IMPORTANT: Self-Updating Documentation

**This CLAUDE.md file should be intelligently updated by the AI agent working on this repository.** 

When you (Claude) learn new information about the codebase that either:
1. **Evolves your understanding** of how something works
2. **Corrects inaccurate information** in this documentation
3. **Adds significant new functionality** or architectural changes

You should **immediately update this CLAUDE.md file** to reflect the new understanding. This ensures that:
- Future sessions have accurate context
- The documentation stays current with the codebase
- Knowledge compounds over time rather than being lost

**Update triggers include:**
- Discovering new files or functionality
- Understanding complex integrations
- Identifying architectural patterns
- Finding configuration or setup details
- Learning about deployment or operational procedures
- Discovering testing approaches or requirements

**How to update:**
1. Read the current CLAUDE.md
2. Identify what needs to be changed/added
3. Update the file with new information
4. Keep the documentation concise but comprehensive
5. Maintain the same structure and style

This self-updating mechanism ensures this repository becomes increasingly well-documented and easier to work with over time.