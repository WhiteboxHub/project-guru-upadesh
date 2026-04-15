import { registerAs } from '@nestjs/config';

export interface AiConfig {
  anthropicApiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  streamingEnabled: boolean;
}

export default registerAs(
  'ai',
  (): AiConfig => ({
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022',
    maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS || '4096', 10),
    temperature: parseFloat(process.env.CLAUDE_TEMPERATURE || '0.7'),
    timeout: parseInt(process.env.CLAUDE_TIMEOUT || '30000', 10),
    retryAttempts: parseInt(process.env.CLAUDE_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.CLAUDE_RETRY_DELAY || '1000', 10),
    streamingEnabled: process.env.CLAUDE_STREAMING_ENABLED === 'true',
  }),
);
