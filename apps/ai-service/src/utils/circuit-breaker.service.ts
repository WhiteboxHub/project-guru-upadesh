import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

interface CircuitBreakerStats {
  failures: number;
  successes: number;
  lastFailureTime: number;
  state: CircuitState;
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private nextAttemptTime: number = 0;

  private readonly failureThreshold: number;
  private readonly timeout: number;
  private readonly resetTimeout: number;
  private readonly halfOpenMaxAttempts: number = 3;

  constructor(private readonly configService: ConfigService) {
    this.failureThreshold = this.configService.get<number>('CIRCUIT_BREAKER_THRESHOLD', 5);
    this.timeout = this.configService.get<number>('CIRCUIT_BREAKER_TIMEOUT', 30000);
    this.resetTimeout = this.configService.get<number>('CIRCUIT_BREAKER_RESET_TIMEOUT', 60000);

    this.logger.log(
      `Circuit breaker initialized - Threshold: ${this.failureThreshold}, Timeout: ${this.timeout}ms, Reset: ${this.resetTimeout}ms`,
    );
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        this.logger.warn('Circuit breaker is OPEN - request rejected');
        throw new Error('Service temporarily unavailable. Circuit breaker is OPEN.');
      }

      // Transition to HALF_OPEN
      this.logger.log('Circuit breaker transitioning to HALF_OPEN');
      this.state = CircuitState.HALF_OPEN;
      this.successCount = 0;
    }

    try {
      const result = await this.executeWithTimeout(fn);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Execute function with timeout
   */
  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error('Operation timeout')), this.timeout),
      ),
    ]);
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount += 1;

      if (this.successCount >= this.halfOpenMaxAttempts) {
        this.logger.log('Circuit breaker CLOSED after successful recovery');
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
      }
    }
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.failureCount += 1;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      this.logger.warn('Circuit breaker re-OPENED after failure in HALF_OPEN state');
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.resetTimeout;
      this.successCount = 0;
      return;
    }

    if (this.failureCount >= this.failureThreshold) {
      this.logger.warn(
        `Circuit breaker OPENED after ${this.failureCount} failures (threshold: ${this.failureThreshold})`,
      );
      this.state = CircuitState.OPEN;
      this.nextAttemptTime = Date.now() + this.resetTimeout;
    }
  }

  /**
   * Get current circuit breaker state
   */
  getState(): string {
    return this.state;
  }

  /**
   * Get circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      failures: this.failureCount,
      successes: this.successCount,
      lastFailureTime: this.lastFailureTime,
      state: this.state,
    };
  }

  /**
   * Manually reset circuit breaker (use with caution)
   */
  reset(): void {
    this.logger.log('Circuit breaker manually reset');
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
    this.nextAttemptTime = 0;
  }

  /**
   * Check if circuit breaker is operational
   */
  isOperational(): boolean {
    return this.state !== CircuitState.OPEN;
  }

  /**
   * Get time until next attempt (for OPEN state)
   */
  getTimeUntilNextAttempt(): number {
    if (this.state !== CircuitState.OPEN) {
      return 0;
    }

    const remaining = this.nextAttemptTime - Date.now();
    return Math.max(0, remaining);
  }
}
