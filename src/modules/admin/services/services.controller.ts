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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceResponseDto } from './dto/service-response.dto';
import { JwtUserAuthGuard } from 'src/modules/auth/guards/jwt-user-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserTypes } from 'src/shared/enums';
import { toServiceResponse } from 'src/modules/mappers/service.mapper';

@ApiTags('Services')
@Controller('services')
@UseGuards(JwtUserAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @Roles(UserTypes.admin)
  @ApiOperation({ summary: 'Create a new service (Admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Service created successfully',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
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
  ): Promise<ServiceResponseDto> {
    const services = await this.servicesService.create(createServiceDto);
    return toServiceResponse(services);
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

  @Patch(':id')
  @Roles(UserTypes.admin)
  @ApiOperation({ summary: 'Update service by ID (Admin only)' })
  @ApiParam({
    name: 'id',
    description: 'Service unique identifier (MongoDB ObjectId)',
    type: 'string',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service updated successfully',
    type: ServiceResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or service ID format',
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
  ): Promise<ServiceResponseDto> {
    const services = await this.servicesService.update(id, updateServiceDto);
    return toServiceResponse(services);
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
