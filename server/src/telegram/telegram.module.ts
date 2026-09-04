import { Module, forwardRef } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { ProjectsModule } from '../projects/projects.module';
import { LeadsModule } from '../leads/leads.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TelegramSettings, TelegramSettingsSchema } from './telegram.schema';
import { User, UserSchema } from '../auth/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TelegramSettings.name, schema: TelegramSettingsSchema },
      { name: User.name, schema: UserSchema },
    ]),
    ProjectsModule, 
    forwardRef(() => LeadsModule)
  ],
  controllers: [TelegramController],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
