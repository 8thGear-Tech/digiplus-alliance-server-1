import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { ServicesController } from './services.controller';
import { ServicesService } from './services.service';
import { Service, ServiceSchema } from './schemas/service.schema';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 10, // Maximum 10 files
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
        ];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new Error(
              'Invalid file type. Only JPEG, JPG, PNG, and WebP are allowed',
            ),
            false,
          );
        }
      },
    }),
    CloudinaryModule, // Using your existing CloudinaryModule
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
