export enum DatabaseCollectionNames {
  USER = 'users',
  TOKEN = 'tokens',
  ADMIN = 'admin',
  BUSINESS_OWNER = 'business_owner',
}

export enum DatabaseModelNames {
  USER = 'User',
  ADMIN = 'Admin',
  BUSINESS_OWNER = 'BusinessOwner',
  NOTIFICATION = 'Notification',
  REFRESH_TOKEN = 'RefreshToken',
  TOKEN = 'Token',
}

export enum TokenTypes {
  registration = 'registration',
  forgotPassword = 'password-reset',
}

export enum UserTypes {
  admin = 'admin',
  business_owner = 'business_owner',
}

export enum Repositories {
  UserRepository = 'UserRepository',
  BusinessOwnerRepository = 'BusinessOwnerRepository',
  // AdminRepository = 'AdminRepository',
  // NotificationRepository = 'NotificationRepository',
  RefreshTokenRepository = 'RefreshTokenRepository',
  TokenRepository = 'TokenRepository',
}

export enum NotificationTypes {
  TRAINING_TIMETABLE = 'training_timetable',
}
