import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CircuitBreakerService } from './circuit-breaker.service';

describe('CircuitBreakerService', () => {
  let service: CircuitBreakerService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        CIRCUIT_BREAKER_THRESHOLD: 3,
        CIRCUIT_BREAKER_TIMEOUT: 1000,
        CIRCUIT_BREAKER_RESET_TIMEOUT: 2000,
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CircuitBreakerService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CircuitBreakerService>(CircuitBreakerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    service.reset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('state management', () => {
    it('should start in CLOSED state', () => {
      expect(service.getState()).toBe('CLOSED');
    });

    it('should transition to OPEN after threshold failures', async () => {
      const failingFn = jest.fn().mockRejectedValue(new Error('Failure'));

      // Cause failures up to threshold
      for (let i = 0; i < 3; i++) {
        await expect(service.execute(failingFn)).rejects.toThrow();
      }

      expect(service.getState()).toBe('OPEN');
    });

    it('should reject requests when OPEN', async () => {
      const failingFn = jest.fn().mockRejectedValue(new Error('Failure'));

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await expect(service.execute(failingFn)).rejects.toThrow();
      }

      // Next request should be rejected immediately
      await expect(service.execute(failingFn)).rejects.toThrow(
        'Service temporarily unavailable',
      );

      // Function should not have been called
      expect(failingFn).toHaveBeenCalledTimes(3);
    });

    it('should transition to HALF_OPEN after reset timeout', async () => {
      jest.useFakeTimers();

      const failingFn = jest.fn().mockRejectedValue(new Error('Failure'));

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await expect(service.execute(failingFn)).rejects.toThrow();
      }

      expect(service.getState()).toBe('OPEN');

      // Advance time past reset timeout
      jest.advanceTimersByTime(2100);

      // Next request should transition to HALF_OPEN
      const successFn = jest.fn().mockResolvedValue('success');
      await service.execute(successFn);

      expect(service.getState()).toBe('HALF_OPEN');

      jest.useRealTimers();
    });

    it('should transition from HALF_OPEN to CLOSED after successful requests', async () => {
      const failingFn = jest.fn().mockRejectedValue(new Error('Failure'));
      const successFn = jest.fn().mockResolvedValue('success');

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await expect(service.execute(failingFn)).rejects.toThrow();
      }

      // Manually transition to HALF_OPEN
      service['state'] = 'HALF_OPEN' as any;

      // Execute successful requests
      await service.execute(successFn);
      await service.execute(successFn);
      await service.execute(successFn);

      expect(service.getState()).toBe('CLOSED');
    });

    it('should transition from HALF_OPEN to OPEN on failure', async () => {
      const failingFn = jest.fn().mockRejectedValue(new Error('Failure'));

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await expect(service.execute(failingFn)).rejects.toThrow();
      }

      // Manually transition to HALF_OPEN
      service['state'] = 'HALF_OPEN' as any;

      // Failure in HALF_OPEN should reopen circuit
      await expect(service.execute(failingFn)).rejects.toThrow();

      expect(service.getState()).toBe('OPEN');
    });
  });

  describe('timeout handling', () => {
    it('should timeout long-running operations', async () => {
      jest.useFakeTimers();

      const slowFn = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 5000)),
      );

      const executePromise = service.execute(slowFn);

      // Advance time past timeout
      jest.advanceTimersByTime(1100);

      await expect(executePromise).rejects.toThrow('Operation timeout');

      jest.useRealTimers();
    });
  });

  describe('statistics', () => {
    it('should track failure count', async () => {
      const failingFn = jest.fn().mockRejectedValue(new Error('Failure'));

      await expect(service.execute(failingFn)).rejects.toThrow();
      await expect(service.execute(failingFn)).rejects.toThrow();

      const stats = service.getStats();

      expect(stats.failures).toBe(2);
    });

    it('should reset failure count on success', async () => {
      const failingFn = jest.fn().mockRejectedValue(new Error('Failure'));
      const successFn = jest.fn().mockResolvedValue('success');

      await expect(service.execute(failingFn)).rejects.toThrow();
      await expect(service.execute(failingFn)).rejects.toThrow();

      const statsBeforeSuccess = service.getStats();
      expect(statsBeforeSuccess.failures).toBe(2);

      await service.execute(successFn);

      const statsAfterSuccess = service.getStats();
      expect(statsAfterSuccess.failures).toBe(0);
    });
  });

  describe('reset', () => {
    it('should reset circuit breaker state', async () => {
      const failingFn = jest.fn().mockRejectedValue(new Error('Failure'));

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await expect(service.execute(failingFn)).rejects.toThrow();
      }

      expect(service.getState()).toBe('OPEN');

      service.reset();

      expect(service.getState()).toBe('CLOSED');
      expect(service.getStats().failures).toBe(0);
    });
  });

  describe('isOperational', () => {
    it('should return true when CLOSED', () => {
      expect(service.isOperational()).toBe(true);
    });

    it('should return false when OPEN', async () => {
      const failingFn = jest.fn().mockRejectedValue(new Error('Failure'));

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await expect(service.execute(failingFn)).rejects.toThrow();
      }

      expect(service.isOperational()).toBe(false);
    });
  });

  describe('getTimeUntilNextAttempt', () => {
    it('should return 0 when not OPEN', () => {
      expect(service.getTimeUntilNextAttempt()).toBe(0);
    });

    it('should return remaining time when OPEN', async () => {
      jest.useFakeTimers();

      const failingFn = jest.fn().mockRejectedValue(new Error('Failure'));

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        await expect(service.execute(failingFn)).rejects.toThrow();
      }

      const remaining = service.getTimeUntilNextAttempt();
      expect(remaining).toBeGreaterThan(0);

      jest.useRealTimers();
    });
  });
});
