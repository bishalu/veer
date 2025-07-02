/* Profile Creation JavaScript for Golo */

// Profile state management
const ProfileManager = {
    currentStep: 1,
    userName: '',
    transcript: '',
    generatedProfile: null,
    
    init() {
        this.setupStepNavigation();
        this.loadSavedData();
    },

    setupStepNavigation() {
        // Ensure we start on step 1
        this.showStep(1);
    },

    loadSavedData() {
        // Load any saved profile data
        const saved = localStorage.getItem('goloProfileProgress');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.userName = data.userName || '';
                this.transcript = data.transcript || '';
                
                // Update UI with saved data
                const nameInput = document.getElementById('user-name');
                if (nameInput) nameInput.value = this.userName;
                
                const transcriptArea = document.getElementById('transcript-text');
                if (transcriptArea) transcriptArea.value = this.transcript;
            } catch (e) {
                console.error('Error loading saved profile data:', e);
            }
        }
    },

    saveProgress() {
        const data = {
            userName: this.userName,
            transcript: this.transcript,
            currentStep: this.currentStep
        };
        localStorage.setItem('goloProfileProgress', JSON.stringify(data));
    },

    showStep(step) {
        // Hide all steps
        document.querySelectorAll('.step-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Show target step
        const targetStep = document.getElementById(`step-${step}`);
        if (targetStep) {
            targetStep.classList.add('active');
        }

        // Update step indicators
        document.querySelectorAll('.step').forEach((stepEl, index) => {
            stepEl.classList.remove('active', 'completed');
            if (index + 1 === step) {
                stepEl.classList.add('active');
            } else if (index + 1 < step) {
                stepEl.classList.add('completed');
            }
        });

        this.currentStep = step;
        this.saveProgress();
    }
};

// Initialize profile manager when tab is loaded
function initializeProfile() {
    ProfileManager.init();
}

// Step navigation functions
function nextStep() {
    const currentStep = ProfileManager.currentStep;
    
    if (currentStep === 1) {
        ProfileManager.showStep(2);
    } else if (currentStep === 2) {
        // Validate recording before proceeding
        if (!validateRecording()) {
            return;
        }
        ProfileManager.showStep(3);
        processAudioToText();
    } else if (currentStep === 3) {
        // Validate transcript
        if (!validateTranscript()) {
            return;
        }
        ProfileManager.showStep(4);
        // Don't auto-generate yet, wait for user to click generate
    }
}

function previousStep() {
    const currentStep = ProfileManager.currentStep;
    if (currentStep > 1) {
        ProfileManager.showStep(currentStep - 1);
    }
}

function validateRecording() {
    const nameInput = document.getElementById('user-name');
    const name = nameInput?.value.trim();
    
    if (!name) {
        showNotification('Please enter your name before continuing.', 'error');
        nameInput?.focus();
        return false;
    }
    
    if (!GoloApp.audioBlob) {
        showNotification('Please record your introduction before continuing.', 'error');
        return false;
    }
    
    ProfileManager.userName = name;
    return true;
}

function validateTranscript() {
    const transcriptArea = document.getElementById('transcript-text');
    const transcript = transcriptArea?.value.trim();
    
    if (!transcript) {
        showNotification('Please provide a transcript before continuing.', 'error');
        transcriptArea?.focus();
        return false;
    }
    
    ProfileManager.transcript = transcript;
    return true;
}

function processAudioToText() {
    const transcriptArea = document.getElementById('transcript-text');
    
    if (GoloApp.audioBlob) {
        // For now, we'll use a placeholder transcript
        // In a real implementation, you would send the audio to a speech-to-text service
        const placeholderTranscript = `My name is ${ProfileManager.userName}. I am currently working as a software developer in the San Francisco Bay Area. Originally from Nepal, I moved here about 3 years ago to pursue my career in technology.

My primary goal is to build a successful tech startup that creates meaningful impact. I'm particularly interested in developing solutions that can help connect communities and foster collaboration. My secondary goal is to expand my professional network and find mentors who can guide me through the entrepreneurship journey.

What motivates me is the potential to create something that can make a real difference in people's lives. I believe technology should bring people together, not isolate them. I'm also motivated by the opportunity to represent the Nepali community in the tech industry and hopefully inspire other young Nepalis to pursue their dreams.

The main challenges I'm facing include finding the right co-founder, securing initial funding, and balancing my full-time job while working on my startup idea. I also sometimes struggle with imposter syndrome, especially in networking events where I feel like I don't belong.

I think connecting with others through this platform could help me find mentors who have been through similar journeys, potential co-founders who share my vision, and a supportive community of people who understand the immigrant experience in tech. I'm particularly interested in meeting other Nepali entrepreneurs and professionals who can share their experiences and advice.`;
        
        transcriptArea.value = placeholderTranscript;
        ProfileManager.transcript = placeholderTranscript;
        ProfileManager.saveProgress();
        
        showNotification('Audio transcription completed!', 'success');
    } else {
        transcriptArea.value = '';
        showNotification('No audio recording found. Please record your introduction first.', 'error');
    }
}

function generateProfile() {
    if (!validateTranscript()) {
        return;
    }
    
    // Show loading state
    const profileDisplay = document.getElementById('profile-display');
    profileDisplay.innerHTML = '<div class="loading">Generating your profile... This may take a moment.</div>';
    
    // Simulate AI processing delay
    setTimeout(() => {
        const profile = createMockProfile();
        displayProfile(profile);
        ProfileManager.generatedProfile = profile;
        
        // Update global app state
        GoloApp.userProfile = {
            name: ProfileManager.userName,
            profile: profile,
            transcript: ProfileManager.transcript,
            createdAt: new Date().toISOString()
        };
        
        saveUserData();
        updateUserDisplay();
        showNotification('Profile generated successfully!', 'success');
    }, 2000);
}

function createMockProfile() {
    // This simulates the AI-generated profile based on the transcript
    return {
        outward_profile: {
            name: ProfileManager.userName,
            background: {
                origin: "Nepal",
                current_location: "San Francisco Bay Area",
                time_in_current_location: "3 years",
                profession: "Software Developer"
            },
            goals: [
                {
                    primary: "Build a successful tech startup with meaningful impact",
                    secondary: "Expand professional network and find entrepreneurship mentors"
                }
            ],
            motivations: [
                "Creating technology solutions that bring communities together",
                "Making a positive impact in people's lives through innovation",
                "Representing the Nepali community in the tech industry",
                "Inspiring other young Nepalis to pursue their dreams"
            ],
            challenges: [
                "Finding the right co-founder for startup venture",
                "Securing initial funding for business ideas",
                "Balancing full-time job with startup development",
                "Overcoming imposter syndrome in professional settings"
            ],
            connection_needs: [
                "Experienced entrepreneurs and startup mentors",
                "Potential co-founders with shared vision",
                "Nepali professionals and entrepreneurs",
                "Supportive community understanding immigrant experience"
            ],
            skills: [
                "Software Development",
                "Technology Innovation",
                "Cross-cultural Communication",
                "Problem Solving",
                "Community Building"
            ]
        },
        inward_profile: {
            personality_traits: {
                openness: "High - Shows strong interest in new experiences and innovation",
                conscientiousness: "High - Demonstrates goal-oriented behavior and planning",
                extraversion: "Moderate - Seeks connections but also introspective",
                agreeableness: "High - Expresses desire to help and connect with others",
                neuroticism: "Moderate - Some self-doubt but generally optimistic"
            },
            communication_style: {
                clarity: "High - Articulates goals and challenges clearly",
                authenticity: "High - Open about vulnerabilities and aspirations",
                detail_orientation: "Moderate - Provides specific examples and context"
            },
            psychological_insights: {
                identity_connection: "Strong connection to Nepali heritage while embracing American opportunities",
                motivational_drivers: "Purpose-driven with focus on community impact and representation",
                growth_mindset: "Strong - Actively seeking mentors and learning opportunities"
            },
            believability_assessment: {
                consistency: "High - Narrative flows logically with coherent goals",
                specificity: "Good - Provides concrete examples and timeframes",
                emotional_congruence: "High - Emotional tone matches stated challenges and aspirations"
            },
            potential_concerns: {
                imposter_syndrome: "May need confidence building and validation",
                work_life_balance: "Risk of burnout juggling multiple commitments"
            },
            matching_recommendations: {
                mentor_types: [
                    "Successful immigrant entrepreneurs",
                    "Tech startup founders with scaling experience",
                    "Nepali business leaders and professionals"
                ],
                peer_types: [
                    "Other aspiring entrepreneurs in tech",
                    "International professionals in similar transitions",
                    "Community-minded individuals seeking meaningful connections"
                ]
            }
        }
    };
}

function displayProfile(profile) {
    const profileDisplay = document.getElementById('profile-display');
    const outward = profile.outward_profile;
    const inward = profile.inward_profile;
    
    let html = `
        <div class="profile-section">
            <h4>${outward.name}</h4>
            <div class="profile-item">
                <strong>Background:</strong> Originally from ${outward.background.origin}, 
                currently in ${outward.background.current_location} for ${outward.background.time_in_current_location}
            </div>
            <div class="profile-item">
                <strong>Profession:</strong> ${outward.background.profession}
            </div>
        </div>

        <div class="profile-section">
            <h4>Goals</h4>
            ${outward.goals.map(goal => `
                <div class="profile-item">
                    <strong>Primary:</strong> ${goal.primary}<br>
                    <strong>Secondary:</strong> ${goal.secondary}
                </div>
            `).join('')}
        </div>

        <div class="profile-section">
            <h4>Motivations</h4>
            ${outward.motivations.map(motivation => `
                <div class="profile-item">• ${motivation}</div>
            `).join('')}
        </div>

        <div class="profile-section">
            <h4>Challenges</h4>
            ${outward.challenges.map(challenge => `
                <div class="profile-item">• ${challenge}</div>
            `).join('')}
        </div>

        <div class="profile-section">
            <h4>Looking to Connect With</h4>
            ${outward.connection_needs.map(need => `
                <div class="profile-item">• ${need}</div>
            `).join('')}
        </div>

        <div class="profile-section">
            <h4>Skills</h4>
            ${outward.skills.map(skill => `
                <div class="profile-item">• ${skill}</div>
            `).join('')}
        </div>

        <details class="profile-section" style="margin-top: 2rem;">
            <summary style="cursor: pointer; font-weight: bold; color: var(--secondary-color);">
                Internal Profile (For Matching Algorithm)
            </summary>
            <div style="margin-top: 1rem; padding: 1rem; background: var(--accent-color); border-radius: var(--border-radius);">
                <h5>Personality Traits</h5>
                ${Object.entries(inward.personality_traits).map(([trait, value]) => `
                    <div class="profile-item"><strong>${trait}:</strong> ${value}</div>
                `).join('')}
                
                <h5 style="margin-top: 1rem;">Matching Recommendations</h5>
                <div class="profile-item">
                    <strong>Ideal Mentors:</strong> ${inward.matching_recommendations.mentor_types.join(', ')}
                </div>
                <div class="profile-item">
                    <strong>Compatible Peers:</strong> ${inward.matching_recommendations.peer_types.join(', ')}
                </div>
            </div>
        </details>
    `;
    
    profileDisplay.innerHTML = html;
}

// Additional functions for profile management
function editTranscript() {
    ProfileManager.showStep(3);
}

function startOver() {
    if (confirm('Are you sure you want to start over? This will clear all your progress.')) {
        localStorage.removeItem('goloProfileProgress');
        ProfileManager.currentStep = 1;
        ProfileManager.userName = '';
        ProfileManager.transcript = '';
        ProfileManager.generatedProfile = null;
        
        // Clear form fields
        const nameInput = document.getElementById('user-name');
        const transcriptArea = document.getElementById('transcript-text');
        if (nameInput) nameInput.value = '';
        if (transcriptArea) transcriptArea.value = '';
        
        // Reset audio
        GoloApp.audioBlob = null;
        const audioPlayer = document.getElementById('audio-player-section');
        if (audioPlayer) audioPlayer.style.display = 'none';
        
        ProfileManager.showStep(1);
        showNotification('Profile creation reset. Starting over.', 'info');
    }
}

function goToDashboard() {
    showNotification('Profile creation completed! Welcome to Golo!', 'success');
    switchTab('goals'); // Switch to goals tab as the "dashboard"
}

// Initialize profile when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the profile tab
    if (document.getElementById('profile-tab')) {
        initializeProfile();
    }
});

// Add loading styles
const profileStyles = document.createElement('style');
profileStyles.textContent = `
    .loading {
        text-align: center;
        padding: 2rem;
        color: var(--secondary-color);
        font-style: italic;
    }

    .profile-section {
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border-color);
    }

    .profile-section:last-child {
        border-bottom: none;
    }

    .profile-section h4 {
        color: var(--primary-color);
        margin-bottom: 0.75rem;
        font-size: 1.1rem;
    }

    .profile-section h5 {
        color: var(--secondary-color);
        margin-bottom: 0.5rem;
        font-size: 1rem;
    }

    .profile-item {
        margin-bottom: 0.5rem;
        line-height: 1.5;
    }
`;
document.head.appendChild(profileStyles);