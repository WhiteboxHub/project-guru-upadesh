import * as bcrypt from 'bcrypt';

export class PasswordUtil {
  private static readonly SALT_ROUNDS = parseInt(
    process.env.BCRYPT_ROUNDS || '12',
    10,
  );

  static async hash(password: string): Promise<string> {
    if (!password) {
      throw new Error('Password is required');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) {
      return false;
    }

    return bcrypt.compare(password, hash);
  }

  static validate(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!password) {
      errors.push('Password is required');
      return { valid: false, errors };
    }

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/[@$!%*?&#]/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&#)');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
