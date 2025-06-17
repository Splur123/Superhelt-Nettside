/**
 * Validates user registration data
 * @param {Object} userData - User data to validate
 * @returns {Array} - Array of error messages if validation fails, empty array if validation passes
 */
exports.validateRegistration = (userData) => {
    const errors = [];
    const { username, email, password, confirmPassword } = userData;
    
    // Check required fields
    if (!username || !email || !password || !confirmPassword) {
        errors.push('Vennligst fyll ut alle felt');
    }
    
    // Validate username length
    if (username && username.length < 3) {
        errors.push('Brukernavnet må være minst 3 tegn');
    }
    
    // Validate email format
    if (email && !isValidEmail(email)) {
        errors.push('Ugyldig e-postformat');
    }
    
    // Validate password length
    if (password && password.length < 6) {
        errors.push('Passord må være minst 6 tegn');
    }
    
    // Check if passwords match
    if (password && confirmPassword && password !== confirmPassword) {
        errors.push('Passordene er ikke like');
    }
    
    return errors;
};

/**
 * Validates login data
 * @param {Object} loginData - Login data to validate
 * @returns {Array} - Array of error messages if validation fails, empty array if validation passes
 */
exports.validateLogin = (loginData) => {
    const errors = [];
    const { email, password } = loginData;
    
    // Check required fields
    if (!email || !password) {
        errors.push('Vennligst fyll ut alle felt');
    }
    
    // Validate email format
    if (email && !isValidEmail(email)) {
        errors.push('Ugyldig e-postformat');
    }
    
    return errors;
};

/**
 * Checks if an email is valid
 * @param {String} email - Email to validate
 * @returns {Boolean} - True if valid, false otherwise
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
