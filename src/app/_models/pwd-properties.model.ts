/**
 * Representa las políticas de seguridad y requisitos para la contraseña de un usuario.
 */
export class PwdProperties {
    
    requireMinLength: number;
    requireUppercase: true;
    requireLowercase: true;
    requireDigit: true;
    requireNonAlphanumeric: true;
    userNameCannotBeInPassword: true;
}
