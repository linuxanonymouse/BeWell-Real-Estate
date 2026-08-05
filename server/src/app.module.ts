import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TelegramModule } from './telegram/telegram.module';
import { AiModule } from './ai/ai.module';
import { ProjectsModule } from './projects/projects.module';
import { TeamModule } from './team/team.module';
import { LeadsModule } from './leads/leads.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { SiteContentModule } from './site-content/site-content.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    TelegramModule, 
    AiModule, 
    ProjectsModule, 
    TeamModule, 
    LeadsModule, 
    AuthModule,
    UploadModule,
    SiteContentModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
