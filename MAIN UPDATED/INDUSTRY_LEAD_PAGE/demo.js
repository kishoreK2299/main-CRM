// Global variables
let leads = [];
let filteredLeads = [];
let currentEditingLead = null;
let currentDeleteLead = null;
let currentView = 'cards';
let currentPage = 1;
let itemsPerPage = 12;
let uploadedFiles = [];

// Sample data
const sampleLeads = [
    {
        id: 1,
        contactName: 'John Smith',
        clientEmail: 'john.smith@techcorp.com',
        jobTitle: 'Marketing Director',
        companyName: 'TechCorp Industries',
        companyWebsite: 'https://www.techcorp.com',
        companyCountry: 'USA',
        clientPhone: '+1 (555) 123-4567',
        companyPhone: '+1 (555) 987-6543',
        showName: 'Tech Innovation Summit 2024',
        showWebsite: 'https://www.techsummit2024.com',
        showDate: '2024-03-15',
        attendeeCount: 500,
        leadSource: 'linkedin',
        leadStatus: 'qualified',
        isProspect: true,
        emailMessage: 'Hi John, I saw your presentation at the Tech Summit. Very impressive work on digital transformation. Would love to discuss how our solutions could help TechCorp scale further.',
        leadNotes: 'Strong lead from tech summit. Expressed interest in enterprise solutions.',
        createdDate: '2024-01-15',
        lastContactDate: '2024-01-20',
        attachments: []
    },
    {
        id: 2,
        contactName: 'Sarah Johnson',
        clientEmail: 'sarah.j@innovatetech.com',
        jobTitle: 'CEO',
        companyName: 'InnovateTech Solutions',
        companyWebsite: 'https://www.innovatetech.com',
        companyCountry: 'CAN',
        clientPhone: '+1 (416) 555-9876',
        companyPhone: '+1 (416) 555-1234',
        showName: 'Digital Marketing Expo',
        showWebsite: 'https://www.digitalmarketingexpo.com',
        showDate: '2024-02-20',
        attendeeCount: 300,
        leadSource: 'email',
        leadStatus: 'contacted',
        isProspect: false,
        emailMessage: 'Thanks for reaching out via email. Our company is indeed looking for better marketing automation tools.',
        leadNotes: 'Interested in marketing automation. Follow up in 2 weeks.',
        createdDate: '2024-01-10',
        lastContactDate: '2024-01-18',
        attachments: []
    },
    {
        id: 3,
        contactName: 'Mike Chen',
        clientEmail: 'mike.chen@growthcorp.com',
        jobTitle: 'CTO',
        companyName: 'GrowthCorp',
        companyWebsite: 'https://www.growthcorp.com',
        companyCountry: 'USA',
        clientPhone: '+1 (650) 555-2468',
        companyPhone: '+1 (650) 555-8642',
        showName: 'SaaS Connect Conference',
        showWebsite: 'https://www.saasconnect.com',
        showDate: '2024-04-10',
        attendeeCount: 750,
        leadSource: 'website',
        leadStatus: 'new',
        isProspect: false,
        emailMessage: 'Submitted contact form on website requesting demo of our platform.',
        leadNotes: 'New inquiry from website. Needs technical demo.',
        createdDate: '2024-01-25',
        lastContactDate: null,
        attachments: []
    }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeLeads();
    loadSampleData();
    renderLeads();
    updateStats();
    setupEventListeners();
});

function initializeLeads() {
    console.log('Industry Leads System initialized');
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
    leads = [...sampleLeads];
    filteredLeads = [...leads];
}

// Lead Management Functions
function addNewLead() {
    currentEditingLead = null;
    document.getElementById('leadModalTitle').textContent = 'Add New Lead';
    
    // Clear form
    clearLeadForm();
    
    const modal = document.getElementById('leadModal');
    modal.style.display = 'flex';
    modal.classList.add('show');
}

function editLead(leadId) {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    
    currentEditingLead = lead;
    document.getElementById('leadModalTitle').textContent = 'Edit Lead';
    
    // Populate form
    populateLeadForm(lead);
    
    const modal = document.getElementById('leadModal');
    modal.style.display = 'flex';
    modal.classList.add('show');
}

function populateLeadForm(lead) {
    document.getElementById('contactName').value = lead.contactName || '';
    document.getElementById('clientEmail').value = lead.clientEmail || '';
    document.getElementById('jobTitle').value = lead.jobTitle || '';
    document.getElementById('clientPhone').value = lead.clientPhone || '';
    document.getElementById('companyName').value = lead.companyName || '';
    document.getElementById('companyWebsite').value = lead.companyWebsite || '';
    document.getElementById('companyCountry').value = lead.companyCountry || '';
    document.getElementById('companyPhone').value = lead.companyPhone || '';
    document.getElementById('showName').value = lead.showName || '';
    document.getElementById('showWebsite').value = lead.showWebsite || '';
    document.getElementById('showDate').value = lead.showDate || '';
    document.getElementById('attendeeCount').value = lead.attendeeCount || '';
    document.getElementById('leadSource').value = lead.leadSource || '';
    document.getElementById('leadStatus').value = lead.leadStatus || 'new';
    document.getElementById('isProspect').checked = lead.isProspect || false;
    document.getElementById('emailMessage').value = lead.emailMessage || '';
    document.getElementById('leadNotes').value = lead.leadNotes || '';
}

function clearLeadForm() {
    const form = document.getElementById('leadForm');
    form.reset();
    uploadedFiles = [];
    updateUploadedFilesDisplay();
}

function saveLead() {
    const formData = getLeadFormData();
    
    // Validation
    if (!formData.contactName || !formData.clientEmail || !formData.companyName || !formData.leadSource) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (!isValidEmail(formData.clientEmail)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    if (currentEditingLead) {
        // Update existing lead
        Object.assign(currentEditingLead, formData);
        showNotification('Lead updated successfully', 'success');
    } else {
        // Add new lead
        const newLead = {
            id: Date.now(),
            ...formData,
            createdDate: new Date().toISOString().split('T')[0],
            lastContactDate: null,
            attachments: [...uploadedFiles]
        };
        
        leads.push(newLead);
        showNotification('Lead added successfully', 'success');
    }
    
    closeLeadModal();
    filterLeads();
    updateStats();
}

function getLeadFormData() {
    return {
        contactName: document.getElementById('contactName').value.trim(),
        clientEmail: document.getElementById('clientEmail').value.trim(),
        jobTitle: document.getElementById('jobTitle').value.trim(),
        clientPhone: document.getElementById('clientPhone').value.trim(),
        companyName: document.getElementById('companyName').value.trim(),
        companyWebsite: document.getElementById('companyWebsite').value.trim(),
        companyCountry: document.getElementById('companyCountry').value,
        companyPhone: document.getElementById('companyPhone').value.trim(),
        showName: document.getElementById('showName').value.trim(),
        showWebsite: document.getElementById('showWebsite').value.trim(),
        showDate: document.getElementById('showDate').value,
        attendeeCount: parseInt(document.getElementById('attendeeCount').value) || 0,
        leadSource: document.getElementById('leadSource').value,
        leadStatus: document.getElementById('leadStatus').value,
        isProspect: document.getElementById('isProspect').checked,
        emailMessage: document.getElementById('emailMessage').value.trim(),
        leadNotes: document.getElementById('leadNotes').value.trim()
    };
}

function deleteLead(leadId) {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    
    currentDeleteLead = {
        id: leadId,
        name: lead.contactName
    };
    
    document.getElementById('deleteItemName').textContent = lead.contactName;
    document.getElementById('deleteModal').style.display = 'flex';
}

function confirmDelete() {
    if (!currentDeleteLead) return;
    
    leads = leads.filter(lead => lead.id !== currentDeleteLead.id);
    showNotification('Lead deleted successfully', 'success');
    
    closeDeleteModal();
    filterLeads();
    updateStats();
}

function viewLeadDetails(leadId) {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    
    renderLeadDetails(lead);
    document.getElementById('leadDetailsModal').style.display = 'flex';
}

function renderLeadDetails(lead) {
    const content = document.getElementById('leadDetailsContent');
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
                <span class="detail-value">${lead.companyCountry || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Company Phone:</span>
                <span class="detail-value">${lead.companyPhone || 'N/A'}</span>
            </div>
        </div>
        
        <div class="details-section">
            <h4><i class="fas fa-calendar"></i> Event Information</h4>
            <div class="detail-row">
                <span class="detail-label">Show Name:</span>
                <span class="detail-value">${lead.showName || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Show Date:</span>
                <span class="detail-value">${formatDate(lead.showDate) || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Attendees:</span>
                <span class="detail-value">${lead.attendeeCount || 'N/A'}</span>
            </div>
        </div>
        
        <div class="details-section">
            <h4><i class="fas fa-info-circle"></i> Lead Status</h4>
            <div class="detail-row">
                <span class="detail-label">Source:</span>
                <span class="detail-value">${lead.leadSource}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">${lead.leadStatus}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Qualified Prospect:</span>
                <span class="detail-value">${lead.isProspect ? 'Yes' : 'No'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Created:</span>
                <span class="detail-value">${formatDate(lead.createdDate)}</span>
            </div>
        </div>
        
        ${lead.emailMessage ? `
        <div class="details-section" style="grid-column: 1 / -1;">
            <h4><i class="fas fa-envelope"></i> Email Communication</h4>
            <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 10px;">
                <p style="white-space: pre-wrap;">${lead.emailMessage}</p>
            </div>
        </div>
        ` : ''}
        
        ${lead.leadNotes ? `
        <div class="details-section" style="grid-column: 1 / -1;">
            <h4><i class="fas fa-sticky-note"></i> Notes</h4>
            <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 10px;">
                <p style="white-space: pre-wrap;">${lead.leadNotes}</p>
            </div>
        </div>
        ` : ''}
    `;
}

// Rendering Functions
function renderLeads() {
    if (currentView === 'cards') {
        renderLeadsCards();
    } else {
        renderLeadsTable();
    }
    updatePagination();
}

function renderLeadsCards() {
    const grid = document.getElementById('leadsGrid');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageLeads = filteredLeads.slice(startIndex, endIndex);
    
    grid.innerHTML = '';
    
    pageLeads.forEach(lead => {
        const card = document.createElement('div');
        card.className = 'lead-card';
        card.onclick = () => viewLeadDetails(lead.id);
        
        card.innerHTML = `
            <div class="lead-card-header">
                <div class="lead-info">
                    <h3>${lead.contactName}</h3>
                    <p>${lead.jobTitle || 'No title specified'}</p>
                    <p><strong>${lead.companyName}</strong></p>
                </div>
                <span class="lead-status ${lead.leadStatus}">${lead.leadStatus}</span>
            </div>
            <div class="lead-card-body">
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
                        <span class="value">${lead.companyCountry || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-calendar"></i>
                        <span class="label">Created:</span>
                        <span class="value">${formatDate(lead.createdDate)}</span>
                    </div>
                </div>
            </div>
            <div class="lead-card-actions">
                <div class="card-actions-left">
                    <button class="action-btn edit" onclick="event.stopPropagation(); editLead(${lead.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="action-btn delete" onclick="event.stopPropagation(); deleteLead(${lead.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
                <span class="lead-source-badge">${lead.leadSource}</span>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

function renderLeadsTable() {
    const tbody = document.getElementById('leadsTableBody');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageLeads = filteredLeads.slice(startIndex, endIndex);
    
    tbody.innerHTML = '';
    
    pageLeads.forEach(lead => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" value="${lead.id}" onchange="toggleLeadSelection()"></td>
            <td>${lead.contactName}</td>
            <td>${lead.jobTitle || 'N/A'}</td>
            <td>${lead.companyName}</td>
            <td>${lead.clientEmail}</td>
            <td>${lead.clientPhone || 'N/A'}</td>
            <td><span class="lead-source-badge">${lead.leadSource}</span></td>
            <td><span class="lead-status ${lead.leadStatus}">${lead.leadStatus}</span></td>
            <td>${formatDate(lead.createdDate)}</td>
            <td>
                <div class="table-actions">
                    <button class="table-action-btn" onclick="viewLeadDetails(${lead.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="table-action-btn" onclick="editLead(${lead.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="table-action-btn" onclick="deleteLead(${lead.id})" title="Delete">
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
    document.querySelectorAll('.leads-cards-view, .leads-table-view').forEach(container => {
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
    renderLeads();
}

// Filtering and Sorting
function filterLeads() {
    const sourceFilter = document.getElementById('sourceFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const countryFilter = document.getElementById('countryFilter').value;
    
    filteredLeads = leads.filter(lead => {
        return (!sourceFilter || lead.leadSource === sourceFilter) &&
               (!statusFilter || lead.leadStatus === statusFilter) &&
               (!countryFilter || lead.companyCountry === countryFilter);
    });
    
    currentPage = 1;
    renderLeads();
}

function resetFilters() {
    document.getElementById('sourceFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('countryFilter').value = '';
    
    filteredLeads = [...leads];
    currentPage = 1;
    renderLeads();
    
    showNotification('Filters reset', 'info');
}

function sortLeads() {
    const sortBy = document.getElementById('sortBy').value;
    const [field, direction] = sortBy.split('_');
    
    filteredLeads.sort((a, b) => {
        let aValue = a[field];
        let bValue = b[field];
        
        if (field === 'name') {
            aValue = a.contactName;
            bValue = b.contactName;
        } else if (field === 'company') {
            aValue = a.companyName;
            bValue = b.companyName;
        } else if (field === 'created') {
            aValue = new Date(a.createdDate);
            bValue = new Date(b.createdDate);
        }
        
        if (direction === 'asc') {
            return aValue.localeCompare ? aValue.localeCompare(bValue) : aValue - bValue;
        } else {
            return bValue.localeCompare ? bValue.localeCompare(aValue) : bValue - aValue;
        }
    });
    
    currentPage = 1;
    renderLeads();
}

function sortTable(column) {
    // Table sorting implementation
    const currentSort = document.querySelector(`th[onclick*="${column}"]`).dataset.sort || 'asc';
    const newSort = currentSort === 'asc' ? 'desc' : 'asc';
    
    filteredLeads.sort((a, b) => {
        let aValue = a[column];
        let bValue = b[column];
        
        if (column === 'contactName' || column === 'companyName' || column === 'email') {
            aValue = aValue ? aValue.toLowerCase() : '';
            bValue = bValue ? bValue.toLowerCase() : '';
        }
        
        if (newSort === 'asc') {
            return aValue.localeCompare ? aValue.localeCompare(bValue) : aValue - bValue;
        } else {
            return bValue.localeCompare ? bValue.localeCompare(aValue) : bValue - aValue;
        }
    });
    
    document.querySelector(`th[onclick*="${column}"]`).dataset.sort = newSort;
    renderLeads();
}

// Search Function
function performSearch(query) {
    if (query.length < 2) {
        filteredLeads = [...leads];
    } else {
        filteredLeads = leads.filter(lead => {
            const searchText = `${lead.contactName} ${lead.clientEmail} ${lead.companyName} ${lead.jobTitle}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
        });
    }
    
    currentPage = 1;
    renderLeads();
}

// Bulk Operations
function selectAllLeads(checkbox) {
    const checkboxes = document.querySelectorAll('#leadsTableBody input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = checkbox.checked;
    });
    toggleLeadSelection();
}

function toggleLeadSelection() {
    const selectedCheckboxes = document.querySelectorAll('#leadsTableBody input[type="checkbox"]:checked');
    const bulkActions = document.getElementById('bulkActions');
    const selectedCount = document.querySelector('.selected-count');
    
    if (selectedCheckboxes.length > 0) {
        bulkActions.style.display = 'flex';
        selectedCount.textContent = `${selectedCheckboxes.length} lead${selectedCheckboxes.length > 1 ? 's' : ''} selected`;
    } else {
        bulkActions.style.display = 'none';
    }
}

function bulkUpdateStatus(status) {
    const selectedCheckboxes = document.querySelectorAll('#leadsTableBody input[type="checkbox"]:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.value));
    
    selectedIds.forEach(id => {
        const lead = leads.find(l => l.id === id);
        if (lead) {
            lead.leadStatus = status;
        }
    });
    
    showNotification(`${selectedIds.length} leads updated to ${status}`, 'success');
    renderLeads();
    updateStats();
    toggleLeadSelection();
}

function bulkDeleteLeads() {
    const selectedCheckboxes = document.querySelectorAll('#leadsTableBody input[type="checkbox"]:checked');
    const selectedIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.value));
    
    if (selectedIds.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedIds.length} lead${selectedIds.length > 1 ? 's' : ''}?`)) {
        leads = leads.filter(lead => !selectedIds.includes(lead.id));
        showNotification(`${selectedIds.length} leads deleted`, 'success');
        filterLeads();
        updateStats();
    }
}

// Pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, filteredLeads.length);
    
    document.getElementById('paginationStart').textContent = startIndex;
    document.getElementById('paginationEnd').textContent = endIndex;
    document.getElementById('paginationTotal').textContent = filteredLeads.length;
    
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
    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
    const newPage = currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        goToPage(newPage);
    }
}

function goToPage(page) {
    currentPage = page;
    renderLeads();
}

// File Upload
function selectEmailFile() {
    document.getElementById('emailAttachment').click();
}

function handleFileSelect(input) {
    const files = Array.from(input.files);
    
    files.forEach(file => {
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
    const totalLeads = leads.length;
    const qualifiedLeads = leads.filter(lead => lead.isProspect || lead.leadStatus === 'qualified').length;
    const convertedLeads = leads.filter(lead => lead.leadStatus === 'converted').length;
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;
    
    animateValue('totalLeads', totalLeads);
    animateValue('qualifiedLeads', qualifiedLeads);
    animateValue('convertedLeads', convertedLeads);
    document.getElementById('conversionRate').textContent = `${conversionRate}%`;
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
function closeLeadModal() {
    document.getElementById('leadModal').style.display = 'none';
    currentEditingLead = null;
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    currentDeleteLead = null;
}

function closeLeadDetailsModal() {
    document.getElementById('leadDetailsModal').style.display = 'none';
}

function editLeadFromDetails() {
    const leadId = currentEditingLead ? currentEditingLead.id : null;
    closeLeadDetailsModal();
    if (leadId) {
        editLead(leadId);
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.style.display = 'none';
        modal.classList.remove('show');
    });
    currentEditingLead = null;
    currentDeleteLead = null;
}

// Import/Export Functions
function importLeads() {
    showNotification('Import leads feature coming soon', 'info');
}

function exportLeads() {
    const csvContent = convertToCSV(leads);
    downloadCSV(csvContent, 'industry_leads.csv');
    showNotification('Leads exported successfully', 'success');
}

function convertToCSV(data) {
    const headers = [
        'Contact Name', 'Email', 'Job Title', 'Company', 'Country', 
        'Phone', 'Source', 'Status', 'Created Date'
    ];
    
    const rows = data.map(lead => [
        lead.contactName,
        lead.clientEmail,
        lead.jobTitle || '',
        lead.companyName,
        lead.companyCountry || '',
        lead.clientPhone || '',
        lead.leadSource,
        lead.leadStatus,
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

console.log('Industry Leads Management System initialized successfully');
