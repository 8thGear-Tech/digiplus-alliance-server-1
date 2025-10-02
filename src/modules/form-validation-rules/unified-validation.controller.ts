// ============================================
// UNIFIED VALIDATION CONTROLLER
// ============================================

import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtUserAuthGuard } from 'src/modules/auth/guards/jwt-user-auth.guard';
import { UnifiedValidationService } from './unified-validation.service';
import {
  GetValidationRulesDto,
  ValidateInputDto,
  FormType,
} from './unified-validation.dto';
@ApiTags('Validation')
@ApiBearerAuth()
@UseGuards(JwtUserAuthGuard)
@Controller('validation')
export class UnifiedValidationController {
  constructor(
    private readonly unifiedValidationService: UnifiedValidationService,
  ) {}

  @Get('rules')
  @ApiOperation({
    summary: 'Get validation rules for any form type',
    description:
      'Universal endpoint that works for both application forms and assessments. Returns validation rules based on form type.',
  })
  @ApiResponse({
    status: 200,
    description: 'Validation rules retrieved successfully',
    schema: {
      oneOf: [
        {
          title: 'Application Form Rules',
          example: {
            formId: '507f1f77bcf86cd799439011',
            formType: 'application',
            formTitle: 'Application for DigiPlus Services',
            totalQuestions: 5,
            validationRules: [
              {
                data_key: 'email',
                question: 'What is your email address?',
                type: 'short_text',
                step: 1,
                validation: {
                  required: true,
                  rules: [
                    {
                      type: 'email',
                      message: 'Please enter a valid email address',
                      pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
                    },
                  ],
                },
              },
            ],
          },
        },
        {
          title: 'Assessment Rules',
          example: {
            formId: '68d76eea50c4b6fd7da5fc06',
            formType: 'assessment',
            formTitle: 'Digital Maturity Assessment',
            totalQuestions: 10,
            validationRules: [
              {
                question_id: '68d76eeb50c4b6fd7da5fc14',
                question: 'What is your current digital skill level?',
                type: 'multiple_choice',
                step: 2,
                validation: {
                  required: true,
                  rules: [
                    {
                      type: 'required_selection',
                      message: 'Please select an option',
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  })
  async getValidationRules(@Query() dto: GetValidationRulesDto) {
    return this.unifiedValidationService.getValidationRules(dto);
  }

  @Post('validate')
  @ApiOperation({
    summary: 'Validate a single field for any form type',
    description:
      'Universal validation endpoint that works for both applications and assessments. Covers all validation rules including email, phone, URL, numeric, alphabetic, length, selections, grids, and file uploads.',
  })
  @ApiBody({
    type: ValidateInputDto,
    examples: {
      // ========== EMAIL VALIDATION ==========
      '[App] ✓ Valid email address': {
        summary: 'Valid email address',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'email',
          value: 'john.doe@example.com',
        },
      },
      '[App] ✗ Invalid email format': {
        summary: 'Invalid email format',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'email',
          value: 'not-an-email',
        },
      },
      '[App] ✗ Empty required email field': {
        summary: 'Empty required email field',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'email',
          value: '',
        },
      },

      // ========== PHONE VALIDATION ==========
      '[App] ✓ Valid phone number with country code': {
        summary: 'Valid phone number',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'phone_number',
          value: '+1234567890',
        },
      },
      '[App] ✗ Invalid phone format': {
        summary: 'Invalid phone format',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'phone_number',
          value: 'abc-123-4567',
        },
      },

      // ========== URL VALIDATION ==========
      '[App] ✓ Valid website URL': {
        summary: 'Valid website URL',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'website',
          value: 'https://www.example.com',
        },
      },
      '[App] ✗ Invalid URL format': {
        summary: 'Invalid URL format',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'website',
          value: 'not a valid url',
        },
      },

      // ========== NUMERIC VALIDATION ==========
      '[App] ✓ Valid numeric input': {
        summary: 'Valid numeric input',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'age',
          value: '25',
        },
      },
      '[App] ✗ Non-numeric input': {
        summary: 'Non-numeric input',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'age',
          value: 'twenty-five',
        },
      },

      // ========== ALPHABETIC VALIDATION ==========
      '[App] ✓ Valid alphabetic text': {
        summary: 'Valid alphabetic text',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'first_name',
          value: 'John Doe',
        },
      },
      '[App] ✗ Contains numbers or symbols': {
        summary: 'Contains numbers or symbols',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'first_name',
          value: 'John123!',
        },
      },

      // ========== LENGTH VALIDATION ==========
      '[App] ✗ Text shorter than minimum': {
        summary: 'Text shorter than minimum',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'company_name',
          value: 'AB',
        },
      },
      '[App] ✗ Text longer than maximum': {
        summary: 'Text longer than maximum',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'company_name',
          value: 'A'.repeat(101),
        },
      },
      '[App] ✓ Text within min/max range': {
        summary: 'Text within min/max range',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'company_name',
          value: 'DigiPlus Alliance',
        },
      },

      // ========== MULTIPLE CHOICE ==========
      '[App] ✓ Option selected': {
        summary: 'Option selected',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'degree_program',
          value: 'computer_science',
        },
      },
      '[App] ✗ No option selected (required)': {
        summary: 'No option selected (required)',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'degree_program',
          value: null,
        },
      },

      // ========== CHECKBOX ==========
      '[App] ✓ Multiple options selected': {
        summary: 'Multiple options selected',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'programming_languages',
          value: ['python', 'javascript', 'java'],
        },
      },
      '[App] ✓ Minimum selections met': {
        summary: 'Minimum selections met',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'programming_languages',
          value: ['python', 'javascript'],
        },
      },
      '[App] ✗ Below minimum selections': {
        summary: 'Below minimum selections',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'programming_languages',
          value: ['python'],
        },
      },
      '[App] ✗ Empty checkbox (required)': {
        summary: 'Empty checkbox (required)',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'programming_languages',
          value: [],
        },
      },

      // ========== DROPDOWN ==========
      '[App] ✓ Dropdown option selected': {
        summary: 'Dropdown option selected',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'country',
          value: 'nigeria',
        },
      },
      '[App] ✗ No dropdown selection (required)': {
        summary: 'No dropdown selection (required)',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'country',
          value: null,
        },
      },

      // ========== GRID ==========
      '[App] ✓ All grid rows answered': {
        summary: 'All grid rows answered',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'course_ratings',
          value: {
            'row-1': 'col-3',
            'row-2': 'col-2',
            'row-3': 'col-3',
          },
        },
      },
      '[App] ✗ Missing some grid rows': {
        summary: 'Missing some grid rows',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'course_ratings',
          value: {
            'row-1': 'col-3',
          },
        },
      },
      '[App] ✗ Empty grid (required)': {
        summary: 'Empty grid (required)',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'course_ratings',
          value: {},
        },
      },

      // ========== FILE UPLOAD ==========
      '[App] ✓ Valid PDF file': {
        summary: 'Valid PDF file',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'resume',
          value: 'john_doe_resume.pdf',
        },
      },
      '[App] ✓ Valid DOCX file': {
        summary: 'Valid DOCX file',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'resume',
          value: 'resume.docx',
        },
      },
      '[App] ✗ Invalid file extension': {
        summary: 'Invalid file extension',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'resume',
          value: 'resume.txt',
        },
      },
      '[App] ✗ No file uploaded (required)': {
        summary: 'No file uploaded (required)',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'resume',
          value: null,
        },
      },

      // ========== OPTIONAL FIELDS ==========
      '[App] ✓ Empty optional field (valid)': {
        summary: 'Empty optional field (valid)',
        value: {
          formId: '507f1f77bcf86cd799439011',
          formType: 'application',
          questionIdentifier: 'additional_comments',
          value: '',
        },
      },

      // ========== ASSESSMENT EXAMPLES ==========
      '[Assessment] ✓ Multiple choice selected': {
        summary: '[Assessment] Multiple choice selected',
        value: {
          formId: '68d76eea50c4b6fd7da5fc06',
          formType: 'assessment',
          questionIdentifier: '68d76eeb50c4b6fd7da5fc14',
          value: 'opt-1',
        },
      },
      '[Assessment] ✗ Empty required field': {
        summary: '[Assessment] Empty required field',
        value: {
          formId: '68d76eea50c4b6fd7da5fc06',
          formType: 'assessment',
          questionIdentifier: '68d76eeb50c4b6fd7da5fc14',
          value: null,
        },
      },
      '[Assessment] ✓ Checkbox valid': {
        summary: '[Assessment] Checkbox selections valid',
        value: {
          formId: '68d76eea50c4b6fd7da5fc06',
          formType: 'assessment',
          questionIdentifier: '68d76eeb50c4b6fd7da5fc16',
          value: ['opt-1', 'opt-3', 'opt-5'],
        },
      },
      '[Assessment] ✓ Short text input': {
        summary: '[Assessment] Short text valid',
        value: {
          formId: '68d76eea50c4b6fd7da5fc06',
          formType: 'assessment',
          questionIdentifier: '68d76eeb50c4b6fd7da5fc18',
          value: 'My Business Name',
        },
      },
      '[Assessment] ✓ All grid rows answered': {
        summary: '[Assessment] Grid complete',
        value: {
          formId: '68d76eea50c4b6fd7da5fc06',
          formType: 'assessment',
          questionIdentifier: '68d76eec50c4b6fd7da5fc1e',
          value: {
            'row-1': 'col-2',
            'row-2': 'col-3',
            'row-3': 'col-5',
          },
        },
      },
      '[Assessment] ✗ Missing grid rows': {
        summary: '[Assessment] Grid incomplete',
        value: {
          formId: '68d76eea50c4b6fd7da5fc06',
          formType: 'assessment',
          questionIdentifier: '68d76eec50c4b6fd7da5fc1e',
          value: {
            'row-1': 'col-2',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Validation result',
    schema: {
      oneOf: [
        {
          title: 'Valid Input',
          example: {
            isValid: true,
            field: 'email',
            formType: 'application',
            errors: [],
          },
        },
        {
          title: 'Invalid Input',
          example: {
            isValid: false,
            field: 'email',
            formType: 'application',
            errors: [
              {
                type: 'email',
                message: 'Please enter a valid email address',
                field: 'email',
              },
            ],
          },
        },
        {
          title: 'Assessment Validation Error',
          example: {
            isValid: false,
            field: '68d76eeb50c4b6fd7da5fc14',
            formType: 'assessment',
            errors: [
              {
                type: 'required_selection',
                message: 'Please select an option',
                field: '68d76eeb50c4b6fd7da5fc14',
              },
            ],
          },
        },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Form or question not found',
  })
  async validateInput(@Body() dto: ValidateInputDto) {
    return this.unifiedValidationService.validateInput(dto);
  }
}
