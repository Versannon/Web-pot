// Modal Functions
function openOrderModal() {
    document.getElementById('orderModal').style.display = 'block';
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
    
    const formData = new FormData(event.target);
    const data = {
        service: formData.get('service'),
        name: formData.get('oname'),
        email: formData.get('oemail'),
        phone: formData.get('ophone'),
        details: formData.get('details'),
        deadline: formData.get('deadline'),
        budget: formData.get('budget'),
        timestamp: new Date().toISOString()
    };

    console.log('Order submitted:', data);
    showSuccessMessage();
    closeOrderModal();
    event.target.reset();
}

// Submit Contact Form
function submitForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        message: formData.get('message'),
        timestamp: new Date().toISOString()
    };

    console.log('Contact form submitted:', data);
    showSuccessMessage();
    event.target.reset();
}

// Show Success Message
function showSuccessMessage() {
    const successMsg = document.getElementById('successMessage');
    successMsg.style.display = 'block';
    
    setTimeout(() => {
        successMsg.style.display = 'none';
    }, 4000);
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
