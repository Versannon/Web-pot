// Handle Google Sign-In callback
function handleCredentialResponse(response) {
    // Decode the JWT token
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const userData = JSON.parse(jsonPayload);
    
    // Send to Google Apps Script backend as registration
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzQQRc_0FXAqZuLqvNymNMdkhG4lu7DX3jX9pkrT_aawwbbmmaZ0NNs7q0gpGWCymlO/exec';
    
    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            formType: 'register',
            name: userData.name,
            email: userData.email,
            password: 'google_oauth_' + userData.sub // Generate a password from Google ID
        })
    })
    .then(res => res.json())
    .then(data => {
        // Store login info regardless of response (user may already exist)
        localStorage.setItem('webpotUserLoggedIn', 'true');
        localStorage.setItem('webpotUserEmail', userData.email);
        localStorage.setItem('webpotUserName', userData.name);
        
        showSuccessModal('Welcome!', `Welcome ${userData.name}! You have been signed in.`);
        
        // Redirect after 2 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    })
    .catch(err => {
        console.error('Error:', err);
        // Still sign in the user even if backend fails
        localStorage.setItem('webpotUserLoggedIn', 'true');
        localStorage.setItem('webpotUserEmail', userData.email);
        localStorage.setItem('webpotUserName', userData.name);
        
        showSuccessModal('Welcome!', `Welcome ${userData.name}!`);
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    });
}

// Initialize Google Sign-In on page load
window.onload = function() {
    if (window.google) {
        google.accounts.id.initialize({
            client_id: 'YOUR_GOOGLE_CLIENT_ID'
        });
    }
};

// Toggle between login and registration forms
function toggleForms(event) {
    event.preventDefault();
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
    
    loginForm.classList.toggle('active');
    registerForm.classList.toggle('active');
}

// Toggle password visibility
function togglePasswordVisibility(fieldId) {
    const field = document.getElementById(fieldId);
    const button = event.target;
    const isPassword = field.type === 'password';
    field.type = isPassword ? 'text' : 'password';
    
    // Change button appearance based on state
    button.textContent = isPassword ? '👁️‍🗨️' : '👁️';
    button.setAttribute('title', isPassword ? 'Hide password' : 'Show password');
}

// Password strength indicator
const passwordInput = document.getElementById('register-password');
if (passwordInput) {
    passwordInput.addEventListener('input', function() {
        updatePasswordStrength(this.value);
    });
}

function updatePasswordStrength(password) {
    const strengthIndicator = document.getElementById('strengthIndicator');
    const strengthText = document.getElementById('strengthText');
    
    let strength = 0;
    let text = 'Weak';
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    const widths = ['20%', '40%', '60%', '80%', '100%'];
    const colors = ['#ff4444', '#ffaa00', '#ffdd00', '#aaff00', '#44ff44'];
    const texts = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    
    strengthIndicator.style.width = widths[strength];
    strengthIndicator.style.background = colors[strength];
    strengthText.textContent = texts[strength];
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Simulate login
    console.log('Login attempt:', { email, password });
    
    // Store login status in localStorage
    localStorage.setItem('webpotUserLoggedIn', 'true');
    localStorage.setItem('webpotUserEmail', email);
    
    showSuccessModal('Welcome!', 'You have successfully signed in.');
}

// Handle registration form submission
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    
    // Validate passwords match
    if (password !== confirm) {
        alert('Passwords do not match!');
        return;
    }
    
    if (!name || !email || !password) {
        alert('Please fill in all fields');
        return;
    }
    
    // Send to Google Apps Script backend
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzQQRc_0FXAqZuLqvNymNMdkhG4lu7DX3jX9pkrT_aawwbbmmaZ0NNs7q0gpGWCymlO/exec';
    
    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            formType: 'register',
            name: name,
            email: email,
            password: password
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('webpotUserLoggedIn', 'true');
            localStorage.setItem('webpotUserEmail', email);
            localStorage.setItem('webpotUserName', name);
            
            showSuccessModal('Account Created!', data.message);
            document.getElementById('registerForm').reset();
            updatePasswordStrength('');
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Registration failed. Please try again.');
    });
}

// Show success modal
function showSuccessModal(title, message) {
    const modal = document.getElementById('successModal');
    document.getElementById('successTitle').textContent = title;
    document.getElementById('successMessage').textContent = message;
    modal.classList.add('show');
}

// Close success modal
function closeSuccess() {
    const modal = document.getElementById('successModal');
    modal.classList.remove('show');
    // Redirect to home page
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 300);
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('successModal');
    const content = document.querySelector('.success-content');
    
    if (modal.classList.contains('show') && !content.contains(event.target)) {
        closeSuccess();
    }
});

// Add some interactivity to form fields
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.boxShadow = '0 0 20px rgba(0, 212, 255, 0.3)';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.boxShadow = 'none';
    });
});

// Social button placeholders
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const provider = this.textContent.includes('Google') ? 'Google' : 'GitHub';
        alert(`${provider} login coming soon!`);
    });
});

// Terms and Privacy Modal Functions
function showTermsModal(event) {
    event.preventDefault();
    const termsModal = document.getElementById('termsModal');
    termsModal.style.display = 'flex';
    loadTermsContent();
    setupScrollDetection('termsBody', 'terms');
}

function closeTermsModal() {
    document.getElementById('termsModal').style.display = 'none';
}

function showPrivacyModal(event) {
    if (event) event.preventDefault();
    const privacyModal = document.getElementById('privacyModal');
    privacyModal.style.display = 'flex';
    loadPrivacyContent();
    setupScrollDetection('privacyBody', 'privacy');
}

function closePrivacyModal() {
    document.getElementById('privacyModal').style.display = 'none';
}

// Load Terms Content from terms.html
function loadTermsContent() {
    const termsBody = document.getElementById('termsBody');
    termsBody.innerHTML = '';
    fetch('terms.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const termsContainer = doc.querySelector('.terms-container');
            if (termsContainer) {
                let foundH1 = false;
                let content = '';
                termsContainer.childNodes.forEach(node => {
                    if (foundH1) {
                        if (node.nodeType === 1) {
                            content += node.outerHTML;
                        } else if (node.nodeType === 3) {
                            content += node.textContent;
                        }
                    }
                    if (node.nodeType === 1 && node.tagName === 'H1') {
                        foundH1 = true;
                    }
                });
                termsBody.innerHTML = content || '<p>Error: No terms content found after heading.</p>';
            } else {
                termsBody.innerHTML = '<p>Error loading Terms of Service. Please visit <a href="terms.html" target="_blank">terms.html</a> directly.</p>';
            }
        })
        .catch(error => {
            console.error('Error loading terms:', error);
            termsBody.innerHTML = '<p>Error loading Terms of Service. Please visit <a href="terms.html" target="_blank">terms.html</a> directly.</p>';
        });
}

// Load Privacy Content from privacy.html
function loadPrivacyContent() {
    const privacyBody = document.getElementById('privacyBody');
    privacyBody.innerHTML = '';
    fetch('privacy.html')
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const privacyContainer = doc.querySelector('.privacy-container');
            if (privacyContainer) {
                let foundH1 = false;
                let content = '';
                privacyContainer.childNodes.forEach(node => {
                    if (foundH1) {
                        if (node.nodeType === 1) {
                            content += node.outerHTML;
                        } else if (node.nodeType === 3) {
                            content += node.textContent;
                        }
                    }
                    if (node.nodeType === 1 && node.tagName === 'H1') {
                        foundH1 = true;
                    }
                });
                privacyBody.innerHTML = content || '<p>Error: No privacy content found after heading.</p>';
            } else {
                privacyBody.innerHTML = '<p>Error loading Privacy Policy. Please visit <a href="privacy.html" target="_blank">privacy.html</a> directly.</p>';
            }
        })
        .catch(error => {
            console.error('Error loading privacy policy:', error);
            privacyBody.innerHTML = '<p>Error loading Privacy Policy. Please visit <a href="privacy.html" target="_blank">privacy.html</a> directly.</p>';
        });
}

// Setup scroll detection to auto-open next modal or check checkbox
function setupScrollDetection(containerId, modalType) {
    const container = document.getElementById(containerId);
    let hasReachedBottom = false;
    
    container.addEventListener('scroll', function() {
        // Check if scrolled to bottom (with 50px tolerance)
        if (container.scrollHeight - container.scrollTop <= container.clientHeight + 50) {
            if (!hasReachedBottom) {
                hasReachedBottom = true;
                
                if (modalType === 'terms') {
                    // User finished reading terms, auto-close and open privacy
                    closeTermsModal();
                    setTimeout(() => showPrivacyModal(), 300);
                } else if (modalType === 'privacy') {
                    // User finished reading privacy, auto-close and check checkbox
                    closePrivacyModal();
                    const checkbox = document.getElementById('termsCheckbox');
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                }
            }
        } else {
            hasReachedBottom = false;
        }
    });
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const termsModal = document.getElementById('termsModal');
    const privacyModal = document.getElementById('privacyModal');
    
    if (event.target === termsModal) {
        closeTermsModal();
    }
    if (event.target === privacyModal) {
        closePrivacyModal();
    }
});
