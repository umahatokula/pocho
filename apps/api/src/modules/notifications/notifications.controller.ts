import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { SendPushDto } from './dto/send-push.dto';
import { SendSmsDto } from './dto/send-sms.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('push')
  @Roles(UserRole.ADMIN)
  push(@Body() dto: SendPushDto) {
    return this.notificationsService.sendPush(dto);
  }

  @Post('sms')
  @Roles(UserRole.ADMIN)
  sms(@Body() dto: SendSmsDto) {
    return this.notificationsService.sendSms(dto);
  }
}
