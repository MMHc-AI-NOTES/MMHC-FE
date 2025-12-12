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
export type UserRole = 'Super Admin' | 'Practitioner' | 'Manager';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
}

export interface UpdateUserRequest extends CreateUserRequest {
  id: string;
}

// Notification Settings
export interface NotificationSettings {
  notificationTypes: NotificationType[];
  deliveryChannels: DeliveryChannel[];
  emailTemplates: EmailTemplate[];
}
