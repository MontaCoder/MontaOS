const MAX_FIELD_LENGTH = 2000;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeField = (value, maxLength = MAX_FIELD_LENGTH) => {
    if (typeof value !== 'string') return '';

    return value.replace(/[\r\n]+/g, ' ').trim().slice(0, maxLength);
};

const validateEmailRequest = (body = {}) => {
    const name = normalizeField(body.name, 120);
    const company = normalizeField(body.company, 120);
    const email = normalizeField(body.email, 320).toLowerCase();
    const message = normalizeField(body.message, 2000);
    const errors = [];

    if (!name) errors.push('name');
    if (!email || !EMAIL_PATTERN.test(email)) errors.push('email');
    if (!message) errors.push('message');

    return {
        valid: errors.length === 0,
        errors,
        value: {
            name,
            company,
            email,
            message,
        },
    };
};

module.exports = {
    normalizeField,
    validateEmailRequest,
};
