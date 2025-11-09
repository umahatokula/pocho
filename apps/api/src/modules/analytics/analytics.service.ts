import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  overview() {
    return { sales: 0, offers: 0 };
  }
}
