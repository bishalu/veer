/* Goals Management JavaScript for Golo */

const GoalsManager = {
    goals: [],
    
    init() {
        this.loadMockData();
        this.setupEventListeners();
        this.renderGoals();
        this.updateInsights();
    },

    loadMockData() {
        // Mock goals data
        this.goals = [
            {
                id: 'startup-launch',
                title: 'Launch Tech Startup',
                description: 'Build and launch a SaaS platform for small businesses',
                status: 'in-progress',
                progress: 65,
                targetDate: '2024-12-31',
                createdDate: '2024-01-15',
                category: 'Business',
                connections: {
                    mentors: 3,
                    peers: 2
                },
                milestones: [
                    { title: 'Market Research', completed: true, date: '2024-02-01' },
                    { title: 'MVP Development', completed: true, date: '2024-04-15' },
                    { title: 'Beta Testing', completed: false, date: '2024-07-01' },
                    { title: 'Funding Round', completed: false, date: '2024-09-01' },
                    { title: 'Official Launch', completed: false, date: '2024-12-31' }
                ],
                tags: ['entrepreneurship', 'saas', 'technology', 'business']
            },
            {
                id: 'digital-marketing',
                title: 'Learn Digital Marketing',
                description: 'Master digital marketing skills for business growth',
                status: 'active',
                progress: 30,
                targetDate: '2024-03-31',
                createdDate: '2024-01-01',
                category: 'Education',
                connections: {
                    mentors: 1,
                    peers: 4
                },
                milestones: [
                    { title: 'SEO Fundamentals', completed: true, date: '2024-01-15' },
                    { title: 'Social Media Marketing', completed: true, date: '2024-02-01' },
                    { title: 'Email Marketing', completed: false, date: '2024-02-15' },
                    { title: 'Analytics & Reporting', completed: false, date: '2024-03-01' },
                    { title: 'Certification Exam', completed: false, date: '2024-03-31' }
                ],
                tags: ['marketing', 'skills', 'education', 'digital']
            },
            {
                id: 'professional-network',
                title: 'Build Professional Network',
                description: 'Expand professional network in the tech industry',
                status: 'planning',
                progress: 10,
                targetDate: 'ongoing',
                createdDate: '2024-01-20',
                category: 'Networking',
                connections: {
                    mentors: 1,
                    peers: 0
                },
                milestones: [
                    { title: 'Join Tech Communities', completed: true, date: '2024-01-25' },
                    { title: 'Attend Networking Events', completed: false, date: '2024-02-15' },
                    { title: 'Connect with 50 Professionals', completed: false, date: '2024-06-01' },
                    { title: 'Establish Mentorship', completed: false, date: '2024-04-01' }
                ],
                tags: ['networking', 'community', 'mentorship', 'professional']
            }
        ];

        this.saveToLocalStorage();
    },

    setupEventListeners() {
        // Add goal button
        const addGoalBtn = document.querySelector('.add-goal-btn');
        if (addGoalBtn) {
            addGoalBtn.addEventListener('click', () => this.showAddGoalModal());
        }

        // Goal action buttons will be added dynamically
    },

    renderGoals() {
        const goalsGrid = document.querySelector('.goals-grid');
        if (!goalsGrid) return;

        goalsGrid.innerHTML = this.goals.map(goal => this.createGoalCard(goal)).join('');

        // Add event listeners to goal cards
        this.setupGoalCardListeners();
    },

    createGoalCard(goal) {
        const progressColor = this.getProgressColor(goal.progress);
        const statusClass = goal.status.replace(' ', '-');
        
        return `
            <div class="goal-card" data-goal-id="${goal.id}">
                <div class="goal-header">
                    <h3>${goal.title}</h3>
                    <div class="goal-status ${statusClass}">${this.formatStatus(goal.status)}</div>
                </div>
                <div class="goal-description">
                    <p>${goal.description}</p>
                </div>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${goal.progress}%; background: ${progressColor}"></div>
                    </div>
                    <span class="progress-text">${goal.progress}% Complete</span>
                </div>
                <div class="goal-metrics">
                    <div class="metric">
                        <span class="metric-label">Target Date:</span>
                        <span class="metric-value">${this.formatTargetDate(goal.targetDate)}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Connections:</span>
                        <span class="metric-value">${goal.connections.mentors + goal.connections.peers} people</span>
                    </div>
                </div>
                <div class="goal-actions">
                    <button class="btn btn-outline btn-sm" onclick="GoalsManager.viewGoalDetails('${goal.id}')">
                        View Details
                    </button>
                    <button class="btn btn-primary btn-sm" onclick="GoalsManager.updateProgress('${goal.id}')">
                        Update Progress
                    </button>
                </div>
            </div>
        `;
    },

    setupGoalCardListeners() {
        // Add hover effects and interactions
        document.querySelectorAll('.goal-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Only trigger if not clicking on buttons
                if (!e.target.closest('button')) {
                    const goalId = card.getAttribute('data-goal-id');
                    this.viewGoalDetails(goalId);
                }
            });
        });
    },

    updateInsights() {
        const insights = this.calculateInsights();
        
        // Update overall progress
        const progressValue = document.querySelector('.insight-card .insight-value');
        if (progressValue) {
            progressValue.textContent = `${insights.averageProgress}%`;
        }

        // Update active connections
        const connectionsValues = document.querySelectorAll('.insight-card .insight-value');
        if (connectionsValues[1]) {
            connectionsValues[1].textContent = insights.totalConnections;
        }

        // Update goal streak (mock data)
        if (connectionsValues[2]) {
            connectionsValues[2].textContent = `${insights.goalStreak} days`;
        }
    },

    calculateInsights() {
        const totalProgress = this.goals.reduce((sum, goal) => sum + goal.progress, 0);
        const averageProgress = Math.round(totalProgress / this.goals.length);
        
        const totalConnections = this.goals.reduce((sum, goal) => 
            sum + goal.connections.mentors + goal.connections.peers, 0);
        
        // Mock goal streak calculation
        const goalStreak = 12; // This would be calculated based on actual activity

        return {
            averageProgress,
            totalConnections,
            goalStreak
        };
    },

    getProgressColor(progress) {
        if (progress < 25) return '#f44336'; // Red
        if (progress < 50) return '#FF9800'; // Orange
        if (progress < 75) return '#FFC107'; // Yellow
        return '#4CAF50'; // Green
    },

    formatStatus(status) {
        return status.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    },

    formatTargetDate(dateString) {
        if (dateString === 'ongoing') return 'Ongoing';
        
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'Overdue';
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays < 30) return `${diffDays} days`;
        
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
        });
    },

    viewGoalDetails(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return;

        // Create and show modal
        this.showGoalModal(goal);
    },

    showGoalModal(goal) {
        // Create modal HTML
        const modalHtml = `
            <div class="goal-modal show" id="goal-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${goal.title}</h3>
                        <button class="close-modal" onclick="GoalsManager.closeGoalModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="goal-detail-section">
                            <h4>Description</h4>
                            <p>${goal.description}</p>
                        </div>
                        
                        <div class="goal-detail-section">
                            <h4>Progress: ${goal.progress}%</h4>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${goal.progress}%; background: ${this.getProgressColor(goal.progress)}"></div>
                            </div>
                        </div>

                        <div class="goal-detail-section">
                            <h4>Milestones</h4>
                            <div class="milestones-list">
                                ${goal.milestones.map(milestone => `
                                    <div class="milestone-item ${milestone.completed ? 'completed' : ''}">
                                        <span class="milestone-status">${milestone.completed ? '✓' : '○'}</span>
                                        <span class="milestone-title">${milestone.title}</span>
                                        <span class="milestone-date">${new Date(milestone.date).toLocaleDateString()}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="goal-detail-section">
                            <h4>Connections</h4>
                            <p>Mentors: ${goal.connections.mentors} | Peers: ${goal.connections.peers}</p>
                        </div>

                        <div class="goal-detail-section">
                            <h4>Tags</h4>
                            <div class="goal-tags">
                                ${goal.tags.map(tag => `<span class="goal-tag">#${tag}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="GoalsManager.closeGoalModal()">Close</button>
                        <button class="btn btn-primary" onclick="GoalsManager.editGoal('${goal.id}')">Edit Goal</button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    closeGoalModal() {
        const modal = document.getElementById('goal-modal');
        if (modal) {
            modal.remove();
        }
    },

    updateProgress(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return;

        const newProgress = prompt(`Current progress: ${goal.progress}%\nEnter new progress (0-100):`, goal.progress);
        
        if (newProgress !== null) {
            const progress = parseInt(newProgress);
            if (progress >= 0 && progress <= 100) {
                goal.progress = progress;
                
                // Update status based on progress
                if (progress === 100) {
                    goal.status = 'completed';
                } else if (progress > 0) {
                    goal.status = 'in-progress';
                }
                
                this.saveToLocalStorage();
                this.renderGoals();
                this.updateInsights();
                
                showNotification(`Progress updated to ${progress}%`, 'success');
            } else {
                showNotification('Please enter a valid progress value (0-100)', 'error');
            }
        }
    },

    editGoal(goalId) {
        this.closeGoalModal();
        showNotification('Goal editing feature coming soon!', 'info');
    },

    showAddGoalModal() {
        showNotification('Add new goal feature coming soon!', 'info');
    },

    saveToLocalStorage() {
        try {
            localStorage.setItem('goloGoals', JSON.stringify(this.goals));
        } catch (e) {
            console.error('Error saving goals:', e);
        }
    },

    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem('goloGoals');
            if (saved) {
                this.goals = JSON.parse(saved);
                return true;
            }
        } catch (e) {
            console.error('Error loading goals:', e);
        }
        return false;
    }
};

// Initialize goals when needed
function initializeGoals() {
    // Try to load from localStorage first, fallback to mock data
    if (!GoalsManager.loadFromLocalStorage()) {
        GoalsManager.loadMockData();
    }
    
    GoalsManager.setupEventListeners();
    GoalsManager.renderGoals();
    GoalsManager.updateInsights();
}

// Add goals-specific styles
const goalsStyles = document.createElement('style');
goalsStyles.textContent = `
    .goal-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    }

    .modal-content {
        background: white;
        border-radius: var(--border-radius);
        padding: 2rem;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        animation: slideIn 0.3s ease;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideIn {
        from { transform: translateY(-20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border-color);
    }

    .close-modal {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: var(--secondary-color);
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }

    .goal-detail-section {
        margin-bottom: 1.5rem;
    }

    .goal-detail-section h4 {
        color: var(--secondary-color);
        margin-bottom: 0.75rem;
        font-size: 1rem;
    }

    .milestones-list {
        space-y: 0.5rem;
    }

    .milestone-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem;
        border-radius: var(--border-radius);
        background: var(--background-color);
        margin-bottom: 0.5rem;
    }

    .milestone-item.completed {
        background: rgba(76, 175, 80, 0.1);
        color: var(--success-color);
    }

    .milestone-status {
        font-weight: bold;
        font-size: 1.2rem;
        width: 20px;
        text-align: center;
    }

    .milestone-title {
        flex: 1;
    }

    .milestone-date {
        font-size: 0.9rem;
        color: var(--secondary-color);
    }

    .goal-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .goal-tag {
        background: var(--accent-color);
        color: var(--primary-color);
        padding: 0.25rem 0.75rem;
        border-radius: 15px;
        font-size: 0.9rem;
        font-weight: 500;
    }

    .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border-color);
    }

    .goal-card {
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .goal-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
    }

    .goal-actions button {
        transition: all 0.3s ease;
    }

    .goal-actions button:hover {
        transform: translateY(-1px);
    }
`;
document.head.appendChild(goalsStyles);