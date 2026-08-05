import { Module, forwardRef } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { ProjectsModule } from '../projects/projects.module';
import { LeadsModule } from '../leads/leads.module';

@Module({
  imports: [ProjectsModule, forwardRef(() => LeadsModule)],
  controllers: [TelegramController],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
