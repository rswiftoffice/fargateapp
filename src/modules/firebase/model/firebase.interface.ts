interface MessageData {
  messageID: string
  click_action: string
  content: string
}

interface NotificationData {
  body: string
  title: string
  click_action: string
}

export interface SendMessageToDevices {
  tokens: string[]
  notification?: NotificationData
  message?: MessageData
  data: FirebaseData
}

export interface SendMessageToTopic {
  topic: string
  notification?: NotificationData
  message?: MessageData
  data?: FirebaseData
}

interface FirebaseData {
  addedBy?: string
  tripId?: string
}

export interface SubscribeTokenToTopic {
  tokens: string[]
  topic: string
}

export interface UnsubscribeTokenToTopic {
  tokens: string[]
  topic: string
}
