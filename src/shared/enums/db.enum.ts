export enum DatabaseCollectionNames {
  USER = 'users',
  TOKEN = 'tokens',
  ADMIN = 'admin',
  BUSINESS_OWNER = 'business_owner',
  ASSESSMENT = 'assessments',
  ASSESSMENT_MODULE = 'assessment_modules',
  QUESTION = 'questions',
  USER_ASSESSMENT = 'user_assessments',
  ServiceRecommendationRepository = 'ServiceRecommendationRepository',
  BLOG = 'blogs',
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
  SERVICE_RECOMMENDATION = 'ServiceRecommendation',
  BLOG = 'Blog',
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
  AssessmentRepository = 'AssessmentRepository',
  AssessmentModuleRepository = 'AssessmentModuleRepository',
  QuestionRepository = 'QuestionRepository',
  UserAssessmentRepository = 'UserAssessmentRepository',
  ServiceRecommendationRepository = 'ServiceRecommendationRepository',
  BlogRepository = 'BlogRepository',
}

export enum NotificationTypes {
  TRAINING_TIMETABLE = 'training_timetable',
}
