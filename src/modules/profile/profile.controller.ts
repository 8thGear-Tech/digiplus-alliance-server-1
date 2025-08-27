import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  ValidationPipe,
  Put,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { BusinessOwnerProfileBaseDto } from './dtos/business-owner.dto';
import { AdminProfileBaseDto } from './dtos/admin.dto';
import { UpdateBusinessProfileDto } from './dtos/update-business-profile.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BusinessProfileResDto } from './dtos/business-profile.res.dto';
import { AdminProfileResDto } from './dtos/admin-profile.res.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtUserAuthGuard } from '../auth/guards/jwt-user-auth.guard';
import { UpdateAdminProfileDto } from './dtos/update-admin-profile.dto';

@ApiBearerAuth()
@ApiTags('Profile')
@UseGuards(JwtUserAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiOkResponse({
    type: BusinessProfileResDto,
  })
  @HttpCode(200)
  @Get('business')
  async getBusinessProfile(@GetUser() user) {
    console.log(user);
    return await this.profileService.getBusinessProfile(user._id);
  }

  // @ApiOkResponse({
  //   type: BusinessProfileResDto,
  // })
  // @HttpCode(200)
  // @Patch('business')
  // async updateCoorporateProfile(
  //   @GetUser() user,
  //   @Body(ValidationPipe) businessProfile: BusinessOwnerProfileBaseDto,
  // ) {
  //   return await this.profileService.updateBusinessProfile({
  //     ...businessProfile,
  //     userId: user._id,
  //   });
  // }

  // In profile.controller.ts
  @ApiOkResponse({
    type: BusinessProfileResDto,
  })
  @HttpCode(200)
  @Patch('business')
  async updateBusinessProfile(
    @GetUser() user,
    @Body(ValidationPipe) businessProfile: UpdateBusinessProfileDto, // Corrected DTO
  ) {
    return await this.profileService.updateBusinessProfile({
      ...businessProfile,
      userId: user._id,
    });
  }

  // New endpoint for admins
  @ApiOkResponse({
    type: AdminProfileResDto, // You will need to create a ProfileResDto for admins as well
  })
  @HttpCode(200)
  @Get('admin')
  async getAdminProfile(@GetUser() user) {
    return await this.profileService.getAdminProfile(user._id);
  }

  // New endpoint for admins
  @ApiOkResponse({
    type: AdminProfileResDto,
  })
  @HttpCode(200)
  @Patch('admin')
  async updateAdminProfile(
    @GetUser() user,
    @Body(ValidationPipe) adminProfile: UpdateAdminProfileDto,
  ) {
    return await this.profileService.updateAdminProfile({
      ...adminProfile,
      userId: user._id,
    });
  }

  @HttpCode(201)
  @ApiOkResponse({
    type: AdminProfileResDto,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orgLogo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('uploadlogo')
  @UseInterceptors(FileInterceptor('orgLogo'))
  async uploadLogo(@GetUser() user, @UploadedFile() file: Express.Multer.File) {
    return await this.profileService.uploadLogo(file, user._id);
  }
}
