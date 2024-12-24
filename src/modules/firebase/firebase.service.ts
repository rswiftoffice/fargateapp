import { Injectable } from '@nestjs/common'
import * as admin from 'firebase-admin'
import { FirebaseConstants } from '../../constants/firebase.constants'
import { SendMessageToDevices, SendMessageToTopic, SubscribeTokenToTopic, UnsubscribeTokenToTopic } from './model/firebase.interface'
import * as firebaseConfig from '../../../firebase.config';
@Injectable()
export class FirebaseService {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig),
    })
  }

  // send message to devices by specific tokens
  async sendMessageToDevices({ tokens, notification, message, data }: SendMessageToDevices): Promise<boolean> {
    try {
      if (!notification && !message) {
        throw new Error('Notification or message is missing')
      }

      const payload: any = { }
      if (notification) {
        payload.notification = notification
        payload.data = data || { }
      }

      if (message) {
        payload.data = {
          ...data,
          ...message,
        }
      }

      const options = {
        priority: 'normal',
        timeToLive: FirebaseConstants.timeToLive,
      }

      await admin.messaging().sendToDevice(tokens, payload, options)

      return true
    } catch (error) {
      return Promise.reject(error)
    }
  }

   async sendMessageToTopic({ topic, notification, message, data }: SendMessageToTopic): Promise<boolean> {
    try {
      if (!notification && !message) {
        throw new Error('Notification or message is missing')
      }

      const payload: any = { }
      if (notification) {
        payload.notification = notification
        payload.data = data || { }
      }

      if (message) {
        payload.data = {
          ...data,
          ...message,
        }
      }

      const options = {
        priority: 'normal',
        timeToLive: FirebaseConstants.timeToLive,
      }

      await admin.messaging().sendToTopic(topic, payload, options)

      return true
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async subscribeTokenToTopic({ tokens, topic }: SubscribeTokenToTopic): Promise<boolean> {
    try {
      if (!Array.isArray(tokens) || tokens.length === 0) {
        return
      }

      await admin.messaging().subscribeToTopic(tokens, topic)

      return true
    } catch (error) {
      return Promise.reject(error)
    }
  }

  async unsubscribeTokenFromTopic({ tokens, topic }: UnsubscribeTokenToTopic): Promise<boolean> {
    try {
      if (!Array.isArray(tokens) || tokens.length === 0) {
        return
      }

      await admin.messaging().unsubscribeFromTopic(tokens, topic)

      return true
    } catch (error) {
      return Promise.reject(error)
    }
  }
}
