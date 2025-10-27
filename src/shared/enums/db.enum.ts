// export enum DatabaseCollectionNames {
//   USER = 'users',
//   TOKEN = 'tokens',
//   ADMIN = 'admin',
//   BUSINESS_OWNER = 'business_owner',
//   ASSESSMENT = 'assessments',
//   ASSESSMENT_MODULE = 'assessment_modules',
//   QUESTION = 'questions',
//   USER_ASSESSMENT = 'user_assessments',
//   ServiceRecommendationRepository = 'ServiceRecommendationRepository',
//   BLOG = 'blogs',
// }

// export enum DatabaseModelNames {
//   USER = 'User',
//   ADMIN = 'Admin',
//   BUSINESS_OWNER = 'BusinessOwner',
//   NOTIFICATION = 'Notification',
//   REFRESH_TOKEN = 'RefreshToken',
//   TOKEN = 'Token',
//   ASSESSMENT = 'Assessment',
//   ASSESSMENT_MODULE = 'AssessmentModule',
//   QUESTION = 'Question',
//   USER_ASSESSMENT = 'UserAssessment',
//   SERVICE = 'Service',
//   SERVICE_RECOMMENDATION = 'ServiceRecommendation',
//   BLOG = 'Blog',
//   APPLICATION_FORM = 'ApplicationForm',
//   USER_SUBMISSION = 'UserSubmission',
// }

// export enum TokenTypes {
//   registration = 'registration',
//   forgotPassword = 'password-reset',
// }

// export enum UserTypes {
//   admin = 'admin',
//   business_owner = 'business_owner',
// }

// export enum ServicesTypes {
//   ecosystem_building = 'Ecosystem Building',
//   digital_skills_and_training = 'Digital Skills & Training',
//   digital_infrastructure_and_tools = 'Digital Infrastructure / Tools',
//   business_advisory_and_ecosystem_support = 'Business Advisory & Ecosystem Support',
//   research_and_insights = 'Research & Insights',
//   innovation_and_co_creation_labs = 'Innovation & Co-creation Labs',
// }

// export enum QuestionType {
//   welcome_screen = 'welcome_screen',
//   multiple_choice = 'multiple_choice',
//   checkbox = 'checkbox',
//   short_text = 'short_text',
//   long_text = 'long_text',
//   dropdown = 'dropdown',
//   multiple_choice_grid = 'multiple_choice_grid',
//   file_upload = 'file_upload',
// }

// // src/shared/enums.ts

// export enum ApplicationStatus {
//   Submitted = 'Submitted',
//   BeingProcessed = 'Being Processed',
//   Approved = 'Approved',
//   Rejected = 'Rejected',
//   Completed = 'Completed',
// }

// export enum PaymentStatus {
//   Paid = 'Paid',
//   NotPaid = 'Not Paid',
// }

// export enum ValidationRule {
//   NONE = 'none',
//   EMAIL = 'email',
//   PHONE = 'phone',
//   URL = 'url',
//   NUMBER_ONLY = 'number_only',
//   ALPHABETS_ONLY = 'alphabets_only',
//   MIN_LENGTH = 'min_length',
//   MAX_LENGTH = 'max_length',
// }

// export enum Repositories {
//   UserRepository = 'UserRepository',
//   BusinessOwnerRepository = 'BusinessOwnerRepository',
//   AdminRepository = 'AdminRepository',
//   // NotificationRepository = 'NotificationRepository',
//   RefreshTokenRepository = 'RefreshTokenRepository',
//   TokenRepository = 'TokenRepository',
//   AssessmentRepository = 'AssessmentRepository',
//   AssessmentModuleRepository = 'AssessmentModuleRepository',
//   QuestionRepository = 'QuestionRepository',
//   UserAssessmentRepository = 'UserAssessmentRepository',
//   ServiceRepository = 'ServiceRepository',
//   ServiceRecommendationRepository = 'ServiceRecommendationRepository',
//   BlogRepository = 'BlogRepository',
//   ApplicationFormRepository = 'ApplicationFormRepository',
//   UserSubmissionRepository = 'UserSubmissionRepository',
// }

// export enum NotificationTypes {
//   TRAINING_TIMETABLE = 'training_timetable',
// }

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
  APPLICATION_FORM = 'ApplicationForm',
  USER_SUBMISSION = 'UserSubmission',
  SERVICE = 'Service',
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

// export enum QuestionType {
//   welcome_screen = 'welcome_screen',
//   multiple_choice = 'multiple_choice',
//   checkbox = 'checkbox',
//   short_text = 'short_text',
//   long_text = 'long_text',
//   dropdown = 'dropdown',
//   multiple_choice_grid = 'multiple_choice_grid',
//   file_upload = 'file_upload',
// }

// src/shared/enums.ts

export enum ApplicationStatus {
  Submitted = 'Submitted',
  BeingProcessed = 'Being Processed',
  Approved = 'Approved',
  Rejected = 'Rejected',
  Completed = 'Completed',
}

export enum PaymentStatus {
  Paid = 'Paid',
  NotPaid = 'Not Paid',
}

export enum ValidationRule {
  NONE = 'none',
  EMAIL = 'email',
  PHONE = 'phone',
  URL = 'url',
  NUMBER_ONLY = 'number_only',
  ALPHABETS_ONLY = 'alphabets_only',
  MIN_LENGTH = 'min_length',
  MAX_LENGTH = 'max_length',
}

export enum Repositories {
  UserRepository = 'UserRepository',
  BusinessOwnerRepository = 'BusinessOwnerRepository',
  AdminRepository = 'AdminRepository',
  RefreshTokenRepository = 'RefreshTokenRepository',
  TokenRepository = 'TokenRepository',
  AssessmentRepository = 'AssessmentRepository',
  AssessmentModuleRepository = 'AssessmentModuleRepository',
  QuestionRepository = 'QuestionRepository',
  UserAssessmentRepository = 'UserAssessmentRepository',
  ServiceRecommendationRepository = 'ServiceRecommendationRepository',
  BlogRepository = 'BlogRepository',
  ApplicationFormRepository = 'ApplicationFormRepository',
  UserSubmissionRepository = 'UserSubmissionRepository',
  ServiceRepository = 'ServiceRepository',
  NotificationRepository = 'NotificationRepository',
}

export enum NotificationTypes {
  TRAINING_TIMETABLE = 'training_timetable',
}

// src/shared/utils/currency.util.ts
export enum PricingUnit {
  PER_HOUR = 'per_hour',
  PER_PROJECT = 'per_project',
  ONE_TIME = 'one_time',
  PER_DAY = 'per_day',
  PER_MONTH = 'per_month',
}

export class CurrencyUtil {
  private static unitDisplayMap = {
    [PricingUnit.PER_HOUR]: 'per hour',
    [PricingUnit.PER_PROJECT]: 'per project',
    [PricingUnit.ONE_TIME]: '', // No unit for one-time payments
    [PricingUnit.PER_DAY]: 'per day',
    [PricingUnit.PER_MONTH]: 'per month',
  };

  static formatNaira(amount: number): string {
    return `₦${amount.toLocaleString('en-NG')}`;
  }

  static formatNairaWithUnit(
    amount: number,
    unit: PricingUnit = PricingUnit.ONE_TIME,
  ): string {
    const formattedAmount = this.formatNaira(amount);
    const unitText = this.unitDisplayMap[unit];

    return unitText ? `${formattedAmount} ${unitText}` : formattedAmount;
  }

  static parseNairaString(value: string): number {
    if (typeof value !== 'string') return Number(value);
    // Remove ₦ symbol, commas, and any spaces
    return Number(value.replace(/₦|,|\s/g, ''));
  }
}
