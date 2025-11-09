import { Injectable } from '@nestjs/common';
import { Channel } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SendPushDto } from './dto/send-push.dto';
import { SendSmsDto } from './dto/send-sms.dto';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async recordNotification(
    dto: SendPushDto | SendSmsDto,
    channel: Channel,
  ) {
    return this.prisma.notification.create({
      data: {
        userId: dto.userId,
        channel,
        title: 'title' in dto ? dto.title : 'SMS Notification',
        body: dto.body,
        meta: 'meta' in dto ? dto.meta : undefined,
        sentAt: new Date(),
      },
    });
  }

  sendPush(dto: SendPushDto) {
    return this.recordNotification(dto, Channel.PUSH);
  }

  sendSms(dto: SendSmsDto) {
    return this.recordNotification(dto, Channel.SMS);
  }
}
