import { Module } from '@nestjs/common';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamMember, TeamMemberSchema } from './team.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TeamMember.name, schema: TeamMemberSchema }]),
  ],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
