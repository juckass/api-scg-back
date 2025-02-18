import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { LoggerService } from '../global/services/logger.service';

@Injectable()
export class PrismaService  extends  PrismaClient implements OnModuleInit{

    constructor(private readonly logger: LoggerService) {
        super();
    }

    async onModuleInit() {
        try {
            await this.$connect();
        } catch (error) {         
            this.logger.error('Error initializing Prisma client', error);
            
        }
       
    }
    
    async onModuleDestroy() {
        try {
            await this.$disconnect();    
        } catch (error) {
            this.logger.error('Error disconnecting Prisma client', error);
            
        }
    }
}