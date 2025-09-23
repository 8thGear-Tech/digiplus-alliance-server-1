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

export enum ServicesTypes {
  ecosystem_building = 'Ecosystem Building',
  digital_skills_and_training = 'Digital Skills & Training',
  digital_infrastructure_and_tools = 'Digital Infrastructure / Tools',
  business_advisory_and_ecosystem_support = 'Business Advisory & Ecosystem Support',
  research_and_insights = 'Research & Insights',
  innovation_and_co_creation_labs = 'Innovation & Co-creation Labs',
}

export enum Repositories {
  UserRepository = 'UserRepository',
  BusinessOwnerRepository = 'BusinessOwnerRepository',
  AdminRepository = 'AdminRepository',
  // NotificationRepository = 'NotificationRepository',
  RefreshTokenRepository = 'RefreshTokenRepository',
  TokenRepository = 'TokenRepository',
}

export enum NotificationTypes {
  TRAINING_TIMETABLE = 'training_timetable',
}
