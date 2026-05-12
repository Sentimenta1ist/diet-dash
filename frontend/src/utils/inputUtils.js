export function validateDigitsInput(value) {
    const regex = /\D/g; // Matches any non-digit character
    const digitsOnly = value.replace(regex, "").substring(0, 5); // Remove non-digits and limit to 5 digits
    return digitsOnly ? Number(digitsOnly) : 0; // Convert to number, return 0 if empty
}
