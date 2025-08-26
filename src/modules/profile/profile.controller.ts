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
import { CreateBusinessOwnerProfileDto } from './dtos/business-owner.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProfileResDto } from './dtos/profile.res.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtUserAuthGuard } from '../auth/guards/jwt-user-auth.guard';

@ApiBearerAuth()
@ApiTags('Profile')
@UseGuards(JwtUserAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @ApiOkResponse({
    type: ProfileResDto,
  })
  @HttpCode(200)
  @Get('business')
  async getBusinessProfile(@GetUser() user) {
    console.log(user);
    return await this.profileService.getBusinessProfile(user._id);
  }

  @ApiOkResponse({
    type: ProfileResDto,
  })
  @HttpCode(201)
  @Post('business')
  async createBusinessProfile(
    @GetUser() user,
    @Body(ValidationPipe) businessProfile: CreateBusinessOwnerProfileDto,
  ) {
    return await this.profileService.createBusinessProfile({
      ...businessProfile,
      userId: user._id,
      email: user.email,
      role: user.role,
    });
  }

  @ApiOkResponse({
    type: ProfileResDto,
  })
  @HttpCode(200)
  @Patch('business')
  async updateCoorporateProfile(
    @GetUser() user,
    @Body(ValidationPipe) businessProfile: CreateBusinessOwnerProfileDto,
  ) {
    return await this.profileService.updateBusinessProfile({
      ...businessProfile,
      userId: user._id,
    });
  }

  @HttpCode(201)
  @ApiOkResponse({
    type: ProfileResDto,
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
