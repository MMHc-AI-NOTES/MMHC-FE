// Notification Types
export interface NotificationType {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

// Delivery Channels
export interface DeliveryChannel {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
}

// Email Templates
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  lastModified: string;
  isActive: boolean;
}

// Available Variables
export interface AvailableVariable {
  id: string;
  name: string;
  displayName: string;
}

// User Management
export type UserRole = 1 | 2 | 3 | 4;

export interface User {
  id: number;
  fullName: string;
  email: string;
  type: UserRole;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  hasCompletedOnboarding?: boolean;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  type: UserRole;
  isActive: boolean;
}

export interface UpdateUserRequest extends CreateUserRequest {
  id: number;
}

// Notification Settings
export interface NotificationSettings {
  notificationTypes: NotificationType[];
  deliveryChannels: DeliveryChannel[];
  emailTemplates: EmailTemplate[];
}
