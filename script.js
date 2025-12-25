// Mobile Menu Toggle Functions
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('active');
}

function closeMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.remove('active');
}

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    const navMenu = document.getElementById('navMenu');
    const menuToggle = document.getElementById('menuToggle');
    if (!navMenu.contains(event.target) && !menuToggle.contains(event.target)) {
        navMenu.classList.remove('active');
    }
});

// Intersection Observer for scroll-triggered animations
const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
        }
    });
}, observerOptions);

// Display user profile when logged in
function displayUserProfile() {
    const userName = localStorage.getItem('webpotUserName');
    const userEmail = localStorage.getItem('webpotUserEmail');
    const userProfilePic = localStorage.getItem('webpotUserProfilePic');
    const isLoggedIn = localStorage.getItem('webpotUserLoggedIn');
    
    const profileDiv = document.getElementById('userProfile');
    const profilePic = document.getElementById('profilePic');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (isLoggedIn && userName) {
        // Show profile picture if available
        if (userProfilePic) {
            profilePic.src = userProfilePic;
            profilePic.style.display = 'block';
            profilePic.title = userName;
        }
        
        userNameDisplay.textContent = userName.split(' ')[0]; // Show first name
        logoutBtn.style.display = 'inline-block';
    } else {
        profilePic.style.display = 'none';
        userNameDisplay.textContent = '';
        logoutBtn.style.display = 'none';
    }
}

// Logout user
function logoutUser() {
    localStorage.removeItem('webpotUserLoggedIn');
    localStorage.removeItem('webpotUserEmail');
    localStorage.removeItem('webpotUserName');
    localStorage.removeItem('webpotUserProfilePic');
    
    displayUserProfile();
    window.location.href = 'index.html';
}

// Observe service cards on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    displayUserProfile(); // Show user profile on page load
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        observer.observe(card);
    });
});

// Modal Functions
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('webpotUserLoggedIn');
    if (!isLoggedIn) {
        window.location.href = 'auth.html';
        return false;
    }
    return true;
}

function openOrderModal() {
    if (!checkLoginStatus()) return;
    document.getElementById('orderModal').style.display = 'block';
    closeMenu();
}

function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('orderModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Select Service
function selectService(serviceName, price) {
    openOrderModal();
    document.getElementById('service').value = serviceName + ' - $' + price;
}

// Submit Order Form
function submitOrder(event) {
    event.preventDefault();
    
    const service = document.getElementById('service').value;
    const name = document.getElementById('oname').value;
    const email = document.getElementById('oemail').value;
    const phone = document.getElementById('ophone').value;
    const details = document.getElementById('details') ? document.getElementById('details').value : '';
    
    console.log('Form values:', { service, name, email, phone, details });
    
    // Extract amount from service selection
    let amount = 0;
    if (service.includes('2999')) amount = 2999;
    else if (service.includes('5999')) amount = 5999;
    else if (service.includes('9999')) amount = 9999;
    
    console.log('Extracted amount:', amount);
    
    if (!service || !name || !email || !amount) {
        alert('Please fill in all required fields');
        console.error('Missing fields:', { service, name, email, amount });
        return;
    }
    
    // Send to Google Apps Script backend
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwSwzGN4w5VycG1KA-PivF_IjDf6C34f1_HO5DSi3G5IRXlLb8I-ri59BlWuLg7_Cxz/exec';
    
    const payload = {
        formType: 'order',
        service: service,
        name: name,
        email: email,
        phone: phone,
        amount: amount,
        specialRequests: details
    };
    
    console.log('Sending payload:', payload);
    
    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => {
        console.log('Response status:', res.status);
        return res.json();
    })
    .then(data => {
        console.log('Response data:', data);
        if (data.success) {
            alert(data.message);
            closeOrderModal();
            document.getElementById('orderForm').reset();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(err => {
        console.error('Full error:', err);
        alert('Failed to place order. Please try again. Check console for details.');
    });
}

// Submit Contact Form
function submitForm(event) {
    event.preventDefault();
    
    if (!checkLoginStatus()) return;
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const message = document.getElementById('message').value;
    
    if (!name || !email || !message) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Send to Google Apps Script backend
    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxCIYznFyqWykBAGcNvj9wtjjE9zCakuwiDANuYJy-p3ST0ggF05fZfshZLkHhUWqZb/exec';
    
    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            formType: 'contact',
            name: name,
            email: email,
            phone: phone,
            message: message
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            event.target.reset();
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(err => {
        console.error('Error:', err);
        alert('Failed to send message. Please try again.');
    });
}

// Show Success Message
function showSuccessMessage() {
    const successMsg = document.getElementById('successMessage');
    successMsg.style.display = 'block';
    
    setTimeout(() => {
        successMsg.style.display = 'none';
    }, 2000);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
// Scroll to Top Button Functionality
const scrollToTopBtn = document.getElementById('scrollToTopBtn');

// Show button when scrolled down
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('show');
    } else {
        scrollToTopBtn.classList.remove('show');
    }
});

// Scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}