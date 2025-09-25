// Global variables
let showLeads = [];
let filteredShowLeads = [];
let currentEditingShowLead = null;
let currentDeleteShowLead = null;
let currentView = 'cards';
let currentPage = 1;
let itemsPerPage = 12;
let uploadedFiles = [];

// Sample data
const sampleShowLeads = [
    {
        id: 1,
        contactName: 'Jennifer Martinez',
        clientEmail: 'jennifer.martinez@techflow.com',
        jobTitle: 'VP of Marketing',
        clientPhone: '+1 (555) 234-5678',
        showName: 'CES Tech Expo 2024',
        showWebsite: 'https://www.ces.tech',
        showDate: '2024-01-10',
        attendeeCount: 15000,
        companyName: 'TechFlow Solutions',
        companyWebsite: 'https://www.techflow.com',
        companyCountry: 'USA',
        companyPhone: '+1 (555) 876-5432',
        leadSource: 'linkedin',
        leadPriority: 'high',
        emailMessage: 'Hi Jennifer,\n\nGreat meeting you at CES! I was impressed by your insights on marketing automation trends. As discussed, our platform could help TechFlow increase lead conversion by 40%.\n\nLooking forward to scheduling a demo next week.\n\nBest regards,\nSales Team',
        keyPoints: '• Interested in marketing automation\n• Budget approved for Q1\n• Decision maker\n• Current system lacks integration\n• Looking for 40% improvement in conversion',
        followUpDate: '2024-01-25',
        tags: 'hot-lead,decision-maker,budget-approved',
        createdDate: '2024-01-10',
        attachments: []
    },
    {
        id: 2,
        contactName: 'David Chen',
        clientEmail: 'david.chen@innovacorp.com',
        jobTitle: 'CTO',
        clientPhone: '+1 (650) 555-7890',
        showName: 'SaaS Summit San Francisco',
        showWebsite: 'https://www.saassummit.com',
        showDate: '2024-02-15',
        attendeeCount: 8000,
        companyName: 'InnovaCorp',
        companyWebsite: 'https://www.innovacorp.com',
        companyCountry: 'USA',
        companyPhone: '+1 (650) 555-4321',
        leadSource: 'email',
        leadPriority: 'medium',
        emailMessage: 'Hello David,\n\nThank you for visiting our booth at SaaS Summit. Your questions about API integration and scalability were spot on.\n\nAttached is the technical documentation you requested. Let\'s schedule a technical deep-dive session.\n\nBest,\nTechnical Sales Team',
        keyPoints: '• Technical decision maker\n• Needs API integration\n• Scalability is key concern\n• Evaluating multiple vendors\n• Timeline: Q2 2024',
        followUpDate: '2024-02-22',
        tags: 'technical-lead,api-integration,scalability',
        createdDate: '2024-02-15',
        attachments: []
    },
    {
        id: 3,
        contactName: 'Sarah Williams',
        clientEmail: 'sarah.williams@globaltrading.co.uk',
        jobTitle: 'Operations Director',
        clientPhone: '+44 20 7123 4567',
        showName: 'London Fintech Week',
        showWebsite: 'https://www.londonfintechweek.com',
        showDate: '2024-03-20',
        attendeeCount: 12000,
        companyName: 'Global Trading Ltd',
        companyWebsite: 'https://www.globaltrading.co.uk',
        companyCountry: 'GBR',
        companyPhone: '+44 20 7987 6543',
        leadSource: 'linkedin',
        leadPriority: 'urgent',
        emailMessage: 'Hi Sarah,\n\nFollowing our conversation at London Fintech Week about compliance automation, I\'ve attached our GDPR compliance guide.\n\nYour timeline for Q1 implementation is aggressive but achievable with our solution.\n\nShall we arrange a compliance-focused demo this week?\n\nRegards,\nCompliance Team',
        keyPoints: '• GDPR compliance urgent\n• Q1 implementation deadline\n• £500K budget allocated\n• Board pressure for quick solution\n• Compliance is top priority',
        followUpDate: '2024-03-22',
        tags: 'urgent,compliance,gdpr,q1-deadline',
        createdDate: '2024-03-20',
        attachments: []
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeShowLeads();
    loadSampleData();
    populateShowFilter();
    renderShowLeads();
    updateStats();
    setupEventListeners();
});

function initializeShowLeads() {
    console.log('Show Leads System initialized');
}

function setupEventListeners() {
    // Modal close events
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-overlay')) {
            closeAllModals();
        }
    });

    // Escape key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

function loadSampleData() {
    showLeads = [...sampleShowLeads];
    filteredShowLeads = [...showLeads];
}

function populateShowFilter() {
    const showFilter = document.getElementById('showFilter');
    const uniqueShows = [...new Set(showLeads.map(lead => lead.showName))];
    
    // Clear existing options except "All Shows"
    showFilter.innerHTML = '<option value="">All Shows</option>';
    
    uniqueShows.forEach(show => {
        const option = document.createElement('option');
        option.value = show;
        option.textContent = show;
        showFilter.appendChild(option);
    });
}

// Show Lead Management Functions
function addNewShowLead() {
    currentEditingShowLead = null;
    document.getElementById('showLeadModalTitle').textContent = 'Add New Show Lead';
    
    // Clear form
    clearShowLeadForm();
    
    const modal = document.getElementById('showLeadModal');
    modal.style.display = 'flex';
    modal.classList.add('show');
}

function editShowLead(leadId) {
    const lead = showLeads.find(l => l.id === leadId);
    if (!lead) return;
    
    currentEditingShowLead = lead;
    document.getElementById('showLeadModalTitle').textContent = 'Edit Show Lead';
    
    // Populate form
    populateShowLeadForm(lead);
    
    const modal = document.getElementById('showLeadModal');
    modal.style.display = 'flex';
    modal.classList.add('show');
}

function populateShowLeadForm(lead) {
    document.getElementById('contactName').value = lead.contactName || '';
    document.getElementById('clientEmail').value = lead.clientEmail || '';
    document.getElementById('jobTitle').value = lead.jobTitle || '';
    document.getElementById('clientPhone').value = lead.clientPhone || '';
    document.getElementById('showName').value = lead.showName || '';
    document.getElementById('showWebsite').value = lead.showWebsite || '';
    document.getElementById('showDate').value = lead.showDate || '';
    document.getElementById('attendeeCount').value = lead.attendeeCount || '';
    document.getElementById('companyName').value = lead.companyName || '';
    document.getElementById('companyWebsite').value = lead.companyWebsite || '';
    document.getElementById('companyCountry').value = lead.companyCountry || '';
    document.getElementById('companyPhone').value = lead.companyPhone || '';
    document.getElementById('leadSource').value = lead.leadSource || '';
    document.getElementById('leadPriority').value = lead.leadPriority || 'medium';
    document.getElementById('emailMessage').value = lead.emailMessage || '';
    document.getElementById('keyPoints').value = lead.keyPoints || '';
    document.getElementById('followUpDate').value = lead.followUpDate || '';
    document.getElementById('tags').value = lead.tags || '';
    
    // Handle attachments if any
    uploadedFiles = lead.attachments || [];
    updateUploadedFilesDisplay();
}

function clearShowLeadForm() {
    const form = document.getElementById('showLeadForm');
    form.reset();
    uploadedFiles = [];
    updateUploadedFilesDisplay();
}

function saveShowLead() {
    const formData = getShowLeadFormData();
    
    // Validation
    if (!formData.contactName || !formData.clientEmail || !formData.showName || !formData.companyName || !formData.companyCountry || !formData.leadSource || !formData.showDate) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (!isValidEmail(formData.clientEmail)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (currentEditingShowLead) {
        // Update existing show lead
        Object.assign(currentEditingShowLead, formData);
        showNotification('Show lead updated successfully', 'success');
    } else {
        // Add new show lead
        const newShowLead = {
            id: Date.now(),
            ...formData,
            createdDate: new Date().toISOString().split('T')[0],
            attachments: [...uploadedFiles]
        };
        
        showLeads.push(newShowLead);
        showNotification('Show lead added successfully', 'success');
    }
    
    closeShowLeadModal();
    populateShowFilter();
    filterShowLeads();
    updateStats();
}

function getShowLeadFormData() {
    return {
        contactName: document.getElementById('contactName').value.trim(),
        clientEmail: document.getElementById('clientEmail').value.trim(),
        jobTitle: document.getElementById('jobTitle').value.trim(),
        clientPhone: document.getElementById('clientPhone').value.trim(),
        showName: document.getElementById('showName').value.trim(),
        showWebsite: document.getElementById('showWebsite').value.trim(),
        showDate: document.getElementById('showDate').value,
        attendeeCount: parseInt(document.getElementById('attendeeCount').value) || 0,
        companyName: document.getElementById('companyName').value.trim(),
        companyWebsite: document.getElementById('companyWebsite').value.trim(),
        companyCountry: document.getElementById('companyCountry').value,
        companyPhone: document.getElementById('companyPhone').value.trim(),
        leadSource: document.getElementById('leadSource').value,
        leadPriority: document.getElementById('leadPriority').value,
        emailMessage: document.getElementById('emailMessage').value.trim(),
        keyPoints: document.getElementById('keyPoints').value.trim(),
        followUpDate: document.getElementById('followUpDate').value,
        tags: document.getElementById('tags').value.trim()
    };
}

function deleteShowLead(leadId) {
    const lead = showLeads.find(l => l.id === leadId);
    if (!lead) return;
    
    currentDeleteShowLead = {
        id: leadId,
        name: lead.contactName
    };
    
    document.getElementById('deleteItemName').textContent = `${lead.contactName} (${lead.showName})`;
    document.getElementById('deleteModal').style.display = 'flex';
}

function confirmDelete() {
    if (!currentDeleteShowLead) return;
    
    showLeads = showLeads.filter(lead => lead.id !== currentDeleteShowLead.id);
    showNotification('Show lead deleted successfully', 'success');
    
    closeDeleteModal();
    populateShowFilter();
    filterShowLeads();
    updateStats();
}

function viewShowLeadDetails(leadId) {
    const lead = showLeads.find(l => l.id === leadId);
    if (!lead) return;
    
    renderShowLeadDetails(lead);
    document.getElementById('showLeadDetailsModal').style.display = 'flex';
}

function renderShowLeadDetails(lead) {
    const content = document.getElementById('showLeadDetailsContent');
    const tags = lead.tags ? lead.tags.split(',').map(tag => tag.trim()) : [];
    
    content.innerHTML = `
        <div class="details-section">
            <h4><i class="fas fa-user"></i> Contact Information</h4>
            <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">${lead.contactName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${lead.clientEmail}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Job Title:</span>
                <span class="detail-value">${lead.jobTitle || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${lead.clientPhone || 'N/A'}</span>
            </div>
        </div>
        
        <div class="details-section">
            <h4><i class="fas fa-building"></i> Company Information</h4>
            <div class="detail-row">
                <span class="detail-label">Company:</span>
                <span class="detail-value">${lead.companyName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Website:</span>
                <span class="detail-value">${lead.companyWebsite || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Country:</span>
                <span class="detail-value">${lead.companyCountry}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Company Phone:</span>
                <span class="detail-value">${lead.companyPhone || 'N/A'}</span>
            </div>
        </div>
        
        <div class="details-section">
            <h4><i class="fas fa-calendar-alt"></i> Show Information</h4>
            <div class="detail-row">
                <span class="detail-label">Show Name:</span>
                <span class="detail-value">${lead.showName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Show Date:</span>
                <span class="detail-value">${formatDate(lead.showDate)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Show Website:</span>
                <span class="detail-value">${lead.showWebsite || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Attendees:</span>
                <span class="detail-value">${lead.attendeeCount ? lead.attendeeCount.toLocaleString() : 'N/A'}</span>
            </div>
        </div>
        
        <div class="details-section">
            <h4><i class="fas fa-info-circle"></i> Lead Details</h4>
            <div class="detail-row">
                <span class="detail-label">Source:</span>
                <span class="detail-value">${lead.leadSource}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Priority:</span>
                <span class="detail-value">${lead.leadPriority}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Follow-up Date:</span>
                <span class="detail-value">${lead.followUpDate ? formatDate(lead.followUpDate) : 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Created:</span>
                <span class="detail-value">${formatDate(lead.createdDate)}</span>
            </div>
        </div>
        
        ${lead.emailMessage ? `
        <div class="communication-section">
            <h4><i class="fas fa-envelope"></i> Email Communication</h4>
            <div class="message-content">${lead.emailMessage}</div>
        </div>
        ` : ''}
        
        ${lead.keyPoints ? `
        <div class="communication-section">
            <h4><i class="fas fa-key"></i> Key Points</h4>
            <div class="message-content">${lead.keyPoints}</div>
        </div>
        ` : ''}
        
        ${tags.length > 0 ? `
        <div class="communication-section">
            <h4><i class="fas fa-tags"></i> Tags</h4>
            <div class="tags-list">
                ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        </div>
        ` : ''}
    `;
}

// Rendering Functions
function renderShowLeads() {
    if (currentView === 'cards') {
        renderShowLeadsCards();
    } else {
        renderShowLeadsTable();
    }
    updatePagination();
}

function renderShowLeadsCards() {
    const grid = document.getElementById('showLeadsGrid');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageLeads = filteredShowLeads.slice(startIndex, endIndex);
    
    grid.innerHTML = '';
    
    pageLeads.forEach(lead => {
        const card = document.createElement('div');
        card.className = 'show-lead-card';
        card.onclick = () => viewShowLeadDetails(lead.id);
        
        card.innerHTML = `
            <div class="show-lead-card-header">
                <div class="lead-info">
                    <h3>${lead.contactName}</h3>
                    <p>${lead.jobTitle || 'No title specified'}</p>
                    <p class="company-name">${lead.companyName}</p>
                </div>
                <span class="lead-source-badge ${lead.leadSource}">${lead.leadSource}</span>
            </div>
            <div class="show-lead-card-body">
                <div class="show-info">
                    <h4><i class="fas fa-calendar-alt"></i> ${lead.showName}</h4>
                    <div class="detail-item">
                        <i class="fas fa-calendar"></i>
                        <span class="label">Date:</span>
                        <span class="show-date">${formatDate(lead.showDate)}</span>
                    </div>
                    ${lead.attendeeCount ? `
                        <div class="detail-item">
                            <i class="fas fa-users"></i>
                            <span class="label">Attendees:</span>
                            <span class="value">${lead.attendeeCount.toLocaleString()}</span>
                        </div>
                    ` : ''}
                </div>
                <div class="lead-details">
                    <div class="detail-item">
                        <i class="fas fa-envelope"></i>
                        <span class="label">Email:</span>
                        <span class="value">${lead.clientEmail}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-phone"></i>
                        <span class="label">Phone:</span>
                        <span class="value">${lead.clientPhone || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-globe"></i>
                        <span class="label">Country:</span>
                        <span class="value">${lead.companyCountry}</span>
                    </div>
                    ${lead.followUpDate ? `
                        <div class="detail-item">
                            <i class="fas fa-clock"></i>
                            <span class="label">Follow-up:</span>
                            <span class="value">${formatDate(lead.followUpDate)}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="show-lead-card-actions">
                <div class="card-actions-left">
                    <button class="action-btn edit" onclick="event.stopPropagation(); editShowLead(${lead.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="event.stopPropagation(); deleteShowLead(${lead.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
                <span class="priority-badge ${lead.leadPriority}">${lead.leadPriority}</span>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

function renderShowLeadsTable() {
    const tbody = document.getElementById('showLeadsTableBody');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageLeads = filteredShowLeads.slice(startIndex, endIndex);
    
    tbody.innerHTML = '';
    
    pageLeads.forEach(lead => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" value="${lead.id}" onchange="toggleShowLeadSelection()"></td>
            <td>${lead.contactName}</td>
            <td>${lead.clientEmail}</td>
            <td>${lead.jobTitle || 'N/A'}</td>
            <td>${lead.companyName}</td>
            <td>${lead.showName}</td>
            <td>${formatDate(lead.showDate)}</td>
            <td><span class="lead-source-badge ${lead.leadSource}">${lead.leadSource}</span></td>
            <td>${formatDate(lead.createdDate)}</td>
            <td>
                <div class="table-actions">
                    <button class="table-action-btn" onclick="viewShowLeadDetails(${lead.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="table-action-btn" onclick="editShowLead(${lead.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="table-action-btn" onclick="deleteShowLead(${lead.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// View Management
function switchView(view) {
    currentView = view;
    
    // Update view buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    // Update view containers
    document.querySelectorAll('.show-leads-cards-view, .show-leads-table-view').forEach(container => {
        container.classList.remove('active');
    });
    
    if (view === 'cards') {
        document.getElementById('cardsView').classList.add('active');
        itemsPerPage = 12;
    } else {
        document.getElementById('tableView').classList.add('active');
        itemsPerPage = 15;
    }
    
    currentPage = 1;
    renderShowLeads();
}

// Filtering and Sorting
function filterShowLeads() {
    const sourceFilter = document.getElementById('sourceFilter').value;
    const showFilter = document.getElementById('showFilter').value;
    const countryFilter = document.getElementById('countryFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    filteredShowLeads = showLeads.filter(lead => {
        let passesFilter = true;
        
        if (sourceFilter && lead.leadSource !== sourceFilter) {
            passesFilter = false;
        }
        
        if (showFilter && lead.showName !== showFilter) {
            passesFilter = false;
        }
        
        if (countryFilter && lead.companyCountry !== countryFilter) {
            passesFilter = false;
        }
        
        if (dateFilter) {
            const showDate = new Date(lead.showDate);
            const now = new Date();
            
            switch (dateFilter) {
                case 'upcoming':
                    if (showDate <= now) passesFilter = false;
                    break;
                case 'past':
                    if (showDate > now) passesFilter = false;
                    break;
                case 'this_month':
                    if (showDate.getMonth() !== now.getMonth() || showDate.getFullYear() !== now.getFullYear()) {
                        passesFilter = false;
                    }
                    break;
                case 'this_year':
                    if (showDate.getFullYear() !== now.getFullYear()) {
                        passesFilter = false;
                    }
                    break;
            }
        }
        
        return passesFilter;
    });
    
    currentPage = 1;
    renderShowLeads();
}

function resetFilters() {
    document.getElementById('sourceFilter').value = '';
    document.getElementById('showFilter').value = '';
    document.getElementById('countryFilter').value = '';
    document.getElementById('dateFilter').value = '';
    
    filteredShowLeads = [...showLeads];
    currentPage = 1;
    renderShowLeads();
    
    showNotification('Filters reset', 'info');
}

function sortShowLeads() {
    const sortBy = document.getElementById('sortBy').value;
    const [field, direction] = sortBy.split('_');
    
    filteredShowLeads.sort((a, b) => {
        let aValue, bValue;
        
        switch (field) {
            case 'name':
                aValue = a.contactName;
                bValue = b.contactName;
                break;
            case 'company':
                aValue = a.companyName;
                bValue = b.companyName;
                break;
            case 'created':
                aValue = new Date(a.createdDate);
                bValue = new Date(b.createdDate);
                break;
            case 'show_date':
                aValue = new Date(a.showDate);
                bValue = new Date(b.showDate);
                break;
            default:
                aValue = a[field];
                bValue = b[field];
        }
        
        if (direction === 'asc') {
            return aValue.localeCompare ? aValue.localeCompare(bValue) : aValue - bValue;
        } else {
            return bValue.localeCompare ? bValue.localeCompare(aValue) : bValue - aValue;
        }
    });
    
    currentPage = 1;
    renderShowLeads();
}

function sortTable(column) {
    const currentSort = document.querySelector(`th[onclick*="${column}"]`).dataset.sort || 'asc';
    const newSort = currentSort === 'asc' ? 'desc' : 'asc';
    
    filteredShowLeads.sort((a, b) => {
        let aValue = a[column];
        let bValue = b[column];
        
        if (column === 'contactName' || column === 'companyName' || column === 'clientEmail') {
            aValue = aValue ? aValue.toLowerCase() : '';
            bValue = bValue ? bValue.toLowerCase() : '';
        }
        
        if (column === 'showDate' || column === 'createdDate') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }
        
        if (newSort === 'asc') {
            return aValue.localeCompare ? aValue.localeCompare(bValue) : aValue - bValue;
        } else {
            return bValue.localeCompare ? bValue.localeCompare(aValue) : bValue - aValue;
        }
    });
    
    document.querySelector(`th[onclick*="${column}"]`).dataset.sort = newSort;
    renderShowLeads();
}

// Search Function
function performSearch(query) {
    if (query.length < 2) {
        filteredShowLeads = [...showLeads];
    } else {
        filteredShowLeads = showLeads.filter(lead => {
            const searchText = `${lead.contactName} ${lead.clientEmail} ${lead.companyName} ${lead.jobTitle} ${lead.showName}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
        });
    }
    
    currentPage = 1;
    renderShowLeads();
}

// Bulk Operations
function selectAllShowLeads(checkbox) {
    const checkboxes = document.querySelectorAll('#showLeadsTableBody input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = checkbox.checked;
    });
    toggleShowLeadSelection();
}

function toggleShowLeadSelection() {
    const selectedCheckboxes = document.querySelectorAll('#showLeadsTableBody input[type="checkbox"]:checked');
    const bulkActions = document.getElementById('bulkActions');
    const selectedCount = document.querySelector('.selected-count');
    
    if (selectedCheckboxes.length > 0) {
        bulkActions.style.display = 'flex';
        selectedCount.textContent = `${selectedCheckboxes.length} lead${selectedCheckboxes.length > 1 ? 's' : ''} selected`;
    } else {
        bulkActions.style.display = 'none';
    }
}

function bulkEmailSelected() {
    const selectedCheckboxes = document.querySelectorAll('#showLeadsTableBody input[type="checkbox"]:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.value));
    
    if (selectedIds.length === 0) return;
    
    showNotification(`Email feature for ${selectedIds.length} leads coming soon`, 'info');
}

function bulkExportSelected() {
    const selectedCheckboxes = document.querySelectorAll('#showLeadsTableBody input[type="checkbox"]:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.value));
    
    if (selectedIds.length === 0) return;
    
    const selectedLeads = showLeads.filter(lead => selectedIds.includes(lead.id));
    const csvContent = convertToCSV(selectedLeads);
    downloadCSV(csvContent, 'selected_show_leads.csv');
    
    showNotification(`${selectedIds.length} leads exported successfully`, 'success');
}

function bulkDeleteShowLeads() {
    const selectedCheckboxes = document.querySelectorAll('#showLeadsTableBody input[type="checkbox"]:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.value));
    
    if (selectedIds.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedIds.length} show lead${selectedIds.length > 1 ? 's' : ''}?`)) {
        showLeads = showLeads.filter(lead => !selectedIds.includes(lead.id));
        showNotification(`${selectedIds.length} show leads deleted`, 'success');
        populateShowFilter();
        filterShowLeads();
        updateStats();
    }
}

// Pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredShowLeads.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, filteredShowLeads.length);
    
    document.getElementById('paginationStart').textContent = startIndex;
    document.getElementById('paginationEnd').textContent = endIndex;
    document.getElementById('paginationTotal').textContent = filteredShowLeads.length;
    
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;
    
    renderPaginationNumbers(totalPages);
}

function renderPaginationNumbers(totalPages) {
    const container = document.getElementById('paginationNumbers');
    container.innerHTML = '';
    
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => goToPage(i);
        container.appendChild(pageBtn);
    }
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredShowLeads.length / itemsPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        goToPage(newPage);
    }
}

function goToPage(page) {
    currentPage = page;
    renderShowLeads();
}

// File Upload
function selectEmailFile() {
    document.getElementById('emailAttachment').click();
}

function handleFileSelect(input) {
    const files = Array.from(input.files);
    
    files.forEach(file => {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            showNotification(`File ${file.name} is too large. Maximum size is 10MB.`, 'error');
            return;
        }
        
        const fileObj = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            file: file
        };
        uploadedFiles.push(fileObj);
    });
    
    updateUploadedFilesDisplay();
    input.value = ''; // Clear input
}

function updateUploadedFilesDisplay() {
    const container = document.getElementById('uploadedFiles');
    container.innerHTML = '';
    
    uploadedFiles.forEach(file => {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'uploaded-file';
        fileDiv.innerHTML = `
            <div class="file-info">
                <i class="fas fa-file"></i>
                <span>${file.name} (${formatFileSize(file.size)})</span>
            </div>
            <button class="remove-file" onclick="removeFile(${file.id})">×</button>
        `;
        container.appendChild(fileDiv);
    });
}

function removeFile(fileId) {
    uploadedFiles = uploadedFiles.filter(file => file.id !== fileId);
    updateUploadedFilesDisplay();
}

// Stats Update
function updateStats() {
    const totalShowLeads = showLeads.length;
    const activeShows = [...new Set(showLeads.map(lead => lead.showName))].length;
    const emailLeads = showLeads.filter(lead => lead.leadSource === 'email').length;
    const linkedinLeads = showLeads.filter(lead => lead.leadSource === 'linkedin').length;
    
    animateValue('totalShowLeads', totalShowLeads);
    animateValue('activeShows', activeShows);
    animateValue('emailLeads', emailLeads);
    animateValue('linkedinLeads', linkedinLeads);
}

function animateValue(elementId, endValue) {
    const element = document.getElementById(elementId);
    const startValue = parseInt(element.textContent) || 0;
    const duration = 1000;
    const step = (endValue - startValue) / (duration / 16);
    let currentValue = startValue;
    
    const timer = setInterval(() => {
        currentValue += step;
        if ((step > 0 && currentValue >= endValue) || (step < 0 && currentValue <= endValue)) {
            currentValue = endValue;
            clearInterval(timer);
        }
        element.textContent = Math.round(currentValue);
    }, 16);
}

// Modal Management
function closeShowLeadModal() {
    document.getElementById('showLeadModal').style.display = 'none';
    currentEditingShowLead = null;
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    currentDeleteShowLead = null;
}

function closeShowLeadDetailsModal() {
    document.getElementById('showLeadDetailsModal').style.display = 'none';
}

function editShowLeadFromDetails() {
    const leadId = currentEditingShowLead ? currentEditingShowLead.id : null;
    closeShowLeadDetailsModal();
    if (leadId) {
        editShowLead(leadId);
    }
}

function emailShowLead() {
    showNotification('Email feature coming soon', 'info');
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.style.display = 'none';
        modal.classList.remove('show');
    });
    currentEditingShowLead = null;
    currentDeleteShowLead = null;
}

// Import/Export Functions
function importShowLeads() {
    showNotification('Import show leads feature coming soon', 'info');
}

function exportShowLeads() {
    const csvContent = convertToCSV(showLeads);
    downloadCSV(csvContent, 'show_leads.csv');
    showNotification('Show leads exported successfully', 'success');
}

function convertToCSV(data) {
    const headers = [
        'Contact Name', 'Email', 'Job Title', 'Company', 'Country', 
        'Phone', 'Show Name', 'Show Date', 'Source', 'Priority', 'Created Date'
    ];
    
    const rows = data.map(lead => [
        lead.contactName,
        lead.clientEmail,
        lead.jobTitle || '',
        lead.companyName,
        lead.companyCountry || '',
        lead.clientPhone || '',
        lead.showName,
        lead.showDate,
        lead.leadSource,
        lead.leadPriority,
        lead.createdDate
    ]);
    
    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
        
    return csvContent;
}

function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Utility Functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    } catch (error) {
        return dateString;
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification System
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.toast-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `toast-notification toast-${type}`;
    notification.innerHTML = `
        <div class="toast-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
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
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
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

function toggleNotifications() {
    showNotification('Notifications feature coming soon', 'info');
}

function toggleUserMenu() {
    showNotification('User menu feature coming soon', 'info');
}

console.log('Show Leads Management System initialized successfully');
