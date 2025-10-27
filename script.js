// API Configuration
const API_BASE_URL = 'http://192.168.68.57:3000/api/espresso';
const BEANS_API_URL = 'http://192.168.68.57:3000/api/beans';

// State management
let currentPage = 1;
let currentFilters = {};
let editingEntryId = null;
let editingBeanId = null;
let beansList = [];

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
const regionFilter = document.getElementById('regionFilter');
const roastFilter = document.getElementById('roastFilter');
const ratingFilter = document.getElementById('ratingFilter');
const clearFiltersBtn = document.getElementById('clearFilters');

// Bean elements
const beanSelect = document.getElementById('bean');
const addBeanBtn = document.getElementById('addBeanBtn');
const addNewBeanBtn = document.getElementById('addNewBeanBtn');
const beanModal = document.getElementById('beanModal');
const beanForm = document.getElementById('beanForm');
const beansListEl = document.getElementById('beansList');
const beansNameFilter = document.getElementById('beansNameFilter');
const beansRegionFilter = document.getElementById('beansRegionFilter');
const beansRoastFilter = document.getElementById('beansRoastFilter');
const clearBeansFilters = document.getElementById('clearBeansFilters');

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
    initializeBeanModal();
    loadBeans();
    loadEntries();
    
    // Load stats asynchronously without blocking other functionality
    loadStats().catch(error => {
        console.warn('Stats loading failed, but continuing with app initialization:', error);
    });
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
    } else if (tabName === 'beans') {
        loadBeans();
    } else if (tabName === 'stats') {
        loadStats();
    }
}

// Filter functionality
function initializeFilters() {
    beanFilter.addEventListener('input', debounce(applyFilters, 300));
    regionFilter.addEventListener('input', debounce(applyFilters, 300));
    roastFilter.addEventListener('input', debounce(applyFilters, 300));
    ratingFilter.addEventListener('change', applyFilters);
    clearFiltersBtn.addEventListener('click', clearFilters);
    
    // Bean filters
    beansNameFilter.addEventListener('input', debounce(applyBeansFilters, 300));
    beansRegionFilter.addEventListener('input', debounce(applyBeansFilters, 300));
    beansRoastFilter.addEventListener('input', debounce(applyBeansFilters, 300));
    clearBeansFilters.addEventListener('click', clearBeansFiltersHandler);
}

function applyFilters() {
    currentFilters = {};
    
    if (beanFilter.value) currentFilters.beanName = beanFilter.value;
    if (regionFilter.value) currentFilters.region = regionFilter.value;
    if (roastFilter.value) currentFilters.roast = roastFilter.value;
    if (ratingFilter.value) currentFilters.rating = ratingFilter.value;
    
    currentPage = 1;
    loadEntries();
}

function clearFilters() {
    beanFilter.value = '';
    regionFilter.value = '';
    roastFilter.value = '';
    ratingFilter.value = '';
    currentFilters = {};
    currentPage = 1;
    loadEntries();
}

function applyBeansFilters() {
    loadBeans();
}

function clearBeansFiltersHandler() {
    beansNameFilter.value = '';
    beansRegionFilter.value = '';
    beansRoastFilter.value = '';
    loadBeans();
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

function initializeBeanModal() {
    console.log('Initializing bean modal...');
    console.log('addBeanBtn:', addBeanBtn);
    console.log('addNewBeanBtn:', addNewBeanBtn);
    console.log('beanModal:', beanModal);
    console.log('beanForm:', beanForm);
    
    if (addBeanBtn) {
        addBeanBtn.addEventListener('click', () => {
            console.log('Add bean button clicked');
            openBeanModal();
        });
    }
    
    if (addNewBeanBtn) {
        addNewBeanBtn.addEventListener('click', () => {
            console.log('Add new bean button clicked');
            openBeanModal();
        });
    }
    
    const closeBeanModalBtn = document.getElementById('closeBeanModal');
    if (closeBeanModalBtn) {
        closeBeanModalBtn.addEventListener('click', closeBeanModal);
    }
    
    if (beanForm) {
        beanForm.addEventListener('submit', handleBeanSubmit);
    }
    
    window.addEventListener('click', (event) => {
        if (event.target === beanModal) {
            closeBeanModal();
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

function openBeanModal(bean = null) {
    console.log('openBeanModal called with bean:', bean);
    editingBeanId = bean ? bean._id : null;
    document.getElementById('beanModalTitle').textContent = bean ? 'Edit Bean' : 'Add New Bean';
    
    if (bean) {
        document.getElementById('beanName').value = bean.name;
        document.getElementById('beanRegion').value = bean.region;
        document.getElementById('beanRoast').value = bean.roast;
        document.getElementById('beanDate').value = bean.date ? new Date(bean.date).toISOString().split('T')[0] : '';
        document.getElementById('beanFlavors').value = bean.flavors || '';
    } else {
        beanForm.reset();
        document.getElementById('beanDate').value = new Date().toISOString().split('T')[0];
    }
    
    console.log('Setting modal display to block');
    beanModal.style.display = 'block';
}

function closeBeanModal() {
    beanModal.style.display = 'none';
    editingBeanId = null;
    beanForm.reset();
}

function populateEditForm(entry) {
    editForm.innerHTML = `
        <div class="form-grid">
            <div class="form-group">
                <label for="editBean">Bean *</label>
                <select id="editBean" name="bean" required>
                    <option value="">Select a bean...</option>
                    ${beansList.map(bean => 
                        `<option value="${bean._id}" ${entry.bean && entry.bean._id === bean._id ? 'selected' : ''}>${bean.name} (${bean.region})</option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="form-group">
                        <label for="editGrindSize">Grind Size (1-50) *</label>
                        <input type="number" id="editGrindSize" name="grindSize" value="${entry.grindSize}" min="1" max="50" step="0.1" required>
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
        console.log('Loading stats from:', `${API_BASE_URL}/stats/summary`);
        const response = await fetch(`${API_BASE_URL}/stats/summary`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Stats API response:', data);
        
        displayStats(data);
    } catch (error) {
        console.warn('Could not load stats (API might not be running):', error.message);
        // Set default values for stats elements
        if (totalEntriesEl) totalEntriesEl.textContent = '0';
        if (avgRatingEl) avgRatingEl.textContent = 'N/A';
        if (avgExtractionTimeEl) avgExtractionTimeEl.textContent = 'N/A';
        if (avgDoseEl) avgDoseEl.textContent = 'N/A';
        if (topBeansEl) topBeansEl.innerHTML = '<div class="empty-state"><p>No data available</p></div>';
        if (topOriginsEl) topOriginsEl.innerHTML = '<div class="empty-state"><p>No data available</p></div>';
    }
}

// Bean API Functions
async function loadBeans() {
    try {
        const params = new URLSearchParams();
        if (beansNameFilter.value) params.append('name', beansNameFilter.value);
        if (beansRegionFilter.value) params.append('region', beansRegionFilter.value);
        if (beansRoastFilter.value) params.append('roast', beansRoastFilter.value);
        
        const response = await fetch(`${BEANS_API_URL}?${params}`);
        const data = await response.json();
        
        if (response.ok) {
            beansList = data.beans;
            displayBeans(data.beans);
            updateBeanSelect(data.beans);
        } else {
            showError(beansListEl, 'Failed to load beans');
        }
    } catch (error) {
        console.error('Error loading beans:', error);
        showError(beansListEl, 'Failed to load beans');
    }
}

async function createBean(formData) {
    try {
        console.log('Creating bean with data:', formData);
        const response = await fetch(BEANS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('Bean created successfully:', result);
            showSuccess('Bean created successfully!');
            closeBeanModal();
            loadBeans();
        } else {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            showError(null, `Failed to create bean: ${errorData.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error creating bean:', error);
        showError(null, 'Failed to create bean');
    }
}

async function updateBean(id, formData) {
    try {
        const response = await fetch(`${BEANS_API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showSuccess('Bean updated successfully!');
            closeBeanModal();
            loadBeans();
        } else {
            const errorData = await response.json();
            showError(null, `Failed to update bean: ${errorData.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error updating bean:', error);
        showError(null, 'Failed to update bean');
    }
}

async function deleteBean(id) {
    if (!confirm('Are you sure you want to delete this bean?')) {
        return;
    }
    
    try {
        const response = await fetch(`${BEANS_API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccess('Bean deleted successfully!');
            loadBeans();
        } else {
            showError(null, 'Failed to delete bean');
        }
    } catch (error) {
        console.error('Error deleting bean:', error);
        showError(null, 'Failed to delete bean');
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
                    <div class="entry-title">${entry.bean ? entry.bean.name : 'Unknown Bean'}</div>
                    <div class="entry-rating">
                        <i class="fas fa-star"></i>
                        ${entry.rating}/10
                    </div>
                </div>
            </div>
            
            <div class="entry-meta">
                <span>Region: <strong>${entry.bean ? entry.bean.region : 'N/A'}</strong></span>
                <span>Roast: <strong>${entry.bean ? entry.bean.roast : 'N/A'}</strong></span>
                <span>Dose: <strong>${entry.dose}g</strong></span>
                <span>Yield: <strong>${entry.yield}g</strong></span>
                <span>Grind: <strong>${entry.grindSize}</strong></span>
                <span>Time: <strong>${entry.extractionTime}s</strong></span>
            </div>
            
            ${entry.bean && entry.bean.flavors ? `<div style="margin-bottom: 10px; font-size: 0.9rem; color: #718096;">
                <strong>Flavors:</strong> ${entry.bean.flavors}
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

function displayBeans(beans) {
    if (beans.length === 0) {
        beansListEl.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-seedling"></i>
                <h3>No beans found</h3>
                <p>Start by adding your first bean!</p>
            </div>
        `;
        return;
    }
    
    beansListEl.innerHTML = beans.map(bean => `
        <div class="entry-card">
            <div class="entry-header">
                <div>
                    <div class="entry-title">${bean.name}</div>
                    <div class="entry-meta">
                        <span>Region: <strong>${bean.region}</strong></span>
                        <span>Roast: <strong>${bean.roast}</strong></span>
                        <span>Date: <strong>${new Date(bean.date).toLocaleDateString()}</strong></span>
                    </div>
                    ${bean.flavors ? `<div style="margin-top: 10px; font-size: 0.9rem; color: #718096;">
                        <strong>Flavors:</strong> ${bean.flavors}
                    </div>` : ''}
                </div>
            </div>
            
            <div class="entry-actions">
                <button class="edit-btn" onclick="openBeanModal(${JSON.stringify(bean).replace(/"/g, '&quot;')})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="delete-btn" onclick="deleteBean('${bean._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function updateBeanSelect(beans) {
    beanSelect.innerHTML = '<option value="">Select a bean...</option>' + 
        beans.map(bean => `<option value="${bean._id}">${bean.name} (${bean.region})</option>`).join('');
}

function displayStats(data) {
    try {
        console.log('displayStats called with data:', data);
        
        // Safety checks
        if (!data || typeof data !== 'object') {
            console.error('Invalid stats data:', data);
            return;
        }
        
        const summary = data.summary || {};
        const topBeans = Array.isArray(data.topBeans) ? data.topBeans : [];
        const topRegions = Array.isArray(data.topRegions) ? data.topRegions : [];
        
        console.log('Processed data - summary:', summary, 'topBeans:', topBeans, 'topRegions:', topRegions);
        
        // Update summary stats
        if (totalEntriesEl) totalEntriesEl.textContent = summary.totalEntries || 0;
        if (avgRatingEl) avgRatingEl.textContent = summary.avgRating ? summary.avgRating.toFixed(1) : 'N/A';
        if (avgExtractionTimeEl) avgExtractionTimeEl.textContent = summary.avgExtractionTime ? summary.avgExtractionTime.toFixed(1) + 's' : 'N/A';
        if (avgDoseEl) avgDoseEl.textContent = summary.avgDose ? summary.avgDose.toFixed(1) + 'g' : 'N/A';
        
        // Update top beans
        if (topBeansEl) {
            topBeansEl.innerHTML = topBeans.length > 0 ? 
                topBeans.map(bean => `
                    <div class="stat-item">
                        <span class="stat-item-name">${bean._id || 'Unknown'}</span>
                        <span class="stat-item-value">${bean.count || 0} entries (${bean.avgRating ? bean.avgRating.toFixed(1) : 'N/A'} avg)</span>
                    </div>
                `).join('') : 
                '<div class="empty-state"><p>No beans found</p></div>';
        }
        
        // Update top regions
        if (topOriginsEl) {
            topOriginsEl.innerHTML = topRegions.length > 0 ? 
                topRegions.map(region => `
                    <div class="stat-item">
                        <span class="stat-item-name">${region._id || 'Unknown'}</span>
                        <span class="stat-item-value">${region.count || 0} entries</span>
                    </div>
                `).join('') : 
                '<div class="empty-state"><p>No regions found</p></div>';
        }
    } catch (error) {
        console.error('Error in displayStats:', error);
    }
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

async function handleBeanSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(beanForm);
    const beanData = {};
    
    for (let [key, value] of formData.entries()) {
        if (value !== '') {
            if (key === 'date') {
                beanData[key] = new Date(value);
            } else {
                beanData[key] = value;
            }
        }
    }
    
    // Validate required fields
    if (!beanData.name || !beanData.region || !beanData.roast) {
        showError(null, 'Please fill in all required fields (Name, Region, Roast)');
        return;
    }
    
    if (editingBeanId) {
        await updateBean(editingBeanId, beanData);
    } else {
        await createBean(beanData);
    }
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
window.openBeanModal = openBeanModal;
window.closeBeanModal = closeBeanModal;
window.deleteBean = deleteBean; 