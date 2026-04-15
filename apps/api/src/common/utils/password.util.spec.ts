import { PasswordUtil } from './password.util';

describe('PasswordUtil', () => {
  describe('hash', () => {
    it('should hash a valid password', async () => {
      const password = 'Test1234!';
      const hash = await PasswordUtil.hash(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should throw error for empty password', async () => {
      await expect(PasswordUtil.hash('')).rejects.toThrow('Password is required');
    });

    it('should throw error for short password', async () => {
      await expect(PasswordUtil.hash('short')).rejects.toThrow(
        'Password must be at least 8 characters long',
      );
    });

    it('should generate different hashes for same password', async () => {
      const password = 'Test1234!';
      const hash1 = await PasswordUtil.hash(password);
      const hash2 = await PasswordUtil.hash(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('should return true for matching password and hash', async () => {
      const password = 'Test1234!';
      const hash = await PasswordUtil.hash(password);
      const result = await PasswordUtil.compare(password, hash);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password and hash', async () => {
      const password = 'Test1234!';
      const wrongPassword = 'Wrong1234!';
      const hash = await PasswordUtil.hash(password);
      const result = await PasswordUtil.compare(wrongPassword, hash);

      expect(result).toBe(false);
    });

    it('should return false for empty password', async () => {
      const hash = await PasswordUtil.hash('Test1234!');
      const result = await PasswordUtil.compare('', hash);

      expect(result).toBe(false);
    });

    it('should return false for empty hash', async () => {
      const result = await PasswordUtil.compare('Test1234!', '');

      expect(result).toBe(false);
    });
  });

  describe('validate', () => {
    it('should validate a strong password', () => {
      const result = PasswordUtil.validate('StrongPass123!');

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password without lowercase letter', () => {
      const result = PasswordUtil.validate('STRONGPASS123!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one lowercase letter',
      );
    });

    it('should reject password without uppercase letter', () => {
      const result = PasswordUtil.validate('strongpass123!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one uppercase letter',
      );
    });

    it('should reject password without number', () => {
      const result = PasswordUtil.validate('StrongPass!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special character', () => {
      const result = PasswordUtil.validate('StrongPass123');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Password must contain at least one special character (@$!%*?&#)',
      );
    });

    it('should reject password that is too short', () => {
      const result = PasswordUtil.validate('Pass1!');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password that is too long', () => {
      const longPassword = 'A'.repeat(130) + '1!';
      const result = PasswordUtil.validate(longPassword);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must be less than 128 characters');
    });

    it('should reject empty password', () => {
      const result = PasswordUtil.validate('');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password is required');
    });

    it('should collect multiple validation errors', () => {
      const result = PasswordUtil.validate('weak');

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
