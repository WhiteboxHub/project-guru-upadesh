import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: any) => {
      const config: Record<string, any> = {
        'cache.enabled': true,
        'cache.host': 'localhost',
        'cache.port': 6379,
        'cache.db': 0,
        'cache.ttl': 3600,
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initialization', () => {
    it('should initialize with configuration', () => {
      service.onModuleInit();

      expect(mockConfigService.get).toHaveBeenCalledWith('cache.enabled', true);
      expect(mockConfigService.get).toHaveBeenCalledWith('cache.host', 'localhost');
    });

    it('should handle disabled cache', () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'cache.enabled') return false;
        return undefined;
      });

      service.onModuleInit();

      // Service should initialize without Redis when disabled
      expect(service).toBeDefined();
    });
  });

  describe('cache operations', () => {
    beforeEach(() => {
      service.onModuleInit();
    });

    it('should handle get when cache is disabled', async () => {
      const disabledService = new CacheService({
        get: jest.fn().mockReturnValue(false),
      } as any);

      const result = await disabledService.get('test-key');

      expect(result).toBeNull();
    });

    it('should handle set when cache is disabled', async () => {
      const disabledService = new CacheService({
        get: jest.fn().mockReturnValue(false),
      } as any);

      await expect(disabledService.set('key', 'value')).resolves.not.toThrow();
    });

    it('should handle delete when cache is disabled', async () => {
      const disabledService = new CacheService({
        get: jest.fn().mockReturnValue(false),
      } as any);

      await expect(disabledService.delete('key')).resolves.not.toThrow();
    });

    it('should handle exists check when cache is disabled', async () => {
      const disabledService = new CacheService({
        get: jest.fn().mockReturnValue(false),
      } as any);

      const result = await disabledService.exists('key');

      expect(result).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return disabled stats when cache is disabled', async () => {
      const disabledService = new CacheService({
        get: jest.fn().mockReturnValue(false),
      } as any);

      const stats = await disabledService.getStats();

      expect(stats.enabled).toBe(false);
      expect(stats.connected).toBe(false);
      expect(stats.keyCount).toBe(0);
    });
  });

  describe('increment', () => {
    it('should return 0 when cache is disabled', async () => {
      const disabledService = new CacheService({
        get: jest.fn().mockReturnValue(false),
      } as any);

      const result = await disabledService.increment('counter', 5);

      expect(result).toBe(0);
    });
  });
});
