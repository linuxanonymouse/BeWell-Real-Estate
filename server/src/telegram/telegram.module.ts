import { Module, forwardRef } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { ProjectsModule } from '../projects/projects.module';
import { LeadsModule } from '../leads/leads.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TelegramSettings, TelegramSettingsSchema } from './telegram.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TelegramSettings.name, schema: TelegramSettingsSchema }]),
    ProjectsModule, 
    forwardRef(() => LeadsModule)
  ],
  controllers: [TelegramController],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
