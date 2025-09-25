class CRMLoginSimple {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.loginBtn = document.getElementById('loginBtn');
        this.togglePasswordBtn = document.getElementById('togglePassword');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupValidation();
    }

    setupEventListeners() {
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Password visibility toggle
        this.togglePasswordBtn.addEventListener('click', () => this.togglePasswordVisibility());
        
        // Real-time validation
        this.usernameInput.addEventListener('input', () => this.validateUsername());
        this.usernameInput.addEventListener('blur', () => this.validateUsername());
        
        this.passwordInput.addEventListener('input', () => this.validatePassword());
        this.passwordInput.addEventListener('blur', () => this.validatePassword());
        
        // Form validation check
        [this.usernameInput, this.passwordInput].forEach(input => {
            input.addEventListener('input', () => this.checkFormValidity());
        });
    }

    setupValidation() {
        // Email/Username validation patterns
        this.emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        this.usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    }

    validateUsername() {
        const value = this.usernameInput.value.trim();
        const errorElement = document.getElementById('usernameError');
        
        if (!value) {
            this.setFieldState(this.usernameInput, errorElement, '', 'neutral');
            return false;
        }
        
        // Check if it's email or username
        const isEmail = this.emailRegex.test(value);
        const isUsername = this.usernameRegex.test(value);
        
        if (isEmail || isUsername) {
            this.setFieldState(this.usernameInput, errorElement, '', 'valid');
            return true;
        } else {
            this.setFieldState(this.usernameInput, errorElement, 
                'Please enter a valid email address or username (3-20 characters)', 'invalid');
            return false;
        }
    }

    validatePassword() {
        const value = this.passwordInput.value;
        const errorElement = document.getElementById('passwordError');
        
        if (!value) {
            this.setFieldState(this.passwordInput, errorElement, '', 'neutral');
            return false;
        }
        
        if (value.length < 6) {
            this.setFieldState(this.passwordInput, errorElement, 
                'Password must be at least 6 characters long', 'invalid');
            return false;
        }
        
        this.setFieldState(this.passwordInput, errorElement, '', 'valid');
        return true;
    }

    setFieldState(input, errorElement, message, state) {
        // Remove all state classes
        input.classList.remove('valid', 'invalid');
        
        // Add appropriate class
        if (state !== 'neutral') {
            input.classList.add(state);
        }
        
        // Set error message
        errorElement.textContent = message;
    }

    checkFormValidity() {
        const isUsernameValid = this.validateUsername();
        const isPasswordValid = this.validatePassword();
        
        // Enable/disable login button
        this.loginBtn.disabled = !(isUsernameValid && isPasswordValid);
    }

    togglePasswordVisibility() {
        const isPassword = this.passwordInput.type === 'password';
        
        // Toggle input type
        this.passwordInput.type = isPassword ? 'text' : 'password';
        
        // Toggle icon
        const icon = this.togglePasswordBtn.querySelector('i');
        icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
        
        // Add visual feedback
        this.togglePasswordBtn.style.color = isPassword ? '#667eea' : '#a0aec0';
        
        // Maintain focus on password field
        this.passwordInput.focus();
    }

    async handleLogin(e) {
        e.preventDefault();
        
        // Final validation check
        if (!this.validateUsername() || !this.validatePassword()) {
            return;
        }
        
        // Show loading state
        this.setLoadingState(true);
        
        try {
            // Simulate authentication
            const result = await this.authenticateUser({
                username: this.usernameInput.value.trim(),
                password: this.passwordInput.value
            });
            
            if (result.success) {
                this.handleLoginSuccess(result.user);
            } else {
                this.handleLoginError(result.message);
            }
            
        } catch (error) {
            this.handleLoginError('Connection error. Please try again.');
        } finally {
            this.setLoadingState(false);
        }
    }

    async authenticateUser(credentials) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock authentication logic
        const validUsers = [
            { username: 'admin@salespro.com', password: 'admin123', name: 'Admin User' },
            { username: 'ramyaS', password: 'ramya123', name: 'Designer' },
            { username: 'kishoreK', password: 'kishore2299', name: 'Developer' }
            
        ];
        
        const user = validUsers.find(u => 
            (u.username === credentials.username) && 
            (u.password === credentials.password)
        );
        
        if (user) {
            return { 
                success: true, 
                user: { name: user.name, username: user.username }
            };
        } else {
            return { 
                success: false, 
                message: 'Invalid username or password' 
            };
        }
    }

    handleLoginSuccess(user) {
        // Visual feedback
        this.showSuccessMessage(`Welcome back, ${user.name}!`);
        
        // Simulate redirect after delay
        setTimeout(() => {
            console.log('Redirecting to dashboard...');
             window.location.href = '.'; // Replace with actual dashboard URL
        }, 2000);
    }

    handleLoginError(message) {
        // Show error in password field
        const errorElement = document.getElementById('passwordError');
        this.setFieldState(this.passwordInput, errorElement, message, 'invalid');
        
        // Clear password field
        this.passwordInput.value = '';
        this.passwordInput.focus();
        
        // Shake animation
        this.form.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            this.form.style.animation = '';
        }, 500);
    }

    setLoadingState(isLoading) {
        const btnText = this.loginBtn.querySelector('.btn-text');
        const spinner = this.loginBtn.querySelector('.loading-spinner');
        
        if (isLoading) {
            this.loginBtn.classList.add('loading');
            this.loginBtn.disabled = true;
            btnText.style.opacity = '0';
            spinner.classList.remove('hidden');
        } else {
            this.loginBtn.classList.remove('loading');
            btnText.style.opacity = '1';
            spinner.classList.add('hidden');
            this.checkFormValidity();
        }
    }

    showSuccessMessage(message) {
        // Create and show success message
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #48bb78, #38a169);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(72, 187, 120, 0.3);
            z-index: 1000;
            font-weight: 600;
            animation: slideInRight 0.3s ease-out;
        `;
        successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        
        document.body.appendChild(successDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }
}

// Add shake animation CSS
const shakeCSS = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(100px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}
`;

// Inject shake animation
const style = document.createElement('style');
style.textContent = shakeCSS;
document.head.appendChild(style);

// Initialize the login system
document.addEventListener('DOMContentLoaded', () => {
    new CRMLoginSimple();
});
