// Initialize EmailJS
emailjs.init('YrET6SKEEXROvJDRG');

// Form elements
const form = document.getElementById('registrationForm');
const submitBtn = document.querySelector('.submit-btn');

// Form validation patterns
const patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
};

// Real-time validation
const inputs = form.querySelectorAll('input:not([type="radio"]), select, textarea');

inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
            validateField(input);
        }
    });
});

// Validate individual field
function validateField(field) {
    const formGroup = field.closest('.form-group');
    const errorMessage = formGroup.querySelector('.error-message');
    let isValid = true;
    let message = '';

    // Check if field is required and empty
    if (field.hasAttribute('required') && !field.value.trim()) {
        isValid = false;
        message = 'This field is required';
    }
    // Email validation
    else if (field.type === 'email' && field.value && !patterns.email.test(field.value)) {
        isValid = false;
        message = 'Please enter a valid email address';
    }
    // Phone validation
    else if (field.type === 'tel' && field.value && !patterns.phone.test(field.value)) {
        isValid = false;
        message = 'Please enter a valid phone number';
    }
    // Date validation (must be in the past)
    else if (field.type === 'date' && field.value) {
        const selectedDate = new Date(field.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate >= today) {
            isValid = false;
            message = 'Date of birth must be in the past';
        }
    }

    // Update UI
    if (isValid) {
        formGroup.classList.remove('error');
        errorMessage.textContent = '';
    } else {
        formGroup.classList.add('error');
        errorMessage.textContent = message;
    }

    return isValid;
}

// Validate radio groups
function validateRadioGroup(name) {
    const radioGroup = form.querySelector(`input[name="${name}"]`).closest('.form-group');
    const errorMessage = radioGroup.querySelector('.error-message');
    const isChecked = form.querySelector(`input[name="${name}"]:checked`);

    if (!isChecked) {
        radioGroup.classList.add('error');
        errorMessage.textContent = 'Please select an option';
        return false;
    } else {
        radioGroup.classList.remove('error');
        errorMessage.textContent = '';
        return true;
    }
}

// Validate entire form
function validateForm() {
    let isValid = true;

    // Validate all input fields
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });

    // Validate radio groups
    if (!validateRadioGroup('gender')) isValid = false;
    if (!validateRadioGroup('receivedServices')) isValid = false;

    return isValid;
}

// Collect form data
function collectFormData() {
    const formData = new FormData(form);
    const data = {};

    // Get all form fields
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }

    // Combine address fields
    data.fullAddress = `${data.house}, ${data.street}, ${data.town}`;

    // Format the data for email template
    return {
        title: data.title,
        fullName: data.fullName,
        email: data.email,
        purpose: data.purpose,
        address: data.fullAddress,
        phone: data.phone,
        gender: data.gender,
        dob: data.dob,
        diagnosis: data.diagnosis,
        receivedServices: data.receivedServices,
        impact: data.impact,
        submissionDate: new Date().toLocaleString()
    };
}

// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
        // Scroll to first error
        const firstError = form.querySelector('.form-group.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
    }

    // Show loading state
    submitBtn.classList.add('loading');

    try {
        // Collect form data
        const templateParams = collectFormData();

        // Send email via EmailJS
        const response = await emailjs.send(
            'service_0dt6vc8',
            'template_ofp7pqv',
            templateParams
        );

        console.log('Email sent successfully:', response);

        // Store success state
        sessionStorage.setItem('formSubmitted', 'true');

        // Redirect to success page
        window.location.href = 'success.html';

    } catch (error) {
        console.error('Error sending email:', error);

        // Remove loading state
        submitBtn.classList.remove('loading');

        // Show error message
        alert('Sorry, there was an error submitting your form. Please try again or contact support.');
    }
});

// Auto-save form data to prevent data loss
function autoSaveForm() {
    const formData = {};
    inputs.forEach(input => {
        if (input.value) {
            formData[input.id || input.name] = input.value;
        }
    });

    // Save radio button selections
    const radioGroups = ['gender', 'receivedServices'];
    radioGroups.forEach(name => {
        const selected = form.querySelector(`input[name="${name}"]:checked`);
        if (selected) {
            formData[name] = selected.value;
        }
    });

    sessionStorage.setItem('iganze_form_draft', JSON.stringify(formData));
}

// Restore form data on load
function restoreFormData() {
    const savedData = sessionStorage.getItem('iganze_form_draft');
    if (savedData) {
        try {
            const formData = JSON.parse(savedData);

            // Restore input values
            Object.keys(formData).forEach(key => {
                const field = form.querySelector(`#${key}, [name="${key}"]`);
                if (field && field.type !== 'radio') {
                    field.value = formData[key];
                } else if (field && field.type === 'radio') {
                    const radio = form.querySelector(`input[name="${key}"][value="${formData[key]}"]`);
                    if (radio) radio.checked = true;
                }
            });
        } catch (error) {
            console.error('Error restoring form data:', error);
        }
    }
}

// Auto-save every 30 seconds
setInterval(autoSaveForm, 30000);

// Save on input change
inputs.forEach(input => {
    input.addEventListener('change', autoSaveForm);
});

// Restore data on page load
window.addEventListener('load', restoreFormData);

// Clear saved data on successful submission
window.addEventListener('beforeunload', () => {
    if (!sessionStorage.getItem('formSubmitted')) {
        autoSaveForm();
    }
});

// Add smooth entrance animations
window.addEventListener('load', () => {
    const formGroups = document.querySelectorAll('.fade-in');
    formGroups.forEach((group, index) => {
        setTimeout(() => {
            group.style.opacity = '1';
        }, index * 50);
    });
});
