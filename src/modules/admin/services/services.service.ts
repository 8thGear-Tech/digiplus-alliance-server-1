/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument } from './schemas/service.schema';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<ServiceDocument> {
    try {
      // Check if service with same name already exists
      const existingService = await this.serviceModel.findOne({
        name: createServiceDto.name,
        deletedAt: null,
      });

      if (existingService) {
        throw new ConflictException(
          `Service with name '${createServiceDto.name}' already exists`,
        );
      }

      const service = new this.serviceModel(createServiceDto);
      return await service.save();
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create service');
    }
  }

  async findAll(): Promise<ServiceDocument[]> {
    try {
      return await this.serviceModel
        .find({ deletedAt: null })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new BadRequestException('Failed to retrieve services');
    }
  }

  async findOne(id: string): Promise<ServiceDocument> {
    if (!id) {
      throw new BadRequestException('Service ID is required');
    }

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid service ID format');
    }

    try {
      const service = await this.serviceModel.findOne({
        _id: id,
        deletedAt: null,
      });

      if (!service) {
        throw new NotFoundException(`Service with ID '${id}' not found`);
      }

      return service;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve service');
    }
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<ServiceDocument> {
    if (!id) {
      throw new BadRequestException('Service ID is required');
    }

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid service ID format');
    }

    try {
      // Check if service exists
      const service = await this.findOne(id);

      // If name is being updated, check for conflicts
      if (updateServiceDto.name && updateServiceDto.name !== service.name) {
        const existingService = await this.serviceModel.findOne({
          name: updateServiceDto.name,
          _id: { $ne: id },
          deletedAt: null,
        });

        if (existingService) {
          throw new ConflictException(
            `Service with name '${updateServiceDto.name}' already exists`,
          );
        }
      }

      const updatedService = await this.serviceModel.findOneAndUpdate(
        { _id: id, deletedAt: null },
        updateServiceDto,
        { new: true, runValidators: true },
      );

      if (!updatedService) {
        throw new NotFoundException(`Service with ID '${id}' not found`);
      }

      return updatedService;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to update service');
    }
  }

  async remove(id: string): Promise<void> {
    if (!id) {
      throw new BadRequestException('Service ID is required');
    }

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid service ID format');
    }

    try {
      // Check if service exists
      await this.findOne(id);

      // Soft delete
      const deletedService = await this.serviceModel.findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date() },
        { new: true },
      );

      if (!deletedService) {
        throw new NotFoundException(`Service with ID '${id}' not found`);
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to delete service');
    }
  }

  async findByName(name: string): Promise<ServiceDocument> {
    if (!name) {
      throw new BadRequestException('Service name is required');
    }

    try {
      const service = await this.serviceModel.findOne({
        name: name.trim(),
        deletedAt: null,
      });

      if (!service) {
        throw new NotFoundException(`Service with name '${name}' not found`);
      }

      return service;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Failed to search service by name');
    }
  }

  async searchServices(searchTerm: string): Promise<ServiceDocument[]> {
    if (!searchTerm) {
      return await this.findAll();
    }

    try {
      const searchRegex = new RegExp(searchTerm, 'i');

      return await this.serviceModel
        .find({
          deletedAt: null,
          $or: [
            { name: searchRegex },
            { subtitle: searchRegex },
            { description: searchRegex },
          ],
        })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new BadRequestException('Failed to search services');
    }
  }

  async getServicesByPriceRange(
    minPrice?: number,
    maxPrice?: number,
  ): Promise<ServiceDocument[]> {
    try {
      const priceFilter: any = {};

      if (minPrice !== undefined) {
        priceFilter.$gte = minPrice;
      }

      if (maxPrice !== undefined) {
        priceFilter.$lte = maxPrice;
      }

      const filter: any = { deletedAt: null };
      if (Object.keys(priceFilter).length > 0) {
        filter.price = priceFilter;
      }

      return await this.serviceModel.find(filter).sort({ price: 1 }).exec();
    } catch (error) {
      throw new BadRequestException('Failed to filter services by price range');
    }
  }

  async getServicesCount(): Promise<number> {
    try {
      return await this.serviceModel.countDocuments({ deletedAt: null });
    } catch (error) {
      throw new BadRequestException('Failed to count services');
    }
  }
}
