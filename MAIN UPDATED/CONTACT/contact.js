// Global variables
let contacts = [];
let filteredContacts = [];
let currentContactId = null;
let currentView = 'detail'; // 'list' or 'detail'
let sortColumn = null;
let sortDirection = 'asc';
let currentPage = 1;
const itemsPerPage = 10;
let currentFormMode = 'create'; // 'create' or 'edit'
let currentFormTab = 'basic';
let currentDeleteItem = null;
let timelineActivities = [];
let teamNotes = [];

// Sample contact data
const sampleContacts = [
    {
        id: 1,
        firstName: 'Sarah',
        lastName: 'Wilson',
        jobTitle: 'Sales Manager',
        companyName: 'TechCorp Solutions',
        contactOwner: 'John Smith',
        status: 'Customer',
        tags: ['VIP', 'High Value'],
        lastActivity: '2 days ago',
        primaryEmail: 'sarah.wilson@techcorp.com',
        secondaryEmail: 'sarah.w@gmail.com',
        workPhone: '+1-555-0123',
        mobilePhone: '+1-555-0456',
        faxNumber: '+1-555-0789',
        website: 'https://techcorp.com',
        addresses: {
            primary: {
                street: '123 Technology Drive, Suite 100',
                city: 'San Francisco',
                state: 'CA',
                zip: '94105',
                country: 'United States'
            },
            billing: 'Same as Primary Address',
            shipping: {
                street: '456 Shipping Lane',
                city: 'Oakland',
                state: 'CA',
                zip: '94601',
                country: 'United States'
            }
        },
        socialMedia: {
            linkedin: 'https://linkedin.com/in/sarahwilson',
            twitter: 'https://twitter.com/sarahw_tech',
            facebook: null,
            instagram: null
        },
        insights: {
            engagementScore: 85,
            lastContactDays: 2,
            preferredChannel: 'Email',
            conversionPotential: 'High',
            totalRevenue: 45000
        },
        compliance: {
            gdprConsent: true,
            marketingOptIn: true,
            preferredLanguage: 'English (US)',
            timezone: 'PST (UTC-8)'
        },
        created: '2024-01-15T10:30:00Z',
        modified: '2024-01-20T14:22:00Z'
    },
    {
        id: 2,
        firstName: 'Michael',
        lastName: 'Chen',
        jobTitle: 'CTO',
        companyName: 'InnovateTech Inc',
        contactOwner: 'Sarah Johnson',
        status: 'Prospect',
        tags: ['Tech Lead'],
        lastActivity: '1 week ago',
        primaryEmail: 'michael.chen@innovatetech.com',
        secondaryEmail: 'mchen@gmail.com',
        workPhone: '+1-555-1234',
        mobilePhone: '+1-555-5678',
        faxNumber: '',
        website: 'https://innovatetech.com',
        addresses: {
            primary: {
                street: '789 Innovation Blvd',
                city: 'Austin',
                state: 'TX',
                zip: '78701',
                country: 'United States'
            }
        },
        socialMedia: {
            linkedin: 'https://linkedin.com/in/michaelchen',
            twitter: null,
            facebook: null,
            instagram: null
        },
        insights: {
            engagementScore: 65,
            lastContactDays: 7,
            preferredChannel: 'Phone',
            conversionPotential: 'Medium',
            totalRevenue: 0
        },
        compliance: {
            gdprConsent: true,
            marketingOptIn: false,
            preferredLanguage: 'English (US)',
            timezone: 'CST (UTC-6)'
        },
        created: '2024-01-10T09:15:00Z',
        modified: '2024-01-18T11:45:00Z'
    },
    {
        id: 3,
        firstName: 'Emily',
        lastName: 'Rodriguez',
        jobTitle: 'Marketing Director',
        companyName: 'GrowthCorp',
        contactOwner: 'Mike Chen',
        status: 'Lead',
        tags: ['Marketing', 'New Business'],
        lastActivity: '3 days ago',
        primaryEmail: 'emily.rodriguez@growthcorp.com',
        secondaryEmail: '',
        workPhone: '+1-555-9876',
        mobilePhone: '+1-555-5432',
        faxNumber: '',
        website: 'https://growthcorp.com',
        addresses: {
            primary: {
                street: '456 Growth Street',
                city: 'Seattle',
                state: 'WA',
                zip: '98101',
                country: 'United States'
            }
        },
        socialMedia: {
            linkedin: 'https://linkedin.com/in/emilyrodriguez',
            twitter: 'https://twitter.com/emily_growth',
            facebook: null,
            instagram: null
        },
        insights: {
            engagementScore: 72,
            lastContactDays: 3,
            preferredChannel: 'Email',
            conversionPotential: 'High',
            totalRevenue: 0
        },
        compliance: {
            gdprConsent: true,
            marketingOptIn: true,
            preferredLanguage: 'English (US)',
            timezone: 'PST (UTC-8)'
        },
        created: '2024-01-22T08:45:00Z',
        modified: '2024-01-25T16:30:00Z'
    }
];

let currentActiveTab = {
    address: 'primary',
    related: 'deals'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeContacts();
    setupEventListeners();
    loadSampleData();
});

function initializeContacts() {
    showContactDetail();
    console.log('Contact Management System initialized');
}

function setupEventListeners() {
    // Close modals when clicking outside
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

    // Real-time search
    const searchInputs = document.querySelectorAll('.search-input');
    searchInputs.forEach(input => {
        let searchTimeout;
        input.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (currentView === 'list') {
                    searchContacts(this.value);
                } else {
                    performSearch(this.value);
                }
            }, 300);
        });
    });
}

// View Management
function showContactsList() {
    document.getElementById('contactsList').style.display = 'block';
    document.getElementById('contactDetail').style.display = 'none';
    currentView = 'list';
    renderContactsTable();
}

function showContactDetail(contactId = 1) {
    document.getElementById('contactsList').style.display = 'none';
    document.getElementById('contactDetail').style.display = 'block';
    currentView = 'detail';
    
    if (contactId) {
        currentContactId = contactId;
        loadContactData(contactId);
    }
}

// Sample Data Loading
function loadSampleData() {
    const savedContacts = localStorage.getItem('contacts');
    if (savedContacts) {
        contacts = JSON.parse(savedContacts);
    } else {
        contacts = [...sampleContacts];
        saveToLocalStorage();
    }
    
    // Load first contact by default
    if (contacts.length > 0) {
        showContactDetail(contacts[0].id);
    }
}

// Contact Data Management
function loadContactData(contactId) {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    
    currentContactId = contactId;
    
    // Update contact header
    document.getElementById('contactFullName').textContent = `${contact.firstName} ${contact.lastName}`;
    document.getElementById('contactJobTitle').textContent = contact.jobTitle || '';
    document.getElementById('contactCompanyLink').textContent = contact.companyName || '';
    document.getElementById('contactOwner').textContent = contact.contactOwner || '';
    document.getElementById('lastActivityDate').textContent = contact.lastActivity || '';
    
    // Update status badge
    const statusBadge = document.getElementById('contactStatusBadge');
    statusBadge.textContent = contact.status;
    statusBadge.className = `status-badge ${contact.status.toLowerCase()}`;
    
    // Update tags
    const tagBadges = document.getElementById('contactTagBadges');
    tagBadges.innerHTML = '';
    if (contact.tags && contact.tags.length > 0) {
        contact.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = `tag-badge ${tag.toLowerCase().replace(/\s+/g, '-')}`;
            tagElement.textContent = tag;
            tagBadges.appendChild(tagElement);
        });
    }
    
    // Update basic information
    document.getElementById('primaryEmail').textContent = contact.primaryEmail || '';
    document.getElementById('primaryEmail').href = `mailto:${contact.primaryEmail}`;
    document.getElementById('secondaryEmail').textContent = contact.secondaryEmail || 'Not provided';
    document.getElementById('workPhone').textContent = contact.workPhone || 'Not provided';
    document.getElementById('mobilePhone').textContent = contact.mobilePhone || 'Not provided';
    document.getElementById('faxNumber').textContent = contact.faxNumber || 'Not provided';
    
    const websiteElement = document.getElementById('websiteUrl');
    if (contact.website) {
        websiteElement.textContent = contact.website.replace(/^https?:\/\//, '');
        websiteElement.href = contact.website;
    } else {
        websiteElement.textContent = 'Not provided';
        websiteElement.removeAttribute('href');
    }
    
    // Update social media
    updateSocialMedia(contact);
    
    // Update breadcrumb
    document.getElementById('contactNameBreadcrumb').textContent = `${contact.firstName} ${contact.lastName}`;
    
    // Update insights
    updateInsights(contact);
}

function updateSocialMedia(contact) {
    const linkedinElement = document.getElementById('linkedinProfile');
    const twitterElement = document.getElementById('twitterHandle');
    const facebookElement = document.getElementById('facebookPage');
    const instagramElement = document.getElementById('instagramProfile');
    
    if (contact.socialMedia?.linkedin) {
        linkedinElement.textContent = contact.socialMedia.linkedin.replace('https://linkedin.com', '');
        linkedinElement.href = contact.socialMedia.linkedin;
        linkedinElement.className = '';
    } else {
        linkedinElement.textContent = 'Not provided';
        linkedinElement.className = 'no-link';
        linkedinElement.removeAttribute('href');
    }
    
    if (contact.socialMedia?.twitter) {
        twitterElement.textContent = contact.socialMedia.twitter.replace('https://twitter.com/', '@');
        twitterElement.href = contact.socialMedia.twitter;
        twitterElement.className = '';
    } else {
        twitterElement.textContent = 'Not provided';
        twitterElement.className = 'no-link';
        twitterElement.removeAttribute('href');
    }
    
    facebookElement.textContent = contact.socialMedia?.facebook || 'Not provided';
    instagramElement.textContent = contact.socialMedia?.instagram || 'Not provided';
}

function updateInsights(contact) {
    if (!contact.insights) return;
    
    const insights = contact.insights;
    
    // Update insight values
    const insightCards = document.querySelectorAll('.insight-card');
    if (insightCards.length >= 5) {
        insightCards[0].querySelector('.insight-value').textContent = `${insights.engagementScore}%`;
        insightCards[1].querySelector('.insight-value').textContent = `${insights.lastContactDays} days`;
        insightCards[2].querySelector('.insight-value').textContent = insights.preferredChannel;
        insightCards[3].querySelector('.insight-value').textContent = insights.conversionPotential;
        insightCards[4].querySelector('.insight-value').textContent = `$${insights.totalRevenue.toLocaleString()}`;
    }
}

// CRUD Operations
function createContact() {
    currentFormMode = 'create';
    currentContactId = null;
    resetContactForm();
    document.getElementById('contactFormTitle').textContent = 'Create New Contact';
    document.getElementById('contactFormModal').style.display = 'flex';
    document.getElementById('contactFormModal').classList.add('show');
    switchFormTab('basic');
    document.getElementById('editFirstName').focus();
}

function editContact() {
    if (!currentContactId) return;
    
    const contact = contacts.find(c => c.id === currentContactId);
    if (!contact) return;
    
    currentFormMode = 'edit';
    populateContactForm(contact);
    document.getElementById('contactFormTitle').textContent = 'Edit Contact';
    document.getElementById('contactFormModal').style.display = 'flex';
    document.getElementById('contactFormModal').classList.add('show');
    switchFormTab('basic');
    document.getElementById('editFirstName').focus();
}

function deleteContact() {
    if (!currentContactId) return;
    
    const contact = contacts.find(c => c.id === currentContactId);
    if (!contact) return;
    
    currentDeleteItem = {
        type: 'contact',
        id: currentContactId,
        name: `${contact.firstName} ${contact.lastName}`
    };
    
    document.getElementById('deleteType').textContent = 'contact';
    document.getElementById('deleteItemName').textContent = currentDeleteItem.name;
    document.getElementById('deleteModal').style.display = 'flex';
}

function saveContact() {
    if (!validateContactForm()) {
        return;
    }

    const formData = collectContactFormData();
    
    if (currentFormMode === 'edit' && currentContactId) {
        // Update existing contact
        const contactIndex = contacts.findIndex(c => c.id === currentContactId);
        if (contactIndex !== -1) {
            contacts[contactIndex] = { 
                ...contacts[contactIndex], 
                ...formData, 
                modified: new Date().toISOString()
            };
            showNotification('Contact updated successfully', 'success');
            loadContactData(currentContactId);
        }
    } else {
        // Create new contact
        const newContact = {
            id: Date.now(),
            ...formData,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            insights: {
                engagementScore: 0,
                lastContactDays: 0,
                preferredChannel: 'Email',
                conversionPotential: 'Low',
                totalRevenue: 0
            }
        };
        contacts.push(newContact);
        showNotification('Contact created successfully', 'success');
        currentContactId = newContact.id;
        loadContactData(currentContactId);
        showContactDetail(currentContactId);
    }
    
    saveToLocalStorage();
    closeContactFormModal();
}

function confirmDelete() {
    if (!currentDeleteItem) return;
    
    if (currentDeleteItem.type === 'contact') {
        const contactIndex = contacts.findIndex(c => c.id === currentDeleteItem.id);
        if (contactIndex !== -1) {
            contacts.splice(contactIndex, 1);
            saveToLocalStorage();
            showNotification('Contact deleted successfully', 'success');
            
            // Navigate to contacts list or load another contact
            if (contacts.length > 0) {
                showContactDetail(contacts[0].id);
            } else {
                showContactsList();
            }
        }
    } else if (currentDeleteItem.type === 'timeline') {
        // Handle timeline item deletion
        const timelineItem = document.querySelector(`.timeline-item[data-id="${currentDeleteItem.id}"]`);
        if (timelineItem) {
            timelineItem.remove();
            showNotification('Activity deleted successfully', 'success');
        }
    } else if (currentDeleteItem.type === 'note') {
        // Handle team note deletion
        const noteElement = document.querySelector(`.team-note[data-id="${currentDeleteItem.id}"]`);
        if (noteElement) {
            noteElement.remove();
            showNotification('Note deleted successfully', 'success');
        }
    }
    
    closeDeleteModal();
}

// Form Management
function collectContactFormData() {
    const tags = document.getElementById('editTags').value.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    return {
        firstName: document.getElementById('editFirstName').value.trim(),
        lastName: document.getElementById('editLastName').value.trim(),
        jobTitle: document.getElementById('editJobTitle').value.trim(),
        companyName: document.getElementById('editCompanyName').value.trim(),
        contactOwner: document.getElementById('editContactOwner').value,
        status: document.getElementById('editContactStatus').value,
        primaryEmail: document.getElementById('editPrimaryEmail').value.trim(),
        secondaryEmail: document.getElementById('editSecondaryEmail').value.trim(),
        workPhone: document.getElementById('editWorkPhone').value.trim(),
        mobilePhone: document.getElementById('editMobilePhone').value.trim(),
        faxNumber: document.getElementById('editFaxNumber').value.trim(),
        website: document.getElementById('editWebsite').value.trim(),
        tags: tags,
        addresses: {
            primary: {
                street: document.getElementById('editPrimaryStreet').value.trim(),
                city: document.getElementById('editPrimaryCity').value.trim(),
                state: document.getElementById('editPrimaryState').value.trim(),
                zip: document.getElementById('editPrimaryZip').value.trim(),
                country: document.getElementById('editPrimaryCountry').value
            },
            billing: document.getElementById('sameBillingAddress').checked ? 'Same as Primary Address' : {
                street: document.getElementById('editBillingStreet').value.trim(),
                city: document.getElementById('editBillingCity').value.trim(),
                state: document.getElementById('editBillingState').value.trim(),
                zip: document.getElementById('editBillingZip').value.trim(),
                country: document.getElementById('editBillingCountry').value
            }
        },
        socialMedia: {
            linkedin: document.getElementById('editLinkedin').value.trim(),
            twitter: document.getElementById('editTwitter').value.trim(),
            facebook: document.getElementById('editFacebook').value.trim(),
            instagram: document.getElementById('editInstagram').value.trim()
        },
        compliance: {
            gdprConsent: document.getElementById('editGdprConsent').checked,
            marketingOptIn: document.getElementById('editMarketingOptIn').checked,
            preferredLanguage: document.getElementById('editPreferredLanguage').value,
            timezone: document.getElementById('editTimezone').value
        },
        lastActivity: 'Just now'
    };
}

function populateContactForm(contact) {
    document.getElementById('editFirstName').value = contact.firstName || '';
    document.getElementById('editLastName').value = contact.lastName || '';
    document.getElementById('editJobTitle').value = contact.jobTitle || '';
    document.getElementById('editCompanyName').value = contact.companyName || '';
    document.getElementById('editContactOwner').value = contact.contactOwner || '';
    document.getElementById('editContactStatus').value = contact.status || '';
    document.getElementById('editPrimaryEmail').value = contact.primaryEmail || '';
    document.getElementById('editSecondaryEmail').value = contact.secondaryEmail || '';
    document.getElementById('editWorkPhone').value = contact.workPhone || '';
    document.getElementById('editMobilePhone').value = contact.mobilePhone || '';
    document.getElementById('editFaxNumber').value = contact.faxNumber || '';
    document.getElementById('editWebsite').value = contact.website || '';
    document.getElementById('editTags').value = contact.tags ? contact.tags.join(', ') : '';
    
    // Address information
    if (contact.addresses?.primary) {
        document.getElementById('editPrimaryStreet').value = contact.addresses.primary.street || '';
        document.getElementById('editPrimaryCity').value = contact.addresses.primary.city || '';
        document.getElementById('editPrimaryState').value = contact.addresses.primary.state || '';
        document.getElementById('editPrimaryZip').value = contact.addresses.primary.zip || '';
        document.getElementById('editPrimaryCountry').value = contact.addresses.primary.country || '';
    }
    
    // Billing address
    if (contact.addresses?.billing === 'Same as Primary Address') {
        document.getElementById('sameBillingAddress').checked = true;
        toggleBillingAddress();
    } else if (contact.addresses?.billing && typeof contact.addresses.billing === 'object') {
        document.getElementById('sameBillingAddress').checked = false;
        document.getElementById('editBillingStreet').value = contact.addresses.billing.street || '';
        document.getElementById('editBillingCity').value = contact.addresses.billing.city || '';
        document.getElementById('editBillingState').value = contact.addresses.billing.state || '';
        document.getElementById('editBillingZip').value = contact.addresses.billing.zip || '';
        document.getElementById('editBillingCountry').value = contact.addresses.billing.country || '';
    }
    
    // Social media
    if (contact.socialMedia) {
        document.getElementById('editLinkedin').value = contact.socialMedia.linkedin || '';
        document.getElementById('editTwitter').value = contact.socialMedia.twitter || '';
        document.getElementById('editFacebook').value = contact.socialMedia.facebook || '';
        document.getElementById('editInstagram').value = contact.socialMedia.instagram || '';
    }
    
    // Compliance
    if (contact.compliance) {
        document.getElementById('editGdprConsent').checked = contact.compliance.gdprConsent || false;
        document.getElementById('editMarketingOptIn').checked = contact.compliance.marketingOptIn || false;
        document.getElementById('editPreferredLanguage').value = contact.compliance.preferredLanguage || 'English (US)';
        document.getElementById('editTimezone').value = contact.compliance.timezone || 'PST (UTC-8)';
    }
}

function resetContactForm() {
    const form = document.getElementById('contactFormModal');
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
    
    // Reset form tabs
    switchFormTab('basic');
    
    // Reset billing address visibility
    document.getElementById('sameBillingAddress').checked = true;
    toggleBillingAddress();
}

function validateContactForm() {
    const firstName = document.getElementById('editFirstName').value.trim();
    const lastName = document.getElementById('editLastName').value.trim();
    const companyName = document.getElementById('editCompanyName').value.trim();
    const primaryEmail = document.getElementById('editPrimaryEmail').value.trim();
    const status = document.getElementById('editContactStatus').value;
    
    if (!firstName) {
        showNotification('First name is required', 'error');
        switchFormTab('basic');
        document.getElementById('editFirstName').focus();
        return false;
    }
    
    if (!lastName) {
        showNotification('Last name is required', 'error');
        switchFormTab('basic');
        document.getElementById('editLastName').focus();
        return false;
    }
    
    if (!companyName) {
        showNotification('Company name is required', 'error');
        switchFormTab('basic');
        document.getElementById('editCompanyName').focus();
        return false;
    }
    
    if (!primaryEmail) {
        showNotification('Primary email is required', 'error');
        switchFormTab('basic');
        document.getElementById('editPrimaryEmail').focus();
        return false;
    }
    
    if (!status) {
        showNotification('Contact status is required', 'error');
        switchFormTab('basic');
        document.getElementById('editContactStatus').focus();
        return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(primaryEmail)) {
        showNotification('Please enter a valid email address', 'error');
        switchFormTab('basic');
        document.getElementById('editPrimaryEmail').focus();
        return false;
    }
    
    return true;
}

// Tab Management
function switchFormTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.form-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.form-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(`${tabName}Pane`).classList.add('active');
    
    currentFormTab = tabName;
}

function switchAddressTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.address-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.address-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(`${tab}Address`).classList.add('active');
    
    currentActiveTab.address = tab;
}

function switchRelatedTab(tab) {
    // Update tab buttons
    document.querySelectorAll('.related-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    // Update content
    document.querySelectorAll('.related-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(`related${capitalizeFirst(tab)}`).classList.add('active');
    
    currentActiveTab.related = tab;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function toggleBillingAddress() {
    const billingFields = document.getElementById('billingAddressFields');
    const sameAsCheckbox = document.getElementById('sameBillingAddress');
    
    if (sameAsCheckbox.checked) {
        billingFields.style.display = 'none';
    } else {
        billingFields.style.display = 'block';
    }
}

// Contacts Table Management
function renderContactsTable() {
    const tbody = document.getElementById('contactsTableBody');
    if (!tbody) return;
    
    filteredContacts = [...contacts];
    
    // Apply filters
    applyFilters();
    
    // Clear existing content
    tbody.innerHTML = '';
    
    if (filteredContacts.length === 0) {
        document.getElementById('emptyState').style.display = 'block';
        return;
    }
    
    document.getElementById('emptyState').style.display = 'none';
    
    // Render contacts
    filteredContacts.forEach(contact => {
        const row = createContactRow(contact);
        tbody.appendChild(row);
    });
}

function createContactRow(contact) {
    const row = document.createElement('tr');
    row.onclick = () => viewContactFromTable(contact.id);
    
    row.innerHTML = `
        <td>${contact.firstName} ${contact.lastName}</td>
        <td>${contact.companyName}</td>
        <td><a href="mailto:${contact.primaryEmail}">${contact.primaryEmail}</a></td>
        <td>${contact.mobilePhone || contact.workPhone || 'N/A'}</td>
        <td><span class="status-badge ${contact.status.toLowerCase()}">${contact.status}</span></td>
        <td>${contact.contactOwner}</td>
        <td>${contact.lastActivity}</td>
        <td class="actions-col">
            <button class="action-btn-table" onclick="event.stopPropagation(); editContactFromTable(${contact.id})" title="Edit">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn-table delete" onclick="event.stopPropagation(); deleteContactFromTable(${contact.id})" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    return row;
}

function viewContactFromTable(contactId) {
    showContactDetail(contactId);
}

function editContactFromTable(contactId) {
    currentContactId = contactId;
    editContact();
}

function deleteContactFromTable(contactId) {
    const contact = contacts.find(c => c.id === contactId);
    if (!contact) return;
    
    currentDeleteItem = {
        type: 'contact',
        id: contactId,
        name: `${contact.firstName} ${contact.lastName}`
    };
    
    document.getElementById('deleteType').textContent = 'contact';
    document.getElementById('deleteItemName').textContent = currentDeleteItem.name;
    document.getElementById('deleteModal').style.display = 'flex';
}

function applyFilters() {
    const statusFilter = document.getElementById('statusFilter')?.value;
    const ownerFilter = document.getElementById('ownerFilter')?.value;
    
    if (statusFilter) {
        filteredContacts = filteredContacts.filter(contact => contact.status === statusFilter);
    }
    
    if (ownerFilter) {
        filteredContacts = filteredContacts.filter(contact => contact.contactOwner === ownerFilter);
    }
}

function filterContacts() {
    renderContactsTable();
}

function searchContacts(query) {
    if (!query || query.length < 2) {
        filteredContacts = [...contacts];
    } else {
        filteredContacts = contacts.filter(contact => {
            const searchText = `${contact.firstName} ${contact.lastName} ${contact.companyName} ${contact.primaryEmail}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
        });
    }
    
    renderContactsTable();
}

function sortTable(columnIndex) {
    const columns = ['name', 'companyName', 'primaryEmail', 'phone', 'status', 'contactOwner', 'lastActivity'];
    const column = columns[columnIndex];
    
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }
    
    filteredContacts.sort((a, b) => {
        let aValue, bValue;
        
        switch (column) {
            case 'name':
                aValue = `${a.firstName} ${a.lastName}`;
                bValue = `${b.firstName} ${b.lastName}`;
                break;
            case 'phone':
                aValue = a.mobilePhone || a.workPhone || '';
                bValue = b.mobilePhone || b.workPhone || '';
                break;
            default:
                aValue = a[column] || '';
                bValue = b[column] || '';
        }
        
        if (sortDirection === 'asc') {
            return aValue.localeCompare(bValue);
        } else {
            return bValue.localeCompare(aValue);
        }
    });
    
    renderContactsTable();
}

function exportContacts() {
    const csvContent = generateCSV(contacts);
    downloadCSV(csvContent, 'contacts.csv');
    showNotification('Contacts exported successfully', 'success');
}

function generateCSV(contacts) {
    const headers = ['First Name', 'Last Name', 'Company', 'Email', 'Phone', 'Status', 'Owner'];
    const rows = contacts.map(contact => [
        contact.firstName,
        contact.lastName,
        contact.companyName,
        contact.primaryEmail,
        contact.mobilePhone || contact.workPhone,
        contact.status,
        contact.contactOwner
    ]);
    
    return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
}

function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Timeline Management
function addTimelineActivity() {
    document.getElementById('timelineActivityTitle').textContent = 'Add Activity';
    document.getElementById('timelineActivityModal').style.display = 'flex';
    
    // Set default date to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('activityDate').value = now.toISOString().slice(0, 16);
    
    document.getElementById('activityTitle').focus();
}

function editTimelineItem(id) {
    const timelineItem = document.querySelector(`.timeline-item[data-id="${id}"]`);
    if (!timelineItem) return;
    
    // Populate form with existing data
    const title = timelineItem.querySelector('h4').textContent;
    const description = timelineItem.querySelector('.timeline-details p:last-child').textContent;
    
    document.getElementById('timelineActivityTitle').textContent = 'Edit Activity';
    document.getElementById('activityTitle').value = title;
    document.getElementById('activityDescription').value = description;
    document.getElementById('timelineActivityModal').style.display = 'flex';
    document.getElementById('timelineActivityModal').dataset.editId = id;
}

function deleteTimelineItem(id) {
    const timelineItem = document.querySelector(`.timeline-item[data-id="${id}"]`);
    if (!timelineItem) return;
    
    const title = timelineItem.querySelector('h4').textContent;
    
    currentDeleteItem = {
        type: 'timeline',
        id: id,
        name: title
    };
    
    document.getElementById('deleteType').textContent = 'activity';
    document.getElementById('deleteItemName').textContent = title;
    document.getElementById('deleteModal').style.display = 'flex';
}

function saveTimelineActivity() {
    const activityType = document.getElementById('activityType').value;
    const activityDate = document.getElementById('activityDate').value;
    const activityTitle = document.getElementById('activityTitle').value.trim();
    const activityDescription = document.getElementById('activityDescription').value.trim();
    
    if (!activityTitle) {
        showNotification('Activity title is required', 'error');
        return;
    }
    
    if (!activityDate) {
        showNotification('Activity date is required', 'error');
        return;
    }
    
    const modal = document.getElementById('timelineActivityModal');
    const editId = modal.dataset.editId;
    
    if (editId) {
        // Edit existing activity
        const timelineItem = document.querySelector(`.timeline-item[data-id="${editId}"]`);
        if (timelineItem) {
            timelineItem.querySelector('h4').textContent = activityTitle;
            timelineItem.querySelector('.timeline-details p:last-child').textContent = activityDescription;
            showNotification('Activity updated successfully', 'success');
        }
        delete modal.dataset.editId;
    } else {
        // Add new activity
        const timelineContent = document.getElementById('timelineContent');
        const newActivity = createTimelineItem(activityType, activityTitle, activityDescription, activityDate);
        timelineContent.insertBefore(newActivity, timelineContent.firstChild);
        showNotification('Activity added successfully', 'success');
    }
    
    closeTimelineActivityModal();
}

function createTimelineItem(type, title, description, date) {
    const activityId = Date.now();
    const div = document.createElement('div');
    div.className = `timeline-item ${type}`;
    div.dataset.id = activityId;
    
    const formatDate = new Date(date).toLocaleString();
    
    div.innerHTML = `
        <div class="timeline-icon">
            <i class="fas ${getTimelineIcon(type)}"></i>
        </div>
        <div class="timeline-content-body">
            <div class="timeline-header">
                <h4>${title}</h4>
                <span class="timeline-date">${formatDate}</span>
            </div>
            <div class="timeline-details">
                <p>${description}</p>
            </div>
            <div class="timeline-actions">
                <button class="timeline-action-btn" onclick="editTimelineItem(${activityId})">Edit</button>
                <button class="timeline-action-btn delete" onclick="deleteTimelineItem(${activityId})">Delete</button>
            </div>
        </div>
    `;
    
    return div;
}

function getTimelineIcon(type) {
    const icons = {
        call: 'fa-phone',
        email: 'fa-envelope',
        meeting: 'fa-calendar',
        note: 'fa-sticky-note',
        task: 'fa-tasks',
        document: 'fa-file-alt'
    };
    return icons[type] || 'fa-info-circle';
}

function filterTimeline(type) {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    timelineItems.forEach(item => {
        if (type === 'all') {
            item.style.display = 'flex';
        } else {
            if (item.classList.contains(type.slice(0, -1))) { // Remove 's' from plural
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        }
    });
    
    showNotification(`Filtered timeline by ${type}`, 'info');
}

function loadMoreTimeline() {
    showNotification('Loading more activities...', 'info');
    setTimeout(() => {
        showNotification('No more activities to load', 'info');
    }, 1000);
}

// Team Notes Management
function addTeamNote() {
    const noteContent = prompt('Enter your note:');
    if (!noteContent || !noteContent.trim()) return;
    
    const teamNotes = document.getElementById('teamNotes');
    const newNote = createTeamNote(noteContent.trim());
    teamNotes.insertBefore(newNote, teamNotes.firstChild);
    
    showNotification('Team note added successfully', 'success');
}

function createTeamNote(content) {
    const noteId = Date.now();
    const div = document.createElement('div');
    div.className = 'team-note';
    div.dataset.id = noteId;
    
    div.innerHTML = `
        <div class="note-author">
            <img src="https://via.placeholder.com/32x32/667eea/ffffff?text=JD" alt="John Doe" class="author-avatar">
            <div class="author-info">
                <strong>John Doe</strong>
                <span class="note-time">Just now</span>
            </div>
        </div>
        <div class="note-content">
            <p>${content}</p>
        </div>
        <div class="note-actions">
            <button class="note-action-btn" onclick="replyToNote(${noteId})">Reply</button>
            <button class="note-action-btn" onclick="editTeamNote(${noteId})">Edit</button>
            <button class="note-action-btn delete" onclick="deleteTeamNote(${noteId})">Delete</button>
        </div>
    `;
    
    return div;
}

function editTeamNote(id) {
    const noteElement = document.querySelector(`.team-note[data-id="${id}"]`);
    if (!noteElement) return;
    
    const currentContent = noteElement.querySelector('.note-content p').textContent;
    const newContent = prompt('Edit your note:', currentContent);
    
    if (newContent && newContent.trim() && newContent !== currentContent) {
        noteElement.querySelector('.note-content p').textContent = newContent.trim();
        showNotification('Note updated successfully', 'success');
    }
}

function deleteTeamNote(id) {
    const noteElement = document.querySelector(`.team-note[data-id="${id}"]`);
    if (!noteElement) return;
    
    const content = noteElement.querySelector('.note-content p').textContent;
    
    currentDeleteItem = {
        type: 'note',
        id: id,
        name: content.substring(0, 50) + (content.length > 50 ? '...' : '')
    };
    
    document.getElementById('deleteType').textContent = 'note';
    document.getElementById('deleteItemName').textContent = currentDeleteItem.name;
    document.getElementById('deleteModal').style.display = 'flex';
}

function replyToNote(id) {
    const reply = prompt('Enter your reply:');
    if (!reply || !reply.trim()) return;
    
    showNotification('Reply functionality would be implemented here', 'info');
}

// Quick Actions
function callContact() {
    const contact = contacts.find(c => c.id === currentContactId);
    if (!contact) return;
    
    const phone = contact.mobilePhone || contact.workPhone;
    if (phone) {
        window.open(`tel:${phone}`);
        logActivity('call', `Called ${contact.firstName} ${contact.lastName} at ${phone}`);
        showNotification(`Calling ${contact.firstName} ${contact.lastName}...`, 'info');
    } else {
        showNotification('No phone number available', 'warning');
    }
}

function emailContact() {
    const contact = contacts.find(c => c.id === currentContactId);
    if (!contact) return;
    
    const email = contact.primaryEmail;
    const subject = encodeURIComponent(`Follow-up with ${contact.firstName} ${contact.lastName}`);
    const body = encodeURIComponent(`Hi ${contact.firstName},\n\nI wanted to follow up on our recent conversation.\n\nBest regards,`);
    
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
    logActivity('email', `Sent email to ${contact.firstName} ${contact.lastName}`);
    showNotification(`Opening email to ${contact.firstName}...`, 'info');
}

function scheduleMeeting() {
    showNotification('Opening meeting scheduler...', 'info');
    console.log('Schedule meeting functionality would be implemented here');
}

function addNote() {
    document.getElementById('addNoteModal').style.display = 'flex';
    document.getElementById('addNoteModal').classList.add('show');
    document.getElementById('noteContent').focus();
}

function uploadDocument() {
    showNotification('Opening document upload...', 'info');
    console.log('Document upload functionality would be implemented here');
}

function createDeal() {
    showNotification('Creating new deal...', 'info');
    setTimeout(() => {
        window.open('deals.html#create', '_blank');
    }, 500);
}

function uploadAvatar() {
    showNotification('Opening avatar upload...', 'info');
    console.log('Avatar upload functionality would be implemented here');
}

// Edit Functions
function editBasicInfo() {
    editContact();
}

function editAddressInfo() {
    editContact();
    switchFormTab('address');
}

function editSocialMedia() {
    editContact();
    switchFormTab('social');
}

function editCompliance() {
    editContact();
    switchFormTab('compliance');
}

// Related Records
function viewDeal(id) {
    showNotification(`Opening deal ID: ${id}`, 'info');
    setTimeout(() => {
        window.open(`deals.html#${id}`, '_blank');
    }, 500);
}

function editDeal(id) {
    showNotification(`Editing deal ID: ${id}`, 'info');
}

function unlinkDeal(id) {
    const dealElement = document.querySelector(`.related-item[data-id="${id}"]`);
    if (!dealElement) return;
    
    const dealName = dealElement.querySelector('h5').textContent;
    
    if (confirm(`Are you sure you want to unlink "${dealName}" from this contact?`)) {
        dealElement.remove();
        showNotification('Deal unlinked successfully', 'success');
    }
}

function viewProject(id) {
    showNotification(`Opening project ID: ${id}`, 'info');
}

function viewTicket(id) {
    showNotification(`Opening ticket ID: ${id}`, 'info');
}

function viewInvoice(id) {
    showNotification(`Opening invoice ID: ${id}`, 'info');
}

// Note Modal Functions
function saveNote() {
    const noteType = document.getElementById('noteType').value;
    const noteContent = document.getElementById('noteContent').value.trim();
    const notifyTeam = document.getElementById('notifyTeam').checked;
    
    if (!noteContent) {
        showNotification('Please enter note content', 'error');
        return;
    }
    
    logActivity('note', `Added ${noteType} note: ${noteContent.substring(0, 50)}...`);
    closeAddNoteModal();
    showNotification('Note added successfully', 'success');
    
    if (notifyTeam) {
        showNotification('Team members have been notified', 'info');
    }
}

function closeAddNoteModal() {
    document.getElementById('addNoteModal').style.display = 'none';
    document.getElementById('addNoteModal').classList.remove('show');
    
    // Reset form
    document.getElementById('noteType').value = 'general';
    document.getElementById('noteContent').value = '';
    document.getElementById('notifyTeam').checked = false;
}

function closeTimelineActivityModal() {
    document.getElementById('timelineActivityModal').style.display = 'none';
    
    // Reset form
    document.getElementById('activityType').value = 'call';
    document.getElementById('activityDate').value = '';
    document.getElementById('activityTitle').value = '';
    document.getElementById('activityDescription').value = '';
    
    // Remove edit ID if it exists
    delete document.getElementById('timelineActivityModal').dataset.editId;
}

function closeContactFormModal() {
    document.getElementById('contactFormModal').style.display = 'none';
    document.getElementById('contactFormModal').classList.remove('show');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    currentDeleteItem = null;
}

function closeAllModals() {
    closeContactFormModal();
    closeAddNoteModal();
    closeTimelineActivityModal();
    closeDeleteModal();
}

// Activity Logging
function logActivity(type, description) {
    const activity = {
        id: Date.now(),
        type: type,
        description: description,
        timestamp: new Date().toISOString(),
        contactId: currentContactId
    };
    
    console.log('Activity logged:', activity);
    
    // Update last activity for current contact
    const contact = contacts.find(c => c.id === currentContactId);
    if (contact) {
        contact.lastActivity = 'Just now';
        contact.modified = new Date().toISOString();
        saveToLocalStorage();
        loadContactData(currentContactId);
    }
}

// Search Function
function performSearch(query) {
    if (query.length < 2) return;
    
    console.log(`Searching contacts for: ${query}`);
    showNotification(`Searching for "${query}"...`, 'info');
    
    // Simulate search results
    setTimeout(() => {
        showNotification(`Found 8 contacts matching "${query}"`, 'success');
    }, 1000);
}

// Dropdown Functions
function toggleNotifications() {
    showNotification('Notifications feature coming soon', 'info');
}

function toggleUserMenu() {
    showNotification('User menu feature coming soon', 'info');
}

// Local Storage
function saveToLocalStorage() {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

// Notification System
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

// Initialize application
console.log('Contact Management System with full CRUD functionality initialized successfully');
