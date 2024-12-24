import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FirebaseService } from './firebase.service';
import { TestFCMDto } from './model/firebase.dto';

@Controller('firebase')
@ApiTags('Firebase')
export class FirebaseController {
  constructor(private firebaseService: FirebaseService) {}

  @Post('test')
  async testFCM(
    @Body() notificationData: TestFCMDto,
  ) {
    try {
      const { deviceToken } = notificationData;

      await this.firebaseService.sendMessageToDevices({
        tokens: [deviceToken],
        notification: {
          body: notificationData.message,
          title: notificationData.title || 'Test FCM',
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        data: {
          addedBy: 'exampleId',
        }
      });

      return true;
    } catch (error) {
      throw error;
    }
  }
}
