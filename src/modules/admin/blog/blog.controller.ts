import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  HttpCode,
  HttpStatus,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';
import {
  ApiConsumes,
  ApiBody,
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { UploadService } from 'src/modules/cloudinary/cloudinary.service';
import { JwtUserAuthGuard } from 'src/modules/auth/guards/jwt-user-auth.guard';
import { GetUser } from 'src/modules/auth/decorators/get-user.decorator';
import { UserTypes } from 'src/shared/enums';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from 'src/exceptions';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

function formatValidationErrors(errors) {
  return errors
    .map((error) => {
      const property = error.property;
      const constraints = Object.values(error.constraints).join(', ');
      return `${property}: ${constraints}`;
    })
    .join('; ');
}

@ApiTags('Blogs')
@ApiBearerAuth()
// @UseGuards(JwtUserAuthGuard)
@Controller('blogs')
export class BlogController {
  constructor(
    private readonly blogService: BlogService,
    private readonly uploadService: UploadService,
  ) {}

  private checkAdminRole(user: any) {
    if (user.role !== UserTypes.admin) {
      throw UnauthorizedException.UNAUTHORIZED_ACCESS(
        "You don't have the necessary access to manage blogs.",
      );
    }
  }

  @Post()
  @UseGuards(JwtUserAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateBlogDto })
  @ApiResponse({ status: 201, description: 'Blog created successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'featuredImageFiles', maxCount: 10 }]),
  )
  async create(
    @GetUser() user,
    @Body() body: any,
    @UploadedFiles() files: { featuredImageFiles?: Express.Multer.File[] },
  ) {
    try {
      this.checkAdminRole(user);

      if (typeof body.tags === 'string') {
        body.tags = body.tags.split(',').map((tag) => tag.trim());
      }

      if (typeof body.featuredImageUrls === 'string') {
        body.featuredImageUrls = [body.featuredImageUrls];
      }

      const featuredImageUrlsFromText = (body.featuredImageUrls || []).filter(
        (url) => typeof url === 'string' && url.trim() !== '',
      );

      const createBlogDto = plainToClass(CreateBlogDto, body);
      if (
        body.isPublished !== undefined &&
        typeof body.isPublished === 'string'
      ) {
        // Only set it to false if the string is explicitly 'false' (case-insensitive)
        createBlogDto.isPublished = body.isPublished.toLowerCase() === 'true';
      }
      createBlogDto.featuredImageUrls = featuredImageUrlsFromText;

      const errors = await validate(createBlogDto);
      if (errors.length > 0) {
        const formattedMessage = formatValidationErrors(errors);
        throw BadRequestException.VALIDATION_ERROR(
          `Validation failed: ${formattedMessage}`,
        );
      }

      const featuredImageFiles = files.featuredImageFiles || [];
      let uploadedUrls: string[] = [];

      if (featuredImageFiles.length > 0) {
        const uploadPromises = featuredImageFiles.map((file) =>
          this.uploadService.uploadImage(
            file,
            `${createBlogDto.title}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            'blog-featured',
          ),
        );
        const uploadResults = await Promise.all(uploadPromises);
        uploadedUrls = uploadResults.map((result) => result.secure_url);
      }

      createBlogDto.featuredImageUrls = [
        ...featuredImageUrlsFromText,
        ...uploadedUrls,
      ];
      const newBlog = await this.blogService.create(createBlogDto, user);
      return {
        message: 'Blog created successfully.',
        data: newBlog,
        success: true,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw InternalServerErrorException.UNEXPECTED_ERROR(error);
    }
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Blogs retrieved successfully.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findAll() {
    try {
      const blogs = await this.blogService.findAll();
      return {
        message: 'Blogs retrieved successfully.',
        data: blogs,
        success: true,
      };
    } catch (error) {
      throw InternalServerErrorException.UNEXPECTED_ERROR(error);
    }
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Blog retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Blog not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findOne(@Param('id') id: string) {
    try {
      const blog = await this.blogService.findOne(id);
      return {
        message: 'Blog retrieved successfully.',
        data: blog,
        success: true,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw InternalServerErrorException.UNEXPECTED_ERROR(error);
    }
  }

  @Patch(':id')
  @UseGuards(JwtUserAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateBlogDto })
  @ApiResponse({ status: 200, description: 'Blog updated successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or other bad request.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 404, description: 'Blog not found.' })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'featuredImageFiles', maxCount: 10 }]),
  )
  async update(
    @GetUser() user,
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() files: { featuredImageFiles?: Express.Multer.File[] },
  ) {
    try {
      this.checkAdminRole(user);

      if (typeof body.tags === 'string') {
        body.tags = body.tags.split(',').map((tag) => tag.trim());
      }

      if (typeof body.featuredImageUrls === 'string') {
        body.featuredImageUrls = [body.featuredImageUrls];
      }

      const featuredImageUrlsFromText = (body.featuredImageUrls || []).filter(
        (url) => typeof url === 'string' && url.trim() !== '',
      );

      const updateBlogDto = plainToClass(UpdateBlogDto, body);
      updateBlogDto.featuredImageUrls = featuredImageUrlsFromText;
      const errors = await validate(updateBlogDto);
      if (errors.length > 0) {
        const formattedMessage = formatValidationErrors(errors);
        throw BadRequestException.VALIDATION_ERROR(
          `Validation failed: ${formattedMessage}`,
        );
      }

      const featuredImageFiles = files.featuredImageFiles || [];
      let uploadedUrls: string[] = [];

      if (featuredImageFiles.length > 0) {
        const uploadPromises = featuredImageFiles.map((file) =>
          this.uploadService.uploadImage(
            file,
            `${updateBlogDto.title}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            'blog-featured',
          ),
        );
        const uploadResults = await Promise.all(uploadPromises);
        uploadedUrls = uploadResults.map((result) => result.secure_url);
      }

      updateBlogDto.featuredImageUrls = [
        ...featuredImageUrlsFromText,
        ...uploadedUrls,
      ];
      const updatedBlog = await this.blogService.update(id, updateBlogDto);

      return {
        message: 'Blog updated successfully.',
        data: updatedBlog,
        success: true,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw InternalServerErrorException.UNEXPECTED_ERROR(error);
    }
  }

  @Delete(':id')
  @UseGuards(JwtUserAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Blog deleted successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized access.' })
  @ApiResponse({ status: 404, description: 'Blog not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async remove(@GetUser() user, @Param('id') id: string) {
    try {
      this.checkAdminRole(user);
      await this.blogService.remove(id);
      return {
        message: 'Blog deleted successfully.',
        success: true,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw InternalServerErrorException.UNEXPECTED_ERROR(error);
    }
  }
}
