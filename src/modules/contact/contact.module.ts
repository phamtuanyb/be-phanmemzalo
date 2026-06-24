import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactController } from './contact.controller';
import { AdminContactsController } from './admin-contacts.controller';
import { ContactService } from './contact.service';
import { ContactSubmission } from '../../entities/contact-submission.entity';
import { SiteSettingsModule } from '../site-settings/site-settings.module';

@Module({
  imports: [TypeOrmModule.forFeature([ContactSubmission]), SiteSettingsModule],
  controllers: [ContactController, AdminContactsController],
  providers: [ContactService],
})
export class ContactModule {}
