import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.schema';
import { Repositories } from 'src/shared/enums';
import { BaseRepository } from '../repository/base.repository';
// import { UserApplicationService } from '../business-owner/user-application.service';
import { AdminApplicationService } from '../admin/application/services/admin-application.service';

export interface AdminMetrics {
  totalUsers: number;
  // totalApplications: number;
  // totalAssessmentsCompleted: number;
}


@Injectable()
export class UserService {
  constructor(
    @Inject(Repositories.UserRepository)
    private readonly userRepository: BaseRepository<User>,
    // Assuming UserApplicationService is available for application metrics
    // private readonly adminApplicationService: AdminApplicationService,
  ) {}

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({});
  }

  findOne(filterData: Partial<User>) {
    return `This action returns a #$ user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async getAdminMetrics(): Promise<AdminMetrics> {
    const totalUsers = await this.userRepository.count({});

    // const totalApplications =
    //   await this.adminApplicationService.getTotalApplicationsCount();
    // const totalAssessmentsCompleted =
    //   await this.userApplicationService.getTotalAssessmentsCompletedCount();

    return {
      totalUsers,
      // totalApplications,
      // totalAssessmentsCompleted,
    };
  }

}
