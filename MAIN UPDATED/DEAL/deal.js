// Global variables
let deals = [];
let filteredDeals = [];
let currentDealId = null;
let currentView = 'list';
let sortColumn = null;
let sortDirection = 'asc';
let currentPage = 1;
const itemsPerPage = 10;
let currentActivityType = 'past';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSampleData();
});

function initializeApp() {
    showDealsList();
    updatePagination();
    setMinCloseDate();
}

function setupEventListeners() {
    // File upload
    const fileInput = document.getElementById('dealAttachments');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }

    // Drag and drop
    const uploadArea = document.querySelector('.file-upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('drop', handleFileDrop);
        uploadArea.addEventListener('dragleave', handleDragLeave);
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            closeAllDropdowns();
        }
    });

    // Form validation
    document.addEventListener('input', handleFormValidation);

    // Pipeline stage click events
    document.addEventListener('click', function(e) {
        if (e.target.closest('.pipeline-stage')) {
            const stage = e.target.closest('.pipeline-stage');
            const stageValue = stage.getAttribute('data-stage');
            document.getElementById('dealStage').value = stageValue;
            updatePipelineVisual(stageValue);
        }
    });
}

function setMinCloseDate() {
    const closeDateInput = document.getElementById('closeDate');
    if (closeDateInput) {
        const today = new Date().toISOString().split('T')[0];
        closeDateInput.min = today;
    }
}

// Navigation functions
function showDealsList() {
    document.getElementById('dealsList').style.display = 'block';
    document.getElementById('dealForm').style.display = 'none';
    currentView = 'list';
    renderDealsTable();
}

function createDeal() {
    currentDealId = null;
    resetDealForm();
    document.getElementById('formTitle').textContent = 'Create New Deal';
    document.getElementById('markWonBtn').style.display = 'none';
    document.getElementById('markLostBtn').style.display = 'none';
    document.getElementById('dealsList').style.display = 'none';
    document.getElementById('dealForm').style.display = 'block';
    currentView = 'form';
    updatePipelineVisual('Prospecting');
    loadRelatedDeals();
}

function editDeal(id) {
    currentDealId = id;
    const deal = deals.find(d => d.id === id);
    if (deal) {
        populateDealForm(deal);
        document.getElementById('formTitle').textContent = 'Edit Deal';
        document.getElementById('markWonBtn').style.display = 'inline-block';
        document.getElementById('markLostBtn').style.display = 'inline-block';
        document.getElementById('dealsList').style.display = 'none';
        document.getElementById('dealForm').style.display = 'block';
        currentView = 'form';
        updatePipelineVisual(deal.stage);
        updateDealInfo(deal);
        loadRelatedDeals(deal);
        loadActivities(deal);
    }
}

function viewDeal(id) {
    editDeal(id); // For now, view and edit are the same
}

function cancelForm() {
    showDealsList();
}

// CRUD Operations
function saveDeal() {
    if (!validateForm()) {
        return;
    }

    const formData = collectFormData();
    
    if (currentDealId) {
        // Update existing deal
        const dealIndex = deals.findIndex(d => d.id === currentDealId);
        if (dealIndex !== -1) {
            deals[dealIndex] = { 
                ...deals[dealIndex], 
                ...formData, 
                modified: new Date().toISOString()
            };
            showNotification('Deal updated successfully', 'success');
        }
    } else {
        // Create new deal
        const newDeal = {
            id: Date.now(),
            ...formData,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            activities: []
        };
        deals.push(newDeal);
        showNotification('Deal created successfully', 'success');
        currentDealId = newDeal.id;
    }
    
    saveToLocalStorage();
    updateDealInfo(deals.find(d => d.id === currentDealId));
}

function deleteDeal(id) {
    const deal = deals.find(d => d.id === id);
    if (deal) {
        document.getElementById('deleteDealName').textContent = deal.title;
        currentDealId = id;
        document.getElementById('deleteModal').style.display = 'flex';
    }
}

function confirmDelete() {
    if (currentDealId) {
        const dealIndex = deals.findIndex(d => d.id === currentDealId);
        if (dealIndex !== -1) {
            deals.splice(dealIndex, 1);
            saveToLocalStorage();
            showNotification('Deal deleted successfully', 'success');
            showDealsList();
        }
    }
    closeDeleteModal();
}

function duplicateDeal(id) {
    const deal = deals.find(d => d.id === id);
    if (deal) {
        const duplicatedDeal = {
            ...deal,
            id: Date.now(),
            title: deal.title + ' (Copy)',
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            activities: []
        };
        deals.push(duplicatedDeal);
        saveToLocalStorage();
        showNotification('Deal duplicated successfully', 'success');
        renderDealsTable();
    }
}

function markAsWon() {
    if (currentDealId) {
        const deal = deals.find(d => d.id === currentDealId);
        if (deal) {
            deal.stage = 'Won';
            deal.modified = new Date().toISOString();
            document.getElementById('dealStage').value = 'Won';
            updatePipelineVisual('Won');
            saveToLocalStorage();
            showNotification('Deal marked as Won!', 'success');
            
            // Add activity
            if (!deal.activities) deal.activities = [];
            deal.activities.push({
                id: Date.now(),
                type: 'Deal Won',
                description: 'Deal successfully closed and won',
                date: new Date().toISOString(),
                isPast: true
            });
        }
    }
}

function markAsLost() {
    if (currentDealId) {
        const deal = deals.find(d => d.id === currentDealId);
        if (deal) {
            deal.stage = 'Lost';
            deal.modified = new Date().toISOString();
            document.getElementById('dealStage').value = 'Lost';
            updatePipelineVisual('Lost');
            saveToLocalStorage();
            showNotification('Deal marked as Lost', 'info');
            
            // Add activity
            if (!deal.activities) deal.activities = [];
            deal.activities.push({
                id: Date.now(),
                type: 'Deal Lost',
                description: 'Deal marked as lost',
                date: new Date().toISOString(),
                isPast: true
            });
        }
    }
}

// Form handling
function collectFormData() {
    const attachments = Array.from(document.querySelectorAll('.file-item')).map(item => 
        item.querySelector('.file-name').textContent
    );

    return {
        title: document.getElementById('dealTitle').value.trim(),
        value: parseFloat(document.getElementById('dealValue').value) || 0,
        stage: document.getElementById('dealStage').value,
        closeDate: document.getElementById('closeDate').value,
        assignedOwner: document.getElementById('assignedOwner').value,
        priority: document.getElementById('priority').value,
        companyName: document.getElementById('companyName').value.trim(),
        primaryContact: document.getElementById('primaryContact').value.trim(),
        contactEmail: document.getElementById('contactEmail').value.trim(),
        contactPhone: document.getElementById('contactPhone').value.trim(),
        secondaryContacts: document.getElementById('secondaryContacts').value.trim(),
        winProbability: parseInt(document.getElementById('winProbability').value) || 0,
        grossMargin: parseFloat(document.getElementById('grossMargin').value) || 0,
        notes: document.getElementById('dealNotes').value.trim(),
        attachments: attachments
    };
}

function populateDealForm(deal) {
    document.getElementById('dealTitle').value = deal.title || '';
    document.getElementById('dealValue').value = deal.value || '';
    document.getElementById('dealStage').value = deal.stage || 'Prospecting';
    document.getElementById('closeDate').value = deal.closeDate || '';
    document.getElementById('assignedOwner').value = deal.assignedOwner || '';
    document.getElementById('priority').value = deal.priority || 'Medium';
    document.getElementById('companyName').value = deal.companyName || '';
    document.getElementById('primaryContact').value = deal.primaryContact || '';
    document.getElementById('contactEmail').value = deal.contactEmail || '';
    document.getElementById('contactPhone').value = deal.contactPhone || '';
    document.getElementById('secondaryContacts').value = deal.secondaryContacts || '';
    document.getElementById('winProbability').value = deal.winProbability || '';
    document.getElementById('grossMargin').value = deal.grossMargin || '';
    document.getElementById('dealNotes').value = deal.notes || '';
    
    // Populate attachments
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    if (deal.attachments && deal.attachments.length > 0) {
        deal.attachments.forEach(fileName => {
            addFileToList(fileName);
        });
    }
}

function resetDealForm() {
    document.getElementById('dealTitle').value = '';
    document.getElementById('dealValue').value = '';
    document.getElementById('dealStage').value = 'Prospecting';
    document.getElementById('closeDate').value = '';
    document.getElementById('assignedOwner').value = '';
    document.getElementById('priority').value = 'Medium';
    document.getElementById('companyName').value = '';
    document.getElementById('primaryContact').value = '';
    document.getElementById('contactEmail').value = '';
    document.getElementById('contactPhone').value = '';
    document.getElementById('secondaryContacts').value = '';
    document.getElementById('winProbability').value = '';
    document.getElementById('grossMargin').value = '';
    document.getElementById('dealNotes').value = '';
    document.getElementById('fileList').innerHTML = '';
    document.getElementById('dealAttachments').value = '';
    
    // Reset deal info
    document.getElementById('daysInStage').textContent = '-';
    document.getElementById('daysSinceCreated').textContent = '-';
    document.getElementById('lastActivity').textContent = '-';
    
    // Clear activities
    document.getElementById('pastTimeline').innerHTML = '<p>No past activities</p>';
    document.getElementById('upcomingTimeline').innerHTML = '<p>No upcoming activities</p>';
}

// Pipeline Visual Update
function updatePipelineVisual(currentStage) {
    const stages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Won'];
    const pipelineStages = document.querySelectorAll('.pipeline-stage');
    
    pipelineStages.forEach(stage => {
        const stageValue = stage.getAttribute('data-stage');
        stage.classList.remove('active', 'completed');
        
        if (stageValue === currentStage) {
            stage.classList.add('active');
        } else if (stages.indexOf(stageValue) < stages.indexOf(currentStage) && currentStage !== 'Lost') {
            stage.classList.add('completed');
        }
    });
}

// Deal Info Update
function updateDealInfo(deal) {
    if (!deal) return;
    
    const now = new Date();
    const created = new Date(deal.created);
    const modified = new Date(deal.modified);
    
    const daysSinceCreated = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    const daysSinceModified = Math.floor((now - modified) / (1000 * 60 * 60 * 24));
    
    document.getElementById('daysInStage').textContent = daysSinceModified + ' days';
    document.getElementById('daysSinceCreated').textContent = daysSinceCreated + ' days';
    
    const lastActivity = deal.activities && deal.activities.length > 0 
        ? deal.activities[deal.activities.length - 1] 
        : null;
    
    document.getElementById('lastActivity').textContent = lastActivity 
        ? `${lastActivity.type} (${formatDateShort(lastActivity.date)})` 
        : 'None';
}

// Activity Management
function switchActivityTab(tab) {
    currentActivityType = tab;
    
    // Update tab buttons
    document.querySelectorAll('.activity-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.activity-tab[data-tab="${tab}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.activity-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(tab === 'past' ? 'pastActivities' : 'upcomingActivities').classList.add('active');
}

function loadActivities(deal) {
    if (!deal.activities) deal.activities = [];
    
    const pastTimeline = document.getElementById('pastTimeline');
    const upcomingTimeline = document.getElementById('upcomingTimeline');
    
    const pastActivities = deal.activities.filter(a => a.isPast);
    const upcomingActivities = deal.activities.filter(a => !a.isPast);
    
    // Load past activities
    if (pastActivities.length === 0) {
        pastTimeline.innerHTML = '<p>No past activities</p>';
    } else {
        pastTimeline.innerHTML = pastActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${getActivityIcon(activity.type)}</div>
                <div class="activity-content-text">
                    <h5>${activity.type}</h5>
                    <p>${activity.description}</p>
                    <div class="activity-date">${formatDate(activity.date)}</div>
                </div>
            </div>
        `).join('');
    }
    
    // Load upcoming activities
    if (upcomingActivities.length === 0) {
        upcomingTimeline.innerHTML = '<p>No upcoming activities</p>';
    } else {
        upcomingTimeline.innerHTML = upcomingActivities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${getActivityIcon(activity.type)}</div>
                <div class="activity-content-text">
                    <h5>${activity.type}</h5>
                    <p>${activity.description}</p>
                    <div class="activity-date">${formatDate(activity.date)}</div>
                </div>
            </div>
        `).join('');
    }
}

function getActivityIcon(type) {
    const icons = {
        'Call': '📞',
        'Email': '📧',
        'Meeting': '👥',
        'Follow-up': '📅',
        'Proposal': '📄',
        'Deal Won': '🏆',
        'Deal Lost': '❌'
    };
    return icons[type] || '📋';
}

function addActivity() {
    document.getElementById('activityModalTitle').textContent = 'Add Activity';
    document.getElementById('activityModal').style.display = 'flex';
    
    // Set default date to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('activityDate').value = now.toISOString().slice(0, 16);
}

function addPastActivity() {
    currentActivityType = 'past';
    addActivity();
}

function scheduleActivity() {
    currentActivityType = 'upcoming';
    addActivity();
}

function saveActivity() {
    const type = document.getElementById('activityType').value;
    const date = document.getElementById('activityDate').value;
    const description = document.getElementById('activityDescription').value.trim();
    
    if (!type || !date || !description) {
        showNotification('Please fill in all activity fields', 'error');
        return;
    }
    
    if (currentDealId) {
        const deal = deals.find(d => d.id === currentDealId);
        if (deal) {
            if (!deal.activities) deal.activities = [];
            
            const isPast = new Date(date) < new Date();
            
            deal.activities.push({
                id: Date.now(),
                type: type,
                description: description,
                date: date,
                isPast: isPast
            });
            
            saveToLocalStorage();
            loadActivities(deal);
            closeActivityModal();
            showNotification('Activity added successfully', 'success');
        }
    }
}

function closeActivityModal() {
    document.getElementById('activityModal').style.display = 'none';
    document.getElementById('activityType').value = 'Call';
    document.getElementById('activityDate').value = '';
    document.getElementById('activityDescription').value = '';
}

// Related Deals
function loadRelatedDeals(currentDeal) {
    const relatedDealsContainer = document.getElementById('relatedDealsList');
    
    if (!currentDeal) {
        relatedDealsContainer.innerHTML = '<p>No related deals found</p>';
        return;
    }
    
    const relatedDeals = deals.filter(d => 
        d.id !== currentDeal.id && 
        (d.companyName === currentDeal.companyName || d.primaryContact === currentDeal.primaryContact)
    );
    
    if (relatedDeals.length === 0) {
        relatedDealsContainer.innerHTML = '<p>No related deals found</p>';
    } else {
        relatedDealsContainer.innerHTML = relatedDeals.map(deal => `
            <div class="related-deal-card" onclick="viewDeal(${deal.id})">
                <h6>${deal.title}</h6>
                <p>Value: $${deal.value.toLocaleString()}</p>
                <p>Stage: ${deal.stage}</p>
                <p>Close Date: ${formatDateShort(deal.closeDate)}</p>
            </div>
        `).join('');
    }
}

// Quick Actions
function callContact() {
    const phone = document.getElementById('contactPhone').value;
    if (phone) {
        window.open(`tel:${phone}`);
        
        // Add activity
        if (currentDealId) {
            const deal = deals.find(d => d.id === currentDealId);
            if (deal) {
                if (!deal.activities) deal.activities = [];
                deal.activities.push({
                    id: Date.now(),
                    type: 'Call',
                    description: `Called ${deal.primaryContact} at ${phone}`,
                    date: new Date().toISOString(),
                    isPast: true
                });
                saveToLocalStorage();
                loadActivities(deal);
            }
        }
    } else {
        showNotification('No phone number available', 'warning');
    }
}

function emailContact() {
    const email = document.getElementById('contactEmail').value;
    const subject = encodeURIComponent(`Regarding: ${document.getElementById('dealTitle').value}`);
    
    if (email) {
        window.open(`mailto:${email}?subject=${subject}`);
        
        // Add activity
        if (currentDealId) {
            const deal = deals.find(d => d.id === currentDealId);
            if (deal) {
                if (!deal.activities) deal.activities = [];
                deal.activities.push({
                    id: Date.now(),
                    type: 'Email',
                    description: `Sent email to ${deal.primaryContact} at ${email}`,
                    date: new Date().toISOString(),
                    isPast: true
                });
                saveToLocalStorage();
                loadActivities(deal);
            }
        }
    } else {
        showNotification('No email address available', 'warning');
    }
}

// Validation
function validateForm() {
    const requiredFields = [
        { id: 'dealTitle', name: 'Deal Title' },
        { id: 'dealValue', name: 'Deal Value' },
        { id: 'dealStage', name: 'Deal Stage' },
        { id: 'closeDate', name: 'Close Date' },
        { id: 'companyName', name: 'Company Name' },
        { id: 'primaryContact', name: 'Primary Contact' }
    ];
    
    let isValid = true;
    let firstErrorField = null;
    
    requiredFields.forEach(field => {
        const element = document.getElementById(field.id);
        const value = element.value.trim();
        
        if (!value) {
            element.style.borderColor = '#dc3545';
            element.style.boxShadow = '0 0 0 4px rgba(220, 53, 69, 0.1)';
            
            if (!firstErrorField) {
                firstErrorField = element;
            }
            isValid = false;
        } else {
            element.style.borderColor = '#e9ecef';
            element.style.boxShadow = '';
        }
    });
    
    // Deal value validation
    const dealValue = parseFloat(document.getElementById('dealValue').value);
    if (dealValue <= 0) {
        const element = document.getElementById('dealValue');
        element.style.borderColor = '#dc3545';
        element.style.boxShadow = '0 0 0 4px rgba(220, 53, 69, 0.1)';
        showNotification('Deal value must be greater than 0', 'error');
        isValid = false;
    }
    
    // Email validation
    const emailField = document.getElementById('contactEmail');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailField.value.trim() && !emailPattern.test(emailField.value.trim())) {
        emailField.style.borderColor = '#dc3545';
        emailField.style.boxShadow = '0 0 0 4px rgba(220, 53, 69, 0.1)';
        showNotification('Please enter a valid email address', 'error');
        isValid = false;
    }
    
    if (!isValid) {
        if (firstErrorField) {
            firstErrorField.focus();
        }
        showNotification('Please fill in all required fields', 'error');
    }
    
    return isValid;
}

function handleFormValidation(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        if (e.target.value.trim()) {
            e.target.style.borderColor = '#e9ecef';
            e.target.style.boxShadow = '';
        }
    }
}

// File handling
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        addFileToList(file.name);
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#667eea';
    e.currentTarget.style.background = 'linear-gradient(135deg, #f0f8ff 0%, #e6f2ff 100%)';
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#e9ecef';
    e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
}

function handleFileDrop(e) {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#e9ecef';
    e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
    
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
        addFileToList(file.name);
    });
}

function addFileToList(fileName) {
    const fileList = document.getElementById('fileList');
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `
        <span class="file-name">${fileName}</span>
        <button class="file-remove" onclick="removeFile(this)" title="Remove file">×</button>
    `;
    fileList.appendChild(fileItem);
}

function removeFile(button) {
    button.parentElement.remove();
}

// Table rendering
function renderDealsTable() {
    const tbody = document.getElementById('dealsTableBody');
    const emptyState = document.getElementById('emptyState');
    
    // Apply filters and search
    applyFilters();
    
    if (filteredDeals.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        updateRecordCount();
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedDeals = filteredDeals.slice(startIndex, endIndex);
    
    tbody.innerHTML = '';
    
    paginatedDeals.forEach(deal => {
        const row = document.createElement('tr');
        row.onclick = () => viewDeal(deal.id);
        
        row.innerHTML = `
            <td>${deal.title}</td>
            <td>${deal.companyName}</td>
            <td>$${deal.value.toLocaleString()}</td>
            <td><span class="stage-badge ${deal.stage.toLowerCase()}">${deal.stage}</span></td>
            <td>${formatDateShort(deal.closeDate)}</td>
            <td><span class="priority-badge ${deal.priority.toLowerCase()}">${deal.priority}</span></td>
            <td>${deal.assignedOwner || '-'}</td>
            <td class="actions-cell">
                <div class="dropdown">
                    <button class="action-btn" onclick="toggleActionMenu(event, ${deal.id})">⋯</button>
                    <div class="dropdown-menu" id="actionMenu${deal.id}">
                        <div class="dropdown-item" onclick="viewDeal(${deal.id})">View</div>
                        <div class="dropdown-item" onclick="editDeal(${deal.id})">Edit</div>
                        <div class="dropdown-item" onclick="duplicateDeal(${deal.id})">Duplicate</div>
                        <div class="dropdown-item danger" onclick="deleteDeal(${deal.id})">Delete</div>
                    </div>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    updateRecordCount();
    updatePagination();
}

// Search and filter functions
function searchDeals(query) {
    applyFilters();
    renderDealsTable();
}

function filterDeals() {
    currentPage = 1;
    applyFilters();
    renderDealsTable();
}

function applyFilters() {
    const searchQuery = document.querySelector('.search-input').value.toLowerCase().trim();
    const stageFilter = document.getElementById('stageFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    
    filteredDeals = deals.filter(deal => {
        const matchesSearch = !searchQuery || 
            deal.title.toLowerCase().includes(searchQuery) ||
            deal.companyName.toLowerCase().includes(searchQuery) ||
            deal.primaryContact.toLowerCase().includes(searchQuery) ||
            (deal.assignedOwner && deal.assignedOwner.toLowerCase().includes(searchQuery));
        
        const matchesStage = !stageFilter || deal.stage === stageFilter;
        const matchesPriority = !priorityFilter || deal.priority === priorityFilter;
        
        return matchesSearch && matchesStage && matchesPriority;
    });
}

// Sorting
function sortTable(columnIndex) {
    const columns = ['title', 'companyName', 'value', 'stage', 'closeDate', 'priority', 'assignedOwner'];
    const column = columns[columnIndex];
    
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }
    
    filteredDeals.sort((a, b) => {
        let valueA, valueB;
        
        if (column === 'value') {
            valueA = a[column] || 0;
            valueB = b[column] || 0;
        } else if (column === 'closeDate') {
            valueA = new Date(a[column] || '9999-12-31');
            valueB = new Date(b[column] || '9999-12-31');
        } else {
            valueA = (a[column] || '').toLowerCase();
            valueB = (b[column] || '').toLowerCase();
        }
        
        if (sortDirection === 'asc') {
            return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
            return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
    });
    
    renderDealsTable();
    updateSortIcons(columnIndex);
}

function updateSortIcons(activeColumn) {
    const sortIcons = document.querySelectorAll('.sort-icon');
    sortIcons.forEach((icon, index) => {
        if (index === activeColumn) {
            icon.textContent = sortDirection === 'asc' ? '↑' : '↓';
        } else {
            icon.textContent = '↕';
        }
    });
}

// Pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredDeals.length / itemsPerPage);
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
}

function updateRecordCount() {
    const startIndex = filteredDeals.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, filteredDeals.length);
    const total = filteredDeals.length;
    
    document.getElementById('recordCount').textContent = `${startIndex}-${endIndex} / ${total}`;
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderDealsTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(filteredDeals.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderDealsTable();
    }
}

// Action menu functions
function toggleActionMenu(event, id) {
    event.stopPropagation();
    closeAllDropdowns();
    currentDealId = id;
    const menu = document.getElementById(`actionMenu${id}`);
    if (menu) {
        menu.classList.toggle('show');
    }
}

function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove('show');
    });
}

// Modal functions
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    currentDealId = null;
}

// Export function
function exportDeals() {
    if (deals.length === 0) {
        showNotification('No deals to export', 'warning');
        return;
    }
    
    const csvContent = "data:text/csv;charset=utf-8," + 
        "Title,Company,Value,Stage,Close Date,Priority,Owner,Contact Email,Phone,Win Probability,Gross Margin,Created,Modified\n" +
        deals.map(deal => [
            deal.title,
            deal.companyName,
            deal.value,
            deal.stage,
            deal.closeDate,
            deal.priority,
            deal.assignedOwner || '',
            deal.contactEmail || '',
            deal.contactPhone || '',
            deal.winProbability || '',
            deal.grossMargin || '',
            deal.created,
            deal.modified
        ].map(field => `"${field}"`).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `deals_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Deals exported successfully', 'success');
}

// Local storage
function saveToLocalStorage() {
    localStorage.setItem('deals', JSON.stringify(deals));
}

function loadFromLocalStorage() {
    const savedDeals = localStorage.getItem('deals');
    if (savedDeals) {
        deals = JSON.parse(savedDeals);
    }
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDateShort(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
}

// Sample data
function loadSampleData() {
    loadFromLocalStorage();
    
    if (deals.length === 0) {
        deals = [
            {
                id: 1,
                title: 'ABC Corp – Website Redesign',
                value: 15000,
                stage: 'Proposal',
                closeDate: '2025-03-15',
                assignedOwner: 'John Smith',
                priority: 'High',
                companyName: 'ABC Corp',
                primaryContact: 'Sarah Wilson',
                contactEmail: 'sarah@abccorp.com',
                contactPhone: '+1-555-0123',
                secondaryContacts: 'Mike Johnson - CTO\nLisa Brown - Marketing Director',
                winProbability: 75,
                grossMargin: 40,
                notes: 'Customer is very interested in our modern design approach. Need to finalize pricing.',
                attachments: ['proposal_v2.pdf', 'design_mockups.zip'],
                created: '2025-01-15T10:30:00Z',
                modified: '2025-01-20T14:22:00Z',
                activities: [
                    {
                        id: 1,
                        type: 'Call',
                        description: 'Initial discovery call with Sarah Wilson',
                        date: '2025-01-15T10:30:00Z',
                        isPast: true
                    },
                    {
                        id: 2,
                        type: 'Email',
                        description: 'Sent detailed proposal',
                        date: '2025-01-18T09:15:00Z',
                        isPast: true
                    },
                    {
                        id: 3,
                        type: 'Meeting',
                        description: 'Follow-up meeting to discuss proposal',
                        date: '2025-02-01T14:00:00Z',
                        isPast: false
                    }
                ]
            },
            {
                id: 2,
                title: 'TechStart Inc – Mobile App Development',
                value: 35000,
                stage: 'Negotiation',
                closeDate: '2025-02-28',
                assignedOwner: 'Sarah Johnson',
                priority: 'High',
                companyName: 'TechStart Inc',
                primaryContact: 'David Chen',
                contactEmail: 'david@techstart.com',
                contactPhone: '+1-555-0456',
                secondaryContacts: 'Emma Rodriguez - Product Manager',
                winProbability: 85,
                grossMargin: 45,
                notes: 'Almost ready to close. Just finalizing timeline and payment terms.',
                attachments: ['contract_draft.pdf'],
                created: '2025-01-10T11:00:00Z',
                modified: '2025-01-22T16:30:00Z',
                activities: [
                    {
                        id: 4,
                        type: 'Meeting',
                        description: 'Kickoff meeting with development team',
                        date: '2025-01-25T10:00:00Z',
                        isPast: false
                    }
                ]
            },
            {
                id: 3,
                title: 'GlobalTech – ERP Integration',
                value: 75000,
                stage: 'Qualification',
                closeDate: '2025-04-30',
                assignedOwner: 'Michael Chen',
                priority: 'Medium',
                companyName: 'GlobalTech Solutions',
                primaryContact: 'Robert Martinez',
                contactEmail: 'robert@globaltech.com',
                contactPhone: '+1-555-0789',
                secondaryContacts: '',
                winProbability: 45,
                grossMargin: 35,
                notes: 'Large enterprise deal. Still in early stages of qualification.',
                attachments: ['requirements_doc.pdf'],
                created: '2025-01-12T09:45:00Z',
                modified: '2025-01-19T13:10:00Z',
                activities: []
            }
        ];
        saveToLocalStorage();
    }
    
    renderDealsTable();
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style notification
    notification.style.cssText = `
        position: fixed;
        top: 25px;
        right: 25px;
        padding: 18px 30px;
        border-radius: 10px;
        color: white;
        font-size: 14px;
        font-weight: 600;
        z-index: 3000;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.4s ease;
        max-width: 400px;
        word-wrap: break-word;
    `;
    
    // Set background color based on type
    const colors = {
        success: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
        error: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
        info: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        warning: 'linear-gradient(135deg, #ffc107 0%, #fd7e14 100%)'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 400);
    }, 5000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // ESC key
    if (e.key === 'Escape') {
        if (document.getElementById('deleteModal').style.display === 'flex') {
            closeDeleteModal();
        } else if (document.getElementById('activityModal').style.display === 'flex') {
            closeActivityModal();
        } else {
            closeAllDropdowns();
        }
    }
    
    // Ctrl+S to save
    if (e.ctrlKey && e.key === 's' && currentView === 'form') {
        e.preventDefault();
        saveDeal();
    }
    
    // Ctrl+N to create new deal
    if (e.ctrlKey && e.key === 'n' && currentView === 'list') {
        e.preventDefault();
        createDeal();
    }
});

// Initialize application
renderDealsTable();
