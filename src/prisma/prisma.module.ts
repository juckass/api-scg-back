import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { GlobalModule } from '../global/global.module';

@Module({
  imports: [GlobalModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
