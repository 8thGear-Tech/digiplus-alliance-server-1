export enum DatabaseCollectionNames {
  USER = 'users',
  TOKEN = 'tokens',
  ADMIN = 'admin',
  BUSINESS_OWNER = 'business_owner',
  ASSESSMENT = 'assessments',
  ASSESSMENT_MODULE = 'assessment_modules',
  QUESTION = 'questions',
  USER_ASSESSMENT = 'user_assessments',
}

export enum DatabaseModelNames {
  USER = 'User',
  ADMIN = 'Admin',
  BUSINESS_OWNER = 'BusinessOwner',
  NOTIFICATION = 'Notification',
  REFRESH_TOKEN = 'RefreshToken',
  TOKEN = 'Token',
  ASSESSMENT = 'Assessment',
  ASSESSMENT_MODULE = 'AssessmentModule',
  QUESTION = 'Question',
  USER_ASSESSMENT = 'UserAssessment',
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
  AdminRepository = 'AdminRepository',
  // NotificationRepository = 'NotificationRepository',
  RefreshTokenRepository = 'RefreshTokenRepository',
  TokenRepository = 'TokenRepository',
  AssessmentRepository = 'AssessmentRepository',
  AssessmentModuleRepository = 'AssessmentModuleRepository',
  QuestionRepository = 'QuestionRepository',
  UserAssessmentRepository = 'UserAssessmentRepository',
}

export enum NotificationTypes {
  TRAINING_TIMETABLE = 'training_timetable',
}
