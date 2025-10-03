import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { SubscriptionRepository } from './subscription.repository';
import { UserModule } from 'src/user/user.module';
import { SubscriptionController } from './subscription.controller';

@Module({
  imports: [UserModule],
  providers: [SubscriptionService, SubscriptionRepository],
  exports: [SubscriptionService],
  controllers: [SubscriptionController],
})
export class SubscriptionModule {}
