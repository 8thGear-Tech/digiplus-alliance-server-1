// ===== Contact Controller with Admin Guards (contact.controller.ts) =====
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Patch,
  Param,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { ContactDto, ContactResponseDto } from './contact.dto';
import { JwtUserAuthGuard } from 'src/modules/auth/guards/jwt-user-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserTypes } from 'src/shared/enums';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  // PUBLIC ENDPOINT - No authentication required
  @Post()
  @ApiOperation({
    summary: 'Submit contact form',
    description:
      'Submit a contact form. Sends confirmation email to user and notification to admin.',
  })
  @ApiResponse({
    status: 201,
    description: 'Contact form submitted successfully',
    type: ContactResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation errors',
  })
  async submitContact(
    @Body(ValidationPipe) contactDto: ContactDto,
  ): Promise<ContactResponseDto> {
    return this.contactService.submitContact(contactDto);
  }

  // ADMIN ENDPOINTS - Properly guarded like your AdminApplicationController
  @Get('admin/all')
  @ApiBearerAuth()
  @UseGuards(JwtUserAuthGuard, RolesGuard)
  @Roles(UserTypes.admin)
  @ApiOperation({
    summary: 'Get all contacts (Admin only)',
    description: 'Retrieve a paginated list of all contact form submissions',
  })
  @ApiResponse({
    status: 200,
    description: 'Contacts retrieved successfully',
    schema: {
      example: {
        contacts: [
          {
            _id: '507f1f77bcf86cd799439011',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            message: 'I would like to know more about your services.',
            // is_read: false,
            // is_replied: false,
            createdAt: '2025-01-15T10:30:00.000Z',
            updatedAt: '2025-01-15T10:30:00.000Z',
          },
        ],
        total: 50,
        page: 1,
        totalPages: 3,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async getAllContacts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.contactService.getAllContacts(page, limit);
  }

  //   @Patch('admin/:id/read')
  //   @ApiBearerAuth()
  //   @UseGuards(JwtUserAuthGuard, RolesGuard)
  //   @Roles(UserTypes.admin)
  //   @ApiOperation({
  //     summary: 'Mark contact as read (Admin only)',
  //     description: 'Mark a specific contact form submission as read'
  //   })
  //   @ApiResponse({
  //     status: 200,
  //     description: 'Contact marked as read successfully',
  //     schema: {
  //       example: {
  //         _id: '507f1f77bcf86cd799439011',
  //         first_name: 'John',
  //         last_name: 'Doe',
  //         email: 'john.doe@example.com',
  //         message: 'I would like to know more about your services.',
  //         is_read: true,
  //         is_replied: false,
  //         createdAt: '2025-01-15T10:30:00.000Z',
  //         updatedAt: '2025-01-15T12:45:00.000Z'
  //       }
  //     }
  //   })
  //   @ApiResponse({
  //     status: 404,
  //     description: 'Contact not found'
  //   })
  //   @ApiResponse({
  //     status: 401,
  //     description: 'Unauthorized - Invalid or missing token'
  //   })
  //   @ApiResponse({
  //     status: 403,
  //     description: 'Forbidden - Admin role required'
  //   })
  //   async markAsRead(@Param('id') id: string) {
  //     return this.contactService.markAsRead(id);
  //   }

  //   @Patch('admin/:id/replied')
  //   @ApiBearerAuth()
  //   @UseGuards(JwtUserAuthGuard, RolesGuard)
  //   @Roles(UserTypes.admin)
  //   @ApiOperation({
  //     summary: 'Mark contact as replied (Admin only)',
  //     description: 'Mark a specific contact form submission as replied'
  //   })
  //   @ApiResponse({
  //     status: 200,
  //     description: 'Contact marked as replied successfully',
  //     schema: {
  //       example: {
  //         _id: '507f1f77bcf86cd799439011',
  //         first_name: 'John',
  //         last_name: 'Doe',
  //         email: 'john.doe@example.com',
  //         message: 'I would like to know more about your services.',
  //         is_read: true,
  //         is_replied: true,
  //         createdAt: '2025-01-15T10:30:00.000Z',
  //         updatedAt: '2025-01-15T14:20:00.000Z'
  //       }
  //     }
  //   })
  //   @ApiResponse({
  //     status: 404,
  //     description: 'Contact not found'
  //   })
  //   @ApiResponse({
  //     status: 401,
  //     description: 'Unauthorized - Invalid or missing token'
  //   })
  //   @ApiResponse({
  //     status: 403,
  //     description: 'Forbidden - Admin role required'
  //   })
  //   async markAsReplied(@Param('id') id: string) {
  //     return this.contactService.markAsReplied(id);
  //   }

  //   // Additional admin endpoints you might want to add
  //   @Get('admin/stats')
  //   @ApiBearerAuth()
  //   @UseGuards(JwtUserAuthGuard, RolesGuard)
  //   @Roles(UserTypes.admin)
  //   @ApiOperation({
  //     summary: 'Get contact statistics (Admin only)',
  //     description: 'Get summary statistics for contact form submissions'
  //   })
  //   @ApiResponse({
  //     status: 200,
  //     description: 'Contact statistics retrieved successfully',
  //     schema: {
  //       example: {
  //         total: 150,
  //         unread: 23,
  //         read: 127,
  //         replied: 95,
  //         unreplied: 55,
  //         thisMonth: 32,
  //         thisWeek: 8
  //       }
  //     }
  //   })
  //   async getContactStats() {
  //     return this.contactService.getContactStats();
  //   }

  //   @Get('admin/unread')
  //   @ApiBearerAuth()
  //   @UseGuards(JwtUserAuthGuard, RolesGuard)
  //   @Roles(UserTypes.admin)
  //   @ApiOperation({
  //     summary: 'Get unread contacts (Admin only)',
  //     description: 'Get all unread contact form submissions'
  //   })
  //   @ApiResponse({
  //     status: 200,
  //     description: 'Unread contacts retrieved successfully'
  //   })
  //   async getUnreadContacts(
  //     @Query('page') page: number = 1,
  //     @Query('limit') limit: number = 20,
  //   ) {
  //     return this.contactService.getUnreadContacts(page, limit);
  //   }
  // }

  // // ===== Enhanced Contact Service with Additional Methods =====
  // import { Injectable, Logger, NotFoundException } from '@nestjs/common';
  // import { InjectModel } from '@nestjs/mongoose';
  // import { Model } from 'mongoose';
  // import { Contact, ContactDocument } from './contact.schema';
  // import { ContactDto, ContactResponseDto } from './contact.dto';
  // import { MailerService } from 'src/modules/mailer/mailer.service';
  // import {
  //   contactFormUserEmail,
  //   contactFormAdminEmail,
  //   ADMIN_EMAIL,
  // } from 'src/modules/mailer/mailer.constants';

  // @Injectable()
  // export class ContactService {
  //   private readonly logger = new Logger(ContactService.name);

  //   constructor(
  //     @InjectModel(Contact.name)
  //     private contactModel: Model<ContactDocument>,
  //     private mailerService: MailerService,
  //   ) {}

  //   async submitContact(contactDto: ContactDto): Promise<ContactResponseDto> {
  //     try {
  //       // Save contact to database
  //       const contact = new this.contactModel(contactDto);
  //       const savedContact = await contact.save();

  //       // Send confirmation email to user
  //       try {
  //         await this.mailerService.sendMail({
  //           to: contactDto.email,
  //           subject: 'Thank you for contacting DigiPlus Alliance',
  //           html: contactFormUserEmail(savedContact),
  //           text: `Hello ${contactDto.first_name}, thank you for contacting us. We will get back to you soon.`,
  //         });
  //       } catch (emailError) {
  //         this.logger.warn(
  //           `Failed to send confirmation email to ${contactDto.email}`,
  //           emailError,
  //         );
  //       }

  //       // Send notification email to admin
  //       try {
  //         await this.mailerService.sendMail({
  //           to: ADMIN_EMAIL,
  //           subject: 'New Contact Form Submission - DigiPlus Alliance',
  //           html: contactFormAdminEmail(savedContact),
  //           text: `New contact from ${contactDto.first_name} ${contactDto.last_name} (${contactDto.email}): ${contactDto.message}`,
  //         });
  //       } catch (emailError) {
  //         this.logger.warn(`Failed to send admin notification email`, emailError);
  //       }

  //       return {
  //         success: true,
  //         message: 'Thank you for contacting us. We will get back to you soon.',
  //       };
  //     } catch (error) {
  //       this.logger.error('Failed to process contact form submission', error);
  //       throw new Error('Failed to submit contact form. Please try again later.');
  //     }
  //   }

  //   // Admin methods
  //   async getAllContacts(page: number = 1, limit: number = 20) {
  //     const skip = (page - 1) * limit;

  //     const contacts = await this.contactModel
  //       .find()
  //       .sort({ createdAt: -1 })
  //       .skip(skip)
  //       .limit(limit)
  //       .exec();

  //     const total = await this.contactModel.countDocuments();

  //     return {
  //       contacts,
  //       total,
  //       page,
  //       totalPages: Math.ceil(total / limit),
  //     };
  //   }

  //   async markAsRead(contactId: string): Promise<ContactDocument | null> {
  //     const contact = await this.contactModel.findByIdAndUpdate(
  //       contactId,
  //       { is_read: true },
  //       { new: true },
  //     );

  //     if (!contact) {
  //       throw new NotFoundException('Contact not found');
  //     }

  //     return contact;
  //   }

  //   async markAsReplied(contactId: string): Promise<ContactDocument | null> {
  //     const contact = await this.contactModel.findByIdAndUpdate(
  //       contactId,
  //       { is_replied: true },
  //       { new: true },
  //     );

  //     if (!contact) {
  //       throw new NotFoundException('Contact not found');
  //     }

  //     return contact;
  //   }

  //   // Additional admin methods
  //   async getContactStats() {
  //     const now = new Date();
  //     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  //     const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

  //     const [
  //       total,
  //       unread,
  //       unreplied,
  //       thisMonth,
  //       thisWeek
  //     ] = await Promise.all([
  //       this.contactModel.countDocuments(),
  //       this.contactModel.countDocuments({ is_read: false }),
  //       this.contactModel.countDocuments({ is_replied: false }),
  //       this.contactModel.countDocuments({ createdAt: { $gte: startOfMonth } }),
  //       this.contactModel.countDocuments({ createdAt: { $gte: startOfWeek } })
  //     ]);

  //     return {
  //       total,
  //       unread,
  //       read: total - unread,
  //       replied: total - unreplied,
  //       unreplied,
  //       thisMonth,
  //       thisWeek
  //     };
  //   }

  //   async getUnreadContacts(page: number = 1, limit: number = 20) {
  //     const skip = (page - 1) * limit;

  //     const contacts = await this.contactModel
  //       .find({ is_read: false })
  //       .sort({ createdAt: -1 })
  //       .skip(skip)
  //       .limit(limit)
  //       .exec();

  //     const total = await this.contactModel.countDocuments({ is_read: false });

  //     return {
  //       contacts,
  //       total,
  //       page,
  //       totalPages: Math.ceil(total / limit),
  //     };
  //   }
}
