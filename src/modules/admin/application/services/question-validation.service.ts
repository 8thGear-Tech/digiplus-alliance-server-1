import { Injectable } from '@nestjs/common';
import { ValidationRule } from 'src/shared/enums';
import { QuestionType } from 'src/modules/assessment/enums/question-type.enum';

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

    // Type-specific validations
    switch (question.type) {
      case QuestionType.MODULE_TITLE:
        if (question.is_required) {
          validation.rules.push({
            type: 'required_selection',
            message: 'Please select an option',
          });
        }
        break;

      case QuestionType.CHECKBOX:
        if (question.is_required) {
          validation.rules.push({
            type: 'required_selection',
            message: 'Please select at least one option',
          });
        }
        if (question.min_selections && question.min_selections > 0) {
          validation.rules.push({
            type: 'min_selections',
            value: question.min_selections,
            message: `Please select at least ${question.min_selections} option(s)`,
          });
        }
        break;

      case QuestionType.DROPDOWN:
        if (question.is_required) {
          validation.rules.push({
            type: 'required_selection',
            message: 'Please select an option from the dropdown',
          });
        }
        break;

      case QuestionType.MULTIPLE_CHOICE_GRID:
        if (question.is_required) {
          validation.rules.push({
            type: 'required_grid',
            message: 'Please answer all rows in the grid',
            gridRows: question.grid_rows?.map((row) => row.id) || [],
          });
        }
        break;

      case QuestionType.FILE_UPLOAD:
        if (question.is_required) {
          validation.rules.push({
            type: 'required_file',
            message: 'Please upload a file',
          });
        }
        if (question.accepted_file_types?.length > 0) {
          validation.rules.push({
            type: 'file_type',
            value: question.accepted_file_types,
            message: `Only ${question.accepted_file_types.join(', ')} files are allowed`,
          });
        }
        break;
    }

    // Text-based validation rules (only for short_text and long_text)
    if (
      question.type === QuestionType.SHORT_TEXT ||
      question.type === QuestionType.LONG_TEXT
    ) {
      switch (validationRule) {
        case ValidationRule.EMAIL:
          validation.rules.push({
            type: 'email',
            message:
              params.error_message || 'Please enter a valid email address',
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          });
          break;

        case ValidationRule.PHONE:
          validation.rules.push({
            type: 'phone',
            message:
              params.error_message || 'Please enter a valid phone number',
            pattern: /^[\+]?[1-9][\d]{0,15}$/,
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

      // Add length validations for text fields
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

  validateUserInput(
    value: any,
    question: any,
  ): {
    isValid: boolean;
    errors: Array<{ type: string; message: string; field: string }>;
  } {
    const errors: Array<{ type: string; message: string; field: string }> = [];
    const field = question.data_key || question.question;

    // Required field validation based on question type
    if (question.is_required) {
      switch (question.type) {
        case QuestionType.SHORT_TEXT:
        case QuestionType.LONG_TEXT:
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            errors.push({
              type: 'required',
              message: 'This field is required',
              field,
            });
            return { isValid: false, errors };
          }
          break;

        case QuestionType.MULTIPLE_CHOICE:
        case QuestionType.DROPDOWN:
          if (!value) {
            errors.push({
              type: 'required_selection',
              message: 'Please select an option',
              field,
            });
            return { isValid: false, errors };
          }
          break;

        case QuestionType.CHECKBOX:
          if (!Array.isArray(value) || value.length === 0) {
            errors.push({
              type: 'required_selection',
              message: 'Please select at least one option',
              field,
            });
            return { isValid: false, errors };
          }
          break;

        case QuestionType.MULTIPLE_CHOICE_GRID:
          if (!value || typeof value !== 'object') {
            errors.push({
              type: 'required_grid',
              message: 'Please answer all rows in the grid',
              field,
            });
            return { isValid: false, errors };
          }
          // Check all rows are answered
          const requiredRows = question.grid_rows?.map((row) => row.id) || [];
          const answeredRows = Object.keys(value);
          const missingRows = requiredRows.filter(
            (rowId) => !answeredRows.includes(rowId),
          );
          if (missingRows.length > 0) {
            errors.push({
              type: 'required_grid',
              message: `Please answer all rows in the grid (${missingRows.length} row(s) remaining)`,
              field,
            });
            return { isValid: false, errors };
          }
          break;
        case QuestionType.FILE_UPLOAD:
          if (!value) {
            errors.push({
              type: 'required_file',
              message: 'Please upload a file',
              field,
            });
            return { isValid: false, errors };
          }
          break;
      }
    }

    // Skip further validation if empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return { isValid: true, errors: [] };
    }

    // Checkbox minimum selections
    if (question.type === QuestionType.CHECKBOX && question.min_selections) {
      if (!Array.isArray(value) || value.length < question.min_selections) {
        errors.push({
          type: 'min_selections',
          message: `Please select at least ${question.min_selections} option(s)`,
          field,
        });
      }
    }

    // File type validation
    if (
      question.type === QuestionType.FILE_UPLOAD &&
      question.accepted_file_types
    ) {
      const fileName = typeof value === 'string' ? value : value?.name || '';
      const fileExt = fileName
        .substring(fileName.lastIndexOf('.'))
        .toLowerCase();
      if (!question.accepted_file_types.includes(fileExt)) {
        errors.push({
          type: 'file_type',
          message: `Only ${question.accepted_file_types.join(', ')} files are allowed`,
          field,
        });
      }
    }

    // Text-based validations (only for short_text and long_text)
    if (
      (question.type === QuestionType.SHORT_TEXT ||
        question.type === QuestionType.LONG_TEXT) &&
      typeof value === 'string'
    ) {
      const validationRule =
        question.manual_validation ||
        question.auto_validation ||
        ValidationRule.NONE;
      const params = question.validation_params || {};

      // Apply specific validation rules
      switch (validationRule) {
        case ValidationRule.EMAIL:
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push({
              type: 'email',
              message:
                params.error_message || 'Please enter a valid email address',
              field,
            });
          }
          break;

        case ValidationRule.PHONE:
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          if (!phoneRegex.test(value.replace(/\s|-/g, ''))) {
            errors.push({
              type: 'phone',
              message:
                params.error_message || 'Please enter a valid phone number',
              field,
            });
          }
          break;

        case ValidationRule.URL:
          const urlRegex =
            /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
          if (!urlRegex.test(value)) {
            errors.push({
              type: 'url',
              message: params.error_message || 'Please enter a valid URL',
              field,
            });
          }
          break;

        case ValidationRule.NUMBER_ONLY:
          const numberRegex = /^\d+$/;
          if (!numberRegex.test(value)) {
            errors.push({
              type: 'number',
              message: params.error_message || 'Please enter numbers only',
              field,
            });
          }
          break;

        case ValidationRule.ALPHABETS_ONLY:
          const alphabetRegex = /^[a-zA-Z\s]+$/;
          if (!alphabetRegex.test(value)) {
            errors.push({
              type: 'alphabets',
              message: params.error_message || 'Please enter letters only',
              field,
            });
          }
          break;
      }

      // Length validations
      if (params.min_length && value.length < params.min_length) {
        errors.push({
          type: 'min_length',
          message: `Minimum ${params.min_length} characters required`,
          field,
        });
      }

      if (params.max_length && value.length > params.max_length) {
        errors.push({
          type: 'max_length',
          message: `Maximum ${params.max_length} characters allowed`,
          field,
        });
      }
    }

    return { isValid: errors.length === 0, errors };
  }
}
