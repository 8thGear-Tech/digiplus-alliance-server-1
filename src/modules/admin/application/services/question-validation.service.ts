import { Injectable } from '@nestjs/common';
import { ValidationRule } from 'src/shared/enums';

@Injectable()
export class QuestionValidationService {
  /**
   * Auto-detect validation rules based on question text
   */
  detectValidationRule(questionText: string): ValidationRule {
    const questionLower = questionText.toLowerCase();

    // Email detection patterns
    const emailPatterns = [
      'email',
      'e-mail',
      'email address',
      'electronic mail',
      'mail address',
      'email id',
      'e-mail address',
    ];

    // Phone detection patterns
    const phonePatterns = [
      'phone',
      'telephone',
      'mobile',
      'cell',
      'contact number',
      'phone number',
      'mobile number',
      'telephone number',
      'contact info',
      'whatsapp',
      'call',
    ];

    // URL/Website detection patterns
    const urlPatterns = [
      'website',
      'url',
      'link',
      'portfolio',
      'blog',
      'site',
      'web address',
      'homepage',
      'social media',
      'linkedin',
      'github',
      'twitter',
    ];

    // Number detection patterns
    const numberPatterns = [
      'age',
      'years old',
      'number of',
      'how many',
      'quantity',
      'amount',
      'count',
      'total',
      'score',
      'rating',
    ];

    // Check patterns
    if (emailPatterns.some((pattern) => questionLower.includes(pattern))) {
      return ValidationRule.EMAIL;
    }

    if (phonePatterns.some((pattern) => questionLower.includes(pattern))) {
      return ValidationRule.PHONE;
    }

    if (urlPatterns.some((pattern) => questionLower.includes(pattern))) {
      return ValidationRule.URL;
    }

    if (numberPatterns.some((pattern) => questionLower.includes(pattern))) {
      return ValidationRule.NUMBER_ONLY;
    }

    return ValidationRule.NONE;
  }

  /**
   * Generate frontend validation rules for form submission
   */
  generateFrontendValidation(question: any): any {
    const validationRule =
      question.manual_validation ||
      question.auto_validation ||
      ValidationRule.NONE;
    const params = question.validation_params || {};

    const validation: any = {
      required: question.is_required || false,
      rules: [],
    };

    switch (validationRule) {
      case ValidationRule.EMAIL:
        validation.rules.push({
          type: 'email',
          message: params.error_message || 'Please enter a valid email address',
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        });
        break;

      case ValidationRule.PHONE:
        validation.rules.push({
          type: 'phone',
          message: params.error_message || 'Please enter a valid phone number',
          pattern: /^[\+]?[1-9][\d]{0,15}$/, // International phone format
        });
        break;

      case ValidationRule.URL:
        validation.rules.push({
          type: 'url',
          message: params.error_message || 'Please enter a valid URL',
          pattern:
            /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        });
        break;

      case ValidationRule.NUMBER_ONLY:
        validation.rules.push({
          type: 'number',
          message: params.error_message || 'Please enter numbers only',
          pattern: /^\d+$/,
        });
        break;

      case ValidationRule.ALPHABETS_ONLY:
        validation.rules.push({
          type: 'alphabets',
          message: params.error_message || 'Please enter letters only',
          pattern: /^[a-zA-Z\s]+$/,
        });
        break;
    }

    // Add length validations
    if (params.min_length) {
      validation.rules.push({
        type: 'min_length',
        value: params.min_length,
        message: `Minimum ${params.min_length} characters required`,
      });
    }

    if (params.max_length) {
      validation.rules.push({
        type: 'max_length',
        value: params.max_length,
        message: `Maximum ${params.max_length} characters allowed`,
      });
    }

    return validation;
  }

  /**
   * Get suggested placeholder text based on validation rule
   */
  getSuggestedPlaceholder(validationRule: ValidationRule): string {
    switch (validationRule) {
      case ValidationRule.EMAIL:
        return 'e.g., john@example.com';
      case ValidationRule.PHONE:
        return 'e.g., +1234567890';
      case ValidationRule.URL:
        return 'e.g., https://example.com';
      case ValidationRule.NUMBER_ONLY:
        return 'Enter numbers only';
      case ValidationRule.ALPHABETS_ONLY:
        return 'Enter letters only';
      default:
        return 'Enter your answer here';
    }
  }

  /**
   * Get suggested instruction text based on validation rule
   */
  getSuggestedInstruction(validationRule: ValidationRule): string {
    switch (validationRule) {
      case ValidationRule.EMAIL:
        return 'Please provide a valid email address';
      case ValidationRule.PHONE:
        return 'Include country code';
      case ValidationRule.URL:
        return 'Include http:// or https://';
      case ValidationRule.NUMBER_ONLY:
        return 'Numbers only, no letters or symbols';
      default:
        return '';
    }
  }

  /**
   * Validate user input against question rules
   */
  validateUserInput(
    value: string,
    question: any,
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const validationRule =
      question.manual_validation ||
      question.auto_validation ||
      ValidationRule.NONE;
    const params = question.validation_params || {};

    // Required validation
    if (question.is_required && (!value || value.trim() === '')) {
      errors.push('This field is required');
      return { isValid: false, errors };
    }

    // Skip other validations if field is empty and not required
    if (!value || value.trim() === '') {
      return { isValid: true, errors: [] };
    }

    // Apply specific validation rules
    switch (validationRule) {
      case ValidationRule.EMAIL:
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push(
            params.error_message || 'Please enter a valid email address',
          );
        }
        break;

      case ValidationRule.PHONE:
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/\s|-/g, ''))) {
          errors.push(
            params.error_message || 'Please enter a valid phone number',
          );
        }
        break;

      case ValidationRule.URL:
        const urlRegex =
          /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        if (!urlRegex.test(value)) {
          errors.push(params.error_message || 'Please enter a valid URL');
        }
        break;

      case ValidationRule.NUMBER_ONLY:
        const numberRegex = /^\d+$/;
        if (!numberRegex.test(value)) {
          errors.push(params.error_message || 'Please enter numbers only');
        }
        break;

      case ValidationRule.ALPHABETS_ONLY:
        const alphabetRegex = /^[a-zA-Z\s]+$/;
        if (!alphabetRegex.test(value)) {
          errors.push(params.error_message || 'Please enter letters only');
        }
        break;
    }

    // Length validations
    if (params.min_length && value.length < params.min_length) {
      errors.push(`Minimum ${params.min_length} characters required`);
    }

    if (params.max_length && value.length > params.max_length) {
      errors.push(`Maximum ${params.max_length} characters allowed`);
    }

    return { isValid: errors.length === 0, errors };
  }
}
