class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupClock();
        this.setupProgressAnimations();
        this.setupCardHoverEffects();
        this.setupSystemStatusMonitor();
        this.setupNotificationSystem();
    }

    setupClock() {
        const updateClock = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString();
            const dateString = now.toLocaleDateString();
            document.getElementById('currentTime').textContent = `${timeString} | ${dateString}`;
        };
        
        updateClock();
        setInterval(updateClock, 1000);
    }

    setupProgressAnimations() {
        this.animateProgressBar('studentsProgress', 85);
        this.animateProgressBar('coursesProgress', 70);
        this.animateProgressBar('enrollmentsProgress', 92);
        this.animateProgressBar('revenueProgress', 78);
        this.animateProgressBar('completionRate', 88);
    }

    animateProgressBar(elementId, targetWidth) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let width = 0;
        const increment = targetWidth / 100;
        
        const animation = setInterval(() => {
            if (width >= targetWidth) {
                clearInterval(animation);
                return;
            }
            width += increment;
            element.style.width = width + '%';
        }, 20);
    }

    setupCardHoverEffects() {
        const cards = document.querySelectorAll('.dashboard-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.playHoverSound();
                this.addSparkleEffect(card);
            });
        });
    }

    playHoverSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    addSparkleEffect(element) {
        const sparkle = document.createElement('div');
        sparkle.innerHTML = '✨';
        sparkle.style.position = 'absolute';
        sparkle.style.top = Math.random() * 100 + '%';
        sparkle.style.left = Math.random() * 100 + '%';
        sparkle.style.fontSize = '20px';
        sparkle.style.pointerEvents = 'none';
        sparkle.style.animation = 'fadeInUp 1s ease-out forwards';
        
        element.style.position = 'relative';
        element.appendChild(sparkle);
        
        setTimeout(() => sparkle.remove(), 1000);
    }

    // System status monitor
    setupSystemStatusMonitor() {
        const statusElement = document.getElementById('systemStatus');
        let isOnline = true;
        
        setInterval(() => {
            if (Math.random() > 0.95) {
                isOnline = !isOnline;
                statusElement.textContent = isOnline ? 'System Online' : 'System Maintenance';
                statusElement.className = isOnline ? 'badge bg-success' : 'badge bg-warning';
            }
        }, 5000);
    }

    setupNotificationSystem() {
        setInterval(() => {
            this.updateNotificationBadge();
        }, 30000);
    }

    updateNotificationBadge() {
        const badge = document.getElementById('newEnrollmentsBadge');
        const currentCount = parseInt(badge.textContent) || 0;
        const newCount = currentCount + Math.floor(Math.random() * 3);
        
        badge.textContent = newCount;
        if (newCount > 0) {
            badge.style.display = 'flex';
        }
    }

    showLoading() {
        document.getElementById('loadingOverlay').classList.remove('d-none');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.add('d-none');
    }

    showSuccessAnimation(element) {
        element.style.animation = 'bounce 0.6s ease';
        setTimeout(() => {
            element.style.animation = '';
        }, 600);
    }

    showErrorAnimation(element) {
        element.style.animation = 'shake 0.5s ease';
        setTimeout(() => {
            element.style.animation = '';
        }, 500);
    }
}

const animationManager = new AnimationManager();

function showAlert(message, type = 'info', duration = 5000) {
    const alertContainer = document.getElementById('alertContainer') || createAlertContainer();
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.style.animation = 'slideInLeft 0.5s ease';
    
    const icons = {
        success: 'fas fa-check-circle',
        danger: 'fas fa-exclamation-triangle',
        warning: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle'
    };
    
    alert.innerHTML = `
        <i class="${icons[type] || icons.info}"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
        if (alert.parentNode) {
            alert.style.animation = 'fadeOut 0.5s ease';
            setTimeout(() => alert.remove(), 500);
        }
    }, duration);
}

function toggleDarkMode() {
    const body = document.body;
    const icon = document.getElementById('darkModeIcon');
    
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        icon.className = 'fas fa-sun';
        localStorage.setItem('darkMode', 'enabled');
    } else {
        icon.className = 'fas fa-moon';
        localStorage.setItem('darkMode', 'disabled');
    }
}

function exportData() {
    animationManager.showLoading();
    
    setTimeout(() => {
        const data = {
            students: currentStudents,
            courses: currentCourses,
            enrollments: currentEnrollments,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `course_registration_data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        animationManager.hideLoading();
        showAlert('Data exported successfully!', 'success');
    }, 2000);
}

async function refreshAll() {
    animationManager.showLoading();
    
    try {
        await loadDashboardStats();
        await loadStudents();
        await loadCourses();
        await loadEnrollments();
        
        animationManager.setupProgressAnimations();
        
        showAlert('All data refreshed successfully!', 'success');
    } catch (error) {
        showAlert('Failed to refresh data: ' + error.message, 'danger');
    } finally {
        animationManager.hideLoading();
    }
}

function showAnalytics() {
    showAlert('Advanced Analytics Dashboard - Coming Soon!', 'info');
}

const additionalCSS = `
@keyframes fadeOut {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(30px); }
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

.dark-mode {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%) !important;
    color: white;
}

.dark-mode .container {
    background: rgba(52, 73, 94, 0.95) !important;
    color: white;
}

.dark-mode .card {
    background: rgba(44, 62, 80, 0.8) !important;
    color: white;
}

.dark-mode .table {
    color: white;
}

.dark-mode .form-control, .dark-mode .form-select {
    background: rgba(52, 73, 94, 0.8);
    color: white;
    border-color: #495057;
}
`;

const style = document.createElement('style');
style.textContent = additionalCSS;
document.head.appendChild(style);

if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeIcon').className = 'fas fa-sun';
}
