import { Test, TestingModule } from '@nestjs/testing';
import { TokenBlacklistService } from '../token-blacklist.service';

describe('TokenBlacklistService', () => {
    let service: TokenBlacklistService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TokenBlacklistService],
        }).compile();

        service = module.get<TokenBlacklistService>(TokenBlacklistService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('add', () => {
        it('should add a token to the blacklist', () => {
            const token = 'test-token';
            service.add(token);
            expect(service.has(token)).toBe(true);
        });
    });

    describe('has', () => {
        it('should return true if token is in the blacklist', () => {
            const token = 'test-token';
            service.add(token);
            expect(service.has(token)).toBe(true);
        });

        it('should return false if token is not in the blacklist', () => {
            const token = 'test-token';
            expect(service.has(token)).toBe(false);
        });
    });
});