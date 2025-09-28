import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { ServiceResponseDto } from './dto/service-response.dto';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtUserAuthGuard } from 'src/modules/auth/guards/jwt-user-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserTypes } from 'src/shared/enums';
import { toServiceResponse } from 'src/modules/mappers/service.mapper';
import { ServiceTypesListDto } from 'src/modules/admin/services/dto/service-types-list.dto';

@ApiTags('Services')
@Controller('services')
@UseGuards(JwtUserAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post('with-images')
  @Roles(UserTypes.admin)
  @UseInterceptors(FilesInterceptor('images', 10)) // Allow up to 10 images
  @ApiOperation({
    summary: 'Create a new service with image uploads (Admin only)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Service data with image files',
    type: CreateServiceDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Service created successfully with uploaded images',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or image format',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Service with this name already exists',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async create(
    @Body() createServiceDto: CreateServiceDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ): Promise<ServiceResponseDto> {
    const service = await this.servicesService.create(createServiceDto, images);
    return toServiceResponse(service);
  }

  @Post(':id/upload-images')
  @Roles(UserTypes.admin)
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiOperation({
    summary: 'Upload images for an existing service (Admin only)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'Service unique identifier (MongoDB ObjectId)',
    type: 'string',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        replaceExisting: {
          type: 'boolean',
          description: 'Whether to replace existing images or append new ones',
          default: false,
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Image files to upload (max 10 files, 5MB each)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Images uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        urls: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid service ID format or image format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async uploadServiceImages(
    @Param('id') id: string,
    @UploadedFiles() images: Express.Multer.File[],
    @Body('replaceExisting') replaceExisting?: boolean,
  ): Promise<{ success: boolean; urls: string[] }> {
    return await this.servicesService.uploadServiceImages(
      id,
      images,
      replaceExisting || false,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all services' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term for filtering services',
    type: String,
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    description: 'Minimum price filter',
    type: Number,
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    description: 'Maximum price filter',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Services retrieved successfully',
    type: [ServiceResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  async findAll(
    @Query('search') search?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ): Promise<ServiceResponseDto[]> {
    if (search) {
      const services = await this.servicesService.searchServices(search);
      return services.map(toServiceResponse);
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      const services = await this.servicesService.getServicesByPriceRange(
        minPrice,
        maxPrice,
      );
      return services.map(toServiceResponse);
    }
    const services = await this.servicesService.findAll();
    return services.map(toServiceResponse);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get total services count' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Services count retrieved successfully',
    schema: { type: 'object', properties: { count: { type: 'number' } } },
  })
  async getCount(): Promise<{ count: number }> {
    const count = await this.servicesService.getServicesCount();
    return { count };
  }

  @Get('types')
  @ApiOperation({ summary: 'Get a list of all available service types' })
  @ApiResponse({
    status: 200,
    description: 'A list of all service types.',
    type: ServiceTypesListDto,
  })
  getServiceTypes(): ServiceTypesListDto {
    const service_types = this.servicesService.getAvailableServiceTypes();
    return { service_types };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiParam({
    name: 'id',
    description: 'Service unique identifier (MongoDB ObjectId)',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service retrieved successfully',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid service ID format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  async findOne(@Param('id') id: string): Promise<ServiceResponseDto> {
    const services = await this.servicesService.findOne(id);
    return toServiceResponse(services);
  }

  @Patch(':id/with-images')
  @Roles(UserTypes.admin)
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiOperation({ summary: 'Update service with image uploads (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'Service unique identifier (MongoDB ObjectId)',
    type: 'string',
  })
  @ApiBody({
    description: 'Service update data with optional image files',
    type: UpdateServiceDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service updated successfully with uploaded images',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data, service ID format, or image format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Service with this name already exists',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @UploadedFiles() images?: Express.Multer.File[],
  ): Promise<ServiceResponseDto> {
    const service = await this.servicesService.update(
      id,
      updateServiceDto,
      images,
    );
    return toServiceResponse(service);
  }

  @Patch(':id/main-image')
  @Roles(UserTypes.admin)
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Update service main image (Admin only)' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    description: 'Service unique identifier (MongoDB ObjectId)',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Main image updated successfully',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid service ID format or image format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async updateMainImage(
    @Param('id') id: string,
    @UploadedFile() image: Express.Multer.File,
  ): Promise<ServiceResponseDto> {
    const service = await this.servicesService.updateMainImage(id, image);
    return toServiceResponse(service);
  }

  @Delete(':id')
  @Roles(UserTypes.admin)
  @ApiOperation({ summary: 'Delete service by ID (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Service unique identifier (MongoDB ObjectId)',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Service deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid service ID format',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Insufficient permissions',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.servicesService.remove(id);
  }

  @Get('search/:name')
  @ApiOperation({ summary: 'Find service by exact name' })
  @ApiParam({
    name: 'name',
    description: 'Exact service name to search for',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service found',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  async findByName(
    @Param('name') name: string,
  ): Promise<ServiceResponseDto | null> {
    const services = await this.servicesService.findByName(name);
    return toServiceResponse(services);
  }
}
