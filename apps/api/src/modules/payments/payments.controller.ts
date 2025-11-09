import { BadRequestException, Body, Controller, HttpCode, Param, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaymentsService, PaymentProvider } from './payments.service';
import { InitPaymentDto } from './dto/init-payment.dto';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Request } from 'express';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('init')
  @ApiBearerAuth()
  init(@CurrentUser() user: RequestUser, @Body() dto: InitPaymentDto) {
    return this.paymentsService.init(user.sub, dto);
  }

  @Post('webhook/:provider')
  @Public()
  @HttpCode(200)
  webhook(@Param('provider') provider: string, @Req() req: Request, @Body() payload: any) {
    const normalized = provider.toUpperCase();
    if (!Object.values(PaymentProvider).includes(normalized as PaymentProvider)) {
      throw new BadRequestException('Unsupported payment provider');
    }
    return this.paymentsService.processWebhook(
      normalized as PaymentProvider,
      req.headers['x-signature'] as string,
      payload,
    );
  }
}
