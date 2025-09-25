// Global variables
let dashboardData = {
    kpis: {
        leads: 247,
        deals: 43,
        revenue: 128500,
        tasks: 8
    },
    notifications: [
        { id: 1, type: 'urgent', icon: 'fa-exclamation-triangle', message: 'High-value deal closing tomorrow: ABC Corp - $50,000', time: '2 minutes ago' },
        { id: 2, type: 'normal', icon: 'fa-user-plus', message: 'New lead assigned: Sarah Wilson from TechStart', time: '1 hour ago' },
        { id: 3, type: 'normal', icon: 'fa-calendar', message: 'Meeting reminder: Client demo at 3:00 PM', time: '2 hours ago' },
        { id: 4, type: 'normal', icon: 'fa-clock', message: 'Overdue follow-up: GlobalTech proposal review', time: '1 day ago' },
        { id: 5, type: 'normal', icon: 'fa-envelope', message: 'Internal message: Team meeting scheduled for Friday', time: '2 days ago' }
    ]
};

let currentDropdown = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    setupEventListeners();
    renderCharts();
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute
});

function initializeDashboard() {
    updateKPIs();
    loadRecentActivities();
    setupNavigationHighlight();
    animateCounters();
}

function setupEventListeners() {
    // Navigation click events
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            handleNavigation(this.dataset.page);
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.user-profile') && !e.target.closest('.notifications')) {
            closeAllDropdowns();
        }
    });

    // Escape key to close modals and dropdowns
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllDropdowns();
            closeTaskModal();
        }
    });

    // Real-time search
    const searchInput = document.querySelector('.search-input');
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(this.value);
        }, 300);
    });
}

// Navigation functions
   
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        if (href === '#' || href.trim() === '') {
            // Only block navigation for placeholder links
            e.preventDefault();
            const page = this.dataset.page || 'unknown';
            console.log(`Navigating to ${page} (placeholder)`);
            // You can still add your page loading logic here if needed
        } else {
            // Let real links navigate normally
            console.log(`Opening: ${href}`);
        }
    });
});





// Dropdown functions
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    const isVisible = dropdown.classList.contains('show');
    
    closeAllDropdowns();
    
    if (!isVisible) {
        dropdown.classList.add('show');
        currentDropdown = 'user';
    }
}

function toggleNotifications() {
    const dropdown = document.getElementById('notificationsDropdown');
    const isVisible = dropdown.classList.contains('show');
    
    closeAllDropdowns();
    
    if (!isVisible) {
        dropdown.classList.add('show');
        currentDropdown = 'notifications';
    }
}

function closeAllDropdowns() {
    document.querySelectorAll('.user-dropdown, .notifications-dropdown').forEach(dropdown => {
        dropdown.classList.remove('show');
    });
    currentDropdown = null;
}

// User menu functions
function viewProfile() {
    closeAllDropdowns();
    showNotification('Opening user profile...', 'info');
}

function openSettings() {
    closeAllDropdowns();
    showNotification('Opening settings...', 'info');
}

function openHelp() {
    closeAllDropdowns();
    showNotification('Opening help center...', 'info');
}

function logout() {
    closeAllDropdowns();
    if (confirm('Are you sure you want to logout?')) {
        showNotification('Logging out...', 'info');
        // Redirect to login page
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
}

// Notification functions
function markAllRead() {
    dashboardData.notifications.forEach(notification => {
        notification.read = true;
    });
    
    const badge = document.getElementById('notificationCount');
    badge.textContent = '0';
    badge.style.display = 'none';
    
    closeAllDropdowns();
    showNotification('All notifications marked as read', 'success');
}

function viewNotification(id) {
    const notification = dashboardData.notifications.find(n => n.id === id);
    if (notification) {
        notification.read = true;
        updateNotificationBadge();
        closeAllDropdowns();
        showNotification(`Viewing: ${notification.message}`, 'info');
    }
}

function updateNotificationBadge() {
    const unreadCount = dashboardData.notifications.filter(n => !n.read).length;
    const badge = document.getElementById('notificationCount');
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'flex' : 'none';
}

// Search function
function performSearch(query) {
    if (query.length < 2) return;
    
    console.log(`Searching for: ${query}`);
    showNotification(`Searching for "${query}"...`, 'info');
    
    // Simulate search results
    setTimeout(() => {
        showNotification(`Found 12 results for "${query}"`, 'success');
    }, 1000);
}

// KPI functions
function updateKPIs() {
    const kpis = dashboardData.kpis;
    
    // Update KPI values with animation will be handled by animateCounters
    document.querySelector('.kpi-card.leads .kpi-value').textContent = '0';
    document.querySelector('.kpi-card.deals .kpi-value').textContent = '0';
    document.querySelector('.kpi-card.revenue .kpi-value').textContent = '$0';
    document.querySelector('.kpi-card.tasks .kpi-value').textContent = '0';
}

function animateCounters() {
    const kpis = dashboardData.kpis;
    
    animateCounter('.kpi-card.leads .kpi-value', 0, kpis.leads, 2000);
    animateCounter('.kpi-card.deals .kpi-value', 0, kpis.deals, 2000);
    animateCounter('.kpi-card.revenue .kpi-value', 0, kpis.revenue, 2000, true);
    animateCounter('.kpi-card.tasks .kpi-value', 0, kpis.tasks, 2000);
}

function animateCounter(selector, start, end, duration, isCurrency = false) {
    const element = document.querySelector(selector);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        
        const value = Math.floor(current);
        if (isCurrency) {
            element.textContent = `$${value.toLocaleString()}`;
        } else {
            element.textContent = value.toLocaleString();
        }
    }, 16);
}

// Pipeline functions
function viewPipelineStage(stage) {
    showNotification(`Viewing ${stage} deals...`, 'info');
    console.log(`Navigating to ${stage} pipeline stage`);
}

// Activity functions
function loadRecentActivities() {
    // Activities are already in HTML, but you could load them dynamically here
    console.log('Recent activities loaded');
}

function viewAllActivities() {
    showNotification('Loading all activities...', 'info');
    console.log('Navigating to all activities');
}

function viewActivityDetail(id) {
    showNotification(`Viewing activity details for ID: ${id}`, 'info');
    console.log(`Viewing activity ${id}`);
}

// Task functions
function toggleTask(id, completed) {
    const taskItem = document.getElementById(`task${id}`).closest('.task-item');
    
    if (completed) {
        taskItem.style.opacity = '0.6';
        taskItem.style.textDecoration = 'line-through';
        showNotification('Task marked as completed', 'success');
        
        setTimeout(() => {
            taskItem.style.opacity = '1';
            taskItem.style.textDecoration = 'none';
            document.getElementById(`task${id}`).checked = false;
        }, 2000);
    } else {
        taskItem.style.opacity = '1';
        taskItem.style.textDecoration = 'none';
    }
}

function addTask() {
    document.getElementById('taskModal').style.display = 'flex';
    document.getElementById('taskModal').classList.add('show');
    
    // Set default date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    
    const dateInput = document.getElementById('taskDate');
    dateInput.value = tomorrow.toISOString().slice(0, 16);
    
    document.getElementById('taskTitle').focus();
}

function saveTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const type = document.getElementById('taskType').value;
    const priority = document.getElementById('taskPriority').value;
    const date = document.getElementById('taskDate').value;
    const description = document.getElementById('taskDescription').value.trim();
    
    if (!title) {
        showNotification('Please enter a task title', 'error');
        return;
    }
    
    if (!date) {
        showNotification('Please select a due date', 'error');
        return;
    }
    
    // Here you would typically save to database
    console.log('Saving task:', { title, type, priority, date, description });
    
    closeTaskModal();
    showNotification('Task created successfully', 'success');
}

function closeTaskModal() {
    document.getElementById('taskModal').style.display = 'none';
    document.getElementById('taskModal').classList.remove('show');
    
    // Reset form
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskType').value = 'call';
    document.getElementById('taskPriority').value = 'medium';
    document.getElementById('taskDate').value = '';
    document.getElementById('taskDescription').value = '';
}

// Reports functions
function updateReports(timeframe) {
    showNotification(`Updating reports for ${timeframe}`, 'info');
    console.log(`Updating reports for timeframe: ${timeframe}`);
    
    // Here you would update the charts and data based on the selected timeframe
    setTimeout(() => {
        showNotification(`Reports updated for ${timeframe}`, 'success');
    }, 1000);
}

// Chart rendering (simplified - you would use Chart.js or similar library)
function renderCharts() {
    renderSalesChart();
    renderRevenueChart();
}

function renderSalesChart() {
    const canvas = document.getElementById('salesChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Simple bar chart simulation
    ctx.fillStyle = '#667eea';
    ctx.fillRect(50, 150, 40, 40);
    ctx.fillRect(100, 130, 40, 60);
    ctx.fillRect(150, 110, 40, 80);
    ctx.fillRect(200, 90, 40, 100);
    
    ctx.fillStyle = '#2c3e50';
    ctx.font = '12px Arial';
    ctx.fillText('Sales Performance Chart', 80, 20);
    ctx.fillText('(Placeholder)', 110, 35);
}

function renderRevenueChart() {
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Simple line chart simulation
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20, 120);
    ctx.lineTo(80, 100);
    ctx.lineTo(140, 80);
    ctx.lineTo(200, 60);
    ctx.lineTo(260, 40);
    ctx.stroke();
    
    ctx.fillStyle = '#2c3e50';
    ctx.font = '12px Arial';
    ctx.fillText('Revenue Trend', 110, 20);
}

// Quick Action functions
function addLead() {
    showNotification('Opening add lead form...', 'info');
    console.log('Navigating to add lead');
}

function addDeal() {
    showNotification('Opening add deal form...', 'info');
    console.log('Navigating to add deal');
}

function logActivity() {
    showNotification('Opening activity log...', 'info');
    console.log('Navigating to log activity');
}

function importData() {
    showNotification('Opening data import wizard...', 'info');
    console.log('Opening import data');
}

function exportData() {
    showNotification('Preparing data export...', 'info');
    console.log('Exporting data');
    
    setTimeout(() => {
        showNotification('Data export completed', 'success');
    }, 2000);
}

function scheduleMeeting() {
    showNotification('Opening meeting scheduler...', 'info');
    console.log('Opening meeting scheduler');
}

// Utility functions
function updateDateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const dateString = now.toLocaleDateString([], {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
    
    // Update any date/time displays if they exist
    console.log(`Current time: ${timeString} on ${dateString}`);
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.toast-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `toast-notification toast-${type}`;
    notification.innerHTML = `
        <div class="toast-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Style notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 16px 20px;
        border-radius: 10px;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        max-width: 400px;
        transform: translateX(100%);
        transition: transform 0.4s ease;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 400);
        }
    }, 4000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

function getNotificationColor(type) {
    const colors = {
        success: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        error: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
        warning: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)',
        info: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    };
    return colors[type] || colors.info;
}

// Initialize notification badge
updateNotificationBadge();

// Simulate real-time updates
setInterval(() => {
    // Simulate new notifications occasionally
    if (Math.random() < 0.1) { // 10% chance every 30 seconds
        const newNotification = {
            id: Date.now(),
            type: 'normal',
            icon: 'fa-bell',
            message: 'New activity detected in your CRM',
            time: 'Just now'
        };
        dashboardData.notifications.unshift(newNotification);
        updateNotificationBadge();
    }
}, 30000);

console.log('CRM Dashboard initialized successfully');



























