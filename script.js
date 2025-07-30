// API Configuration
const API_BASE_URL = 'http://192.168.68.61:3000/api/espresso';

// State management
let currentPage = 1;
let currentFilters = {};
let editingEntryId = null;

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const entriesList = document.getElementById('entriesList');
const espressoForm = document.getElementById('espressoForm');
const editForm = document.getElementById('editForm');
const editModal = document.getElementById('editModal');
const closeModal = document.querySelector('.close');

// Filter elements
const beanFilter = document.getElementById('beanFilter');
const ratingFilter = document.getElementById('ratingFilter');
const roastFilter = document.getElementById('roastFilter');
const clearFiltersBtn = document.getElementById('clearFilters');

// Pagination elements
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

// Statistics elements
const totalEntriesEl = document.getElementById('totalEntries');
const avgRatingEl = document.getElementById('avgRating');
const avgExtractionTimeEl = document.getElementById('avgExtractionTime');
const avgDoseEl = document.getElementById('avgDose');
const topBeansEl = document.getElementById('topBeans');
const topOriginsEl = document.getElementById('topOrigins');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeFilters();
    initializePagination();
    initializeModal();
    loadEntries();
    loadStats();
});

// Tab functionality
function initializeTabs() {
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

function switchTab(tabName) {
    // Update active tab button
    tabButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update active tab content
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    
    // Load data for the active tab
    if (tabName === 'entries') {
        loadEntries();
    } else if (tabName === 'stats') {
        loadStats();
    }
}

// Filter functionality
function initializeFilters() {
    beanFilter.addEventListener('input', debounce(applyFilters, 300));
    ratingFilter.addEventListener('change', applyFilters);
    roastFilter.addEventListener('change', applyFilters);
    clearFiltersBtn.addEventListener('click', clearFilters);
}

function applyFilters() {
    currentFilters = {};
    
    if (beanFilter.value) currentFilters.beanName = beanFilter.value;
    if (ratingFilter.value) currentFilters.rating = ratingFilter.value;
    if (roastFilter.value) currentFilters.roastLevel = roastFilter.value;
    
    currentPage = 1;
    loadEntries();
}

function clearFilters() {
    beanFilter.value = '';
    ratingFilter.value = '';
    roastFilter.value = '';
    currentFilters = {};
    currentPage = 1;
    loadEntries();
}

// Pagination functionality
function initializePagination() {
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadEntries();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        currentPage++;
        loadEntries();
    });
}

// Modal functionality
function initializeModal() {
    closeModal.addEventListener('click', closeEditModal);
    window.addEventListener('click', (event) => {
        if (event.target === editModal) {
            closeEditModal();
        }
    });
}

function openEditModal(entry) {
    editingEntryId = entry._id;
    populateEditForm(entry);
    editModal.style.display = 'block';
}

function closeEditModal() {
    editModal.style.display = 'none';
    editingEntryId = null;
    editForm.reset();
}

function populateEditForm(entry) {
    editForm.innerHTML = `
        <div class="form-grid">
            <div class="form-group">
                <label for="editBeanName">Bean Name *</label>
                <input type="text" id="editBeanName" name="beanName" value="${entry.beanName}" required>
            </div>
            
            <div class="form-group">
                <label for="editOrigin">Origin</label>
                <input type="text" id="editOrigin" name="origin" value="${entry.origin || ''}">
            </div>
            
            <div class="form-group">
                <label for="editRoastLevel">Roast Level</label>
                <select id="editRoastLevel" name="roastLevel">
                    <option value="Light" ${entry.roastLevel === 'Light' ? 'selected' : ''}>Light</option>
                    <option value="Medium-Light" ${entry.roastLevel === 'Medium-Light' ? 'selected' : ''}>Medium-Light</option>
                    <option value="Medium" ${entry.roastLevel === 'Medium' ? 'selected' : ''}>Medium</option>
                    <option value="Medium-Dark" ${entry.roastLevel === 'Medium-Dark' ? 'selected' : ''}>Medium-Dark</option>
                    <option value="Dark" ${entry.roastLevel === 'Dark' ? 'selected' : ''}>Dark</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="editGrindSize">Grind Size (1-50) *</label>
                <input type="number" id="editGrindSize" name="grindSize" value="${entry.grindSize}" min="1" max="50" required>
            </div>
            
            <div class="form-group">
                <label for="editDose">Dose (g) *</label>
                <input type="number" id="editDose" name="dose" value="${entry.dose}" step="0.1" min="0" required>
            </div>
            
            <div class="form-group">
                <label for="editYield">Yield (g) *</label>
                <input type="number" id="editYield" name="yield" value="${entry.yield}" step="0.1" min="0" required>
            </div>
            
            <div class="form-group">
                <label for="editExtractionTime">Extraction Time (s) *</label>
                <input type="number" id="editExtractionTime" name="extractionTime" value="${entry.extractionTime}" step="0.1" min="0" required>
            </div>
            
            <div class="form-group">
                <label for="editRating">Rating (1-10) *</label>
                <input type="number" id="editRating" name="rating" value="${entry.rating}" min="1" max="10" required>
            </div>
        </div>
        
        <div class="form-group full-width">
            <label for="editFlavors">Flavors</label>
            <input type="text" id="editFlavors" name="flavors" value="${entry.flavors || ''}" placeholder="e.g., chocolate, caramel, citrus">
        </div>
        
        <div class="form-group full-width">
            <label for="editNotes">Notes</label>
            <textarea id="editNotes" name="notes" rows="4" placeholder="Additional notes about this espresso...">${entry.notes || ''}</textarea>
        </div>
        
        <div class="form-actions">
            <button type="submit" class="btn-primary">Update Entry</button>
            <button type="button" class="btn-secondary" onclick="closeEditModal()">Cancel</button>
        </div>
    `;
    
    // Add event listener to the edit form
    editForm.addEventListener('submit', handleEditSubmit);
}

// API Functions
async function loadEntries() {
    try {
        showLoading(entriesList);
        
        const params = new URLSearchParams({
            page: currentPage,
            limit: 12,
            ...currentFilters
        });
        
        const response = await fetch(`${API_BASE_URL}?${params}`);
        const data = await response.json();
        
        if (response.ok) {
            displayEntries(data.espressos, data.pagination);
        } else {
            showError(entriesList, 'Failed to load entries');
        }
    } catch (error) {
        console.error('Error loading entries:', error);
        showError(entriesList, 'Failed to load entries');
    }
}

async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/stats/summary`);
        const data = await response.json();
        
        if (response.ok) {
            displayStats(data);
        } else {
            console.error('Failed to load stats');
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function createEntry(formData) {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showSuccess('Entry created successfully!');
            espressoForm.reset();
            switchTab('entries');
        } else {
            const errorData = await response.json();
            showError(null, `Failed to create entry: ${errorData.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error creating entry:', error);
        showError(null, 'Failed to create entry');
    }
}

async function updateEntry(id, formData) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showSuccess('Entry updated successfully!');
            closeEditModal();
            loadEntries();
        } else {
            const errorData = await response.json();
            showError(null, `Failed to update entry: ${errorData.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error updating entry:', error);
        showError(null, 'Failed to update entry');
    }
}

async function deleteEntry(id) {
    if (!confirm('Are you sure you want to delete this entry?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccess('Entry deleted successfully!');
            loadEntries();
        } else {
            showError(null, 'Failed to delete entry');
        }
    } catch (error) {
        console.error('Error deleting entry:', error);
        showError(null, 'Failed to delete entry');
    }
}

// Display Functions
function displayEntries(entries, pagination) {
    if (entries.length === 0) {
        entriesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-coffee"></i>
                <h3>No espresso entries found</h3>
                <p>Start by adding your first espresso entry!</p>
            </div>
        `;
        return;
    }
    
    entriesList.innerHTML = entries.map(entry => `
        <div class="entry-card">
            <div class="entry-header">
                <div>
                    <div class="entry-title">${entry.beanName}</div>
                    <div class="entry-rating">
                        <i class="fas fa-star"></i>
                        ${entry.rating}/10
                    </div>
                </div>
            </div>
            
            <div class="entry-meta">
                <span>Origin: <strong>${entry.origin || 'N/A'}</strong></span>
                <span>Roast: <strong>${entry.roastLevel}</strong></span>
                <span>Dose: <strong>${entry.dose}g</strong></span>
                <span>Yield: <strong>${entry.yield}g</strong></span>
                <span>Grind: <strong>${entry.grindSize}</strong></span>
                <span>Time: <strong>${entry.extractionTime}s</strong></span>
            </div>
            
            ${entry.flavors ? `<div style="margin-bottom: 10px; font-size: 0.9rem; color: #718096;">
                <strong>Flavors:</strong> ${entry.flavors}
            </div>` : ''}
            
            ${entry.notes ? `<div style="margin-bottom: 15px; font-size: 0.9rem; color: #718096; font-style: italic;">
                "${entry.notes}"
            </div>` : ''}
            
            <div class="entry-actions">
                <button class="edit-btn" onclick="openEditModal(${JSON.stringify(entry).replace(/"/g, '&quot;')})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn" onclick="deleteEntry('${entry._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
    
    updatePagination(pagination);
}

function displayStats(data) {
    const summary = data.summary;
    const topBeans = data.topBeans;
    const topOrigins = data.topOrigins;
    
    // Update summary stats
    totalEntriesEl.textContent = summary.totalEntries || 0;
    avgRatingEl.textContent = summary.avgRating ? summary.avgRating.toFixed(1) : 'N/A';
    avgExtractionTimeEl.textContent = summary.avgExtractionTime ? summary.avgExtractionTime.toFixed(1) + 's' : 'N/A';
    avgDoseEl.textContent = summary.avgDose ? summary.avgDose.toFixed(1) + 'g' : 'N/A';
    
    // Update top beans
    topBeansEl.innerHTML = topBeans.length > 0 ? 
        topBeans.map(bean => `
            <div class="stat-item">
                <span class="stat-item-name">${bean._id}</span>
                <span class="stat-item-value">${bean.count} entries (${bean.avgRating.toFixed(1)} avg)</span>
            </div>
        `).join('') : 
        '<div class="empty-state"><p>No beans found</p></div>';
    
    // Update top origins
    topOriginsEl.innerHTML = topOrigins.length > 0 ? 
        topOrigins.map(origin => `
            <div class="stat-item">
                <span class="stat-item-name">${origin._id || 'Unknown'}</span>
                <span class="stat-item-value">${origin.count} entries</span>
            </div>
        `).join('') : 
        '<div class="empty-state"><p>No origins found</p></div>';
}

function updatePagination(pagination) {
    pageInfo.textContent = `Page ${pagination.page} of ${pagination.pages}`;
    prevPageBtn.disabled = pagination.page <= 1;
    nextPageBtn.disabled = pagination.page >= pagination.pages;
}

// Form Handlers
espressoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(espressoForm);
    const entryData = {};
    
    for (let [key, value] of formData.entries()) {
        if (value !== '') {
            if (['grindSize', 'dose', 'yield', 'extractionTime', 'rating'].includes(key)) {
                entryData[key] = parseFloat(value);
            } else {
                entryData[key] = value;
            }
        }
    }
    
    await createEntry(entryData);
});

async function handleEditSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(editForm);
    const entryData = {};
    
    for (let [key, value] of formData.entries()) {
        if (value !== '') {
            if (['grindSize', 'dose', 'yield', 'extractionTime', 'rating'].includes(key)) {
                entryData[key] = parseFloat(value);
            } else {
                entryData[key] = value;
            }
        }
    }
    
    await updateEntry(editingEntryId, entryData);
}

// Utility Functions
function showLoading(container) {
    if (container) {
        container.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner"></i>
                <p>Loading...</p>
            </div>
        `;
    }
}

function showError(container, message) {
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    } else {
        alert(message);
    }
}

function showSuccess(message) {
    // Create a temporary success notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #48bb78;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1001;
        font-weight: 500;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Make functions globally available for onclick handlers
window.openEditModal = openEditModal;
window.deleteEntry = deleteEntry; 