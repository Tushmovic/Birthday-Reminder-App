// API base URL - update this for production
const API_BASE_URL = 'http://localhost:5000/api';

// DOM Elements
const birthdayForm = document.getElementById('birthdayForm');
const usersList = document.getElementById('usersList');
const successMessage = document.getElementById('successMessage');
const refreshBtn = document.getElementById('refreshBtn');

// Form validation
function validateForm(formData) {
    const errors = {};
    
    // Username validation
    if (!formData.username.trim() || formData.username.length < 2) {
        errors.username = 'Username must be at least 2 characters';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
    }
    
    // Date validation
    const dob = new Date(formData.dateOfBirth);
    const today = new Date();
    if (dob > today) {
        errors.dateOfBirth = 'Date of birth cannot be in the future';
    }
    if (!formData.dateOfBirth) {
        errors.dateOfBirth = 'Please select a date of birth';
    }
    
    return errors;
}

// Display form errors
function displayErrors(errors) {
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
    });
    
    // Display new errors
    Object.entries(errors).forEach(([field, message]) => {
        const errorElement = document.getElementById(`${field}Error`);
        if (errorElement) {
            errorElement.textContent = message;
        }
    });
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Calculate age
function calculateAge(dateString) {
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

// Load and display users
async function loadUsers() {
    try {
        usersList.innerHTML = '<div class="loading">Loading birthdays...</div>';
        
        const response = await fetch(`${API_BASE_URL}/users`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        
        const users = await response.json();
        
        if (users.length === 0) {
            usersList.innerHTML = '<div class="no-users">No birthdays added yet. Add your first birthday above!</div>';
            return;
        }
        
        usersList.innerHTML = users.map(user => `
            <div class="user-card">
                <h3><i class="fas fa-user-circle"></i> ${user.username}</h3>
                <p class="email"><i class="fas fa-envelope"></i> ${user.email}</p>
                <p class="birthday">
                    <i class="fas fa-birthday-cake"></i>
                    Birthday: ${formatDate(user.date_of_birth)}
                    (${calculateAge(user.date_of_birth)} years old)
                </p>
                <p><i class="fas fa-calendar-plus"></i> Added: ${new Date(user.created_at).toLocaleDateString()}</p>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading users:', error);
        usersList.innerHTML = '<div class="no-users">Error loading birthdays. Please try again.</div>';
    }
}

// Handle form submission
birthdayForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        dateOfBirth: document.getElementById('dateOfBirth').value
    };
    
    // Validate form
    const errors = validateForm(formData);
    
    if (Object.keys(errors).length > 0) {
        displayErrors(errors);
        return;
    }
    
    // Clear errors
    displayErrors({});
    
    try {
        // Send data to server
        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 409) {
                // Email already exists
                displayErrors({ email: 'Email already exists' });
            } else if (data.errors) {
                // Validation errors from server
                const serverErrors = {};
                data.errors.forEach(error => {
                    serverErrors[error.path] = error.msg;
                });
                displayErrors(serverErrors);
            } else {
                throw new Error(data.error || 'Failed to add birthday');
            }
            return;
        }
        
        // Success!
        successMessage.style.display = 'flex';
        
        // Clear form
        birthdayForm.reset();
        
        // Hide success message after 3 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);
        
        // Reload users list
        loadUsers();
        
    } catch (error) {
        console.error('Error adding birthday:', error);
        alert('Failed to add birthday. Please try again.');
    }
});

// Handle refresh button
refreshBtn.addEventListener('click', loadUsers);

// Initial load of users
loadUsers();

// Set max date to today for date picker
document.getElementById('dateOfBirth').max = new Date().toISOString().split('T')[0];