import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from './cache.service';

interface TokenUsage {
  operation: string;
  timestamp: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

interface UsageStats {
  totalOperations: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  estimatedTotalCost: number;
  operationBreakdown: Record<string, {
    count: number;
    totalTokens: number;
    estimatedCost: number;
  }>;
}

@Injectable()
export class TokenCounterService {
  private readonly logger = new Logger(TokenCounterService.name);
  private readonly CACHE_KEY_PREFIX = 'token-usage:';
  private readonly STATS_KEY = 'token-stats';

  // Pricing per 1M tokens (as of latest pricing)
  private readonly PRICING = {
    'claude-3-5-sonnet-20241022': {
      input: 3.0, // $3 per 1M input tokens
      output: 15.0, // $15 per 1M output tokens
    },
    'claude-3-opus-20240229': {
      input: 15.0,
      output: 75.0,
    },
    'claude-3-sonnet-20240229': {
      input: 3.0,
      output: 15.0,
    },
    'claude-3-haiku-20240307': {
      input: 0.25,
      output: 1.25,
    },
  };

  constructor(private readonly cacheService: CacheService) {}

  /**
   * Estimate token count for text (rough approximation)
   * Claude uses ~4 characters per token on average
   */
  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Track token usage for an operation
   */
  async trackUsage(operation: string, prompt: string, response: string, model?: string): Promise<void> {
    try {
      const inputTokens = this.estimateTokens(prompt);
      const outputTokens = this.estimateTokens(response);
      const totalTokens = inputTokens + outputTokens;

      const modelKey = model || 'claude-3-5-sonnet-20241022';
      const pricing = this.PRICING[modelKey as keyof typeof this.PRICING] || this.PRICING['claude-3-5-sonnet-20241022'];

      const estimatedCost = (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;

      const usage: TokenUsage = {
        operation,
        timestamp: Date.now(),
        inputTokens,
        outputTokens,
        totalTokens,
        estimatedCost,
      };

      // Store individual usage record (keep for 7 days)
      const usageKey = `${this.CACHE_KEY_PREFIX}${operation}:${Date.now()}`;
      await this.cacheService.set(usageKey, usage, 7 * 24 * 60 * 60);

      // Update aggregate stats
      await this.updateStats(operation, usage);

      this.logger.debug(
        `Token usage tracked - Operation: ${operation}, Input: ${inputTokens}, Output: ${outputTokens}, Cost: $${estimatedCost.toFixed(4)}`,
      );
    } catch (error) {
      this.logger.error('Failed to track token usage', error);
    }
  }

  /**
   * Update aggregate statistics
   */
  private async updateStats(operation: string, usage: TokenUsage): Promise<void> {
    try {
      const stats = await this.getStats();

      stats.totalOperations += 1;
      stats.totalInputTokens += usage.inputTokens;
      stats.totalOutputTokens += usage.outputTokens;
      stats.totalTokens += usage.totalTokens;
      stats.estimatedTotalCost += usage.estimatedCost;

      if (!stats.operationBreakdown[operation]) {
        stats.operationBreakdown[operation] = {
          count: 0,
          totalTokens: 0,
          estimatedCost: 0,
        };
      }

      stats.operationBreakdown[operation].count += 1;
      stats.operationBreakdown[operation].totalTokens += usage.totalTokens;
      stats.operationBreakdown[operation].estimatedCost += usage.estimatedCost;

      // Store stats (keep for 30 days)
      await this.cacheService.set(this.STATS_KEY, stats, 30 * 24 * 60 * 60);
    } catch (error) {
      this.logger.error('Failed to update token stats', error);
    }
  }

  /**
   * Get aggregate usage statistics
   */
  async getStats(): Promise<UsageStats> {
    try {
      const stats = await this.cacheService.get<UsageStats>(this.STATS_KEY);
      if (stats) {
        return stats;
      }
    } catch (error) {
      this.logger.error('Failed to get token stats', error);
    }

    // Return empty stats if not found
    return {
      totalOperations: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      estimatedTotalCost: 0,
      operationBreakdown: {},
    };
  }

  /**
   * Get usage statistics for a specific time period
   */
  async getStatsByPeriod(startTime: number, endTime: number): Promise<UsageStats> {
    // This would require querying all usage records in the time range
    // For now, return overall stats
    // In production, you'd want to use a proper time-series database
    return this.getStats();
  }

  /**
   * Reset statistics (use with caution)
   */
  async resetStats(): Promise<void> {
    try {
      await this.cacheService.delete(this.STATS_KEY);
      await this.cacheService.deletePattern(`${this.CACHE_KEY_PREFIX}*`);
      this.logger.warn('Token usage statistics reset');
    } catch (error) {
      this.logger.error('Failed to reset token stats', error);
    }
  }

  /**
   * Get current cost estimate for operation
   */
  estimateCost(inputTokens: number, outputTokens: number, model?: string): number {
    const modelKey = model || 'claude-3-5-sonnet-20241022';
    const pricing = this.PRICING[modelKey as keyof typeof this.PRICING] || this.PRICING['claude-3-5-sonnet-20241022'];

    return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
  }

  /**
   * Check if usage is within budget limits
   */
  async checkBudget(dailyBudgetUsd: number): Promise<{
    withinBudget: boolean;
    currentSpend: number;
    remainingBudget: number;
  }> {
    const stats = await this.getStats();

    // For simplicity, we're checking total spend
    // In production, you'd want to check daily/monthly periods
    const currentSpend = stats.estimatedTotalCost;
    const remainingBudget = dailyBudgetUsd - currentSpend;

    return {
      withinBudget: remainingBudget > 0,
      currentSpend,
      remainingBudget: Math.max(0, remainingBudget),
    };
  }
}
