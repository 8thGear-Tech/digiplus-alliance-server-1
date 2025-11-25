import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog } from './blog.schema';
import { User } from '../../user/user.schema';
import { CreateBlogDto } from './dtos/create-blog.dto';
import { UpdateBlogDto } from './dtos/update-blog.dto';
import { BadRequestException } from 'src/exceptions';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name) private readonly blogModel: Model<Blog>,
  ) {}

  private async getRelatedBlogs(
    tags: string[],
    currentBlogId: string,
    limit: number = 3, // You can choose how many related blogs to return
  ): Promise<Blog[]> {
    if (!tags || tags.length === 0) {
      return [];
    }

  
    return this.blogModel
      .find({
        tags: { $in: tags }, 
        _id: { $ne: currentBlogId }, 
      })
      .limit(limit)
      .sort({ createdAt: -1 }) 
      .exec();
  }
  async create(createBlogDto: CreateBlogDto, user: User): Promise<Blog> {
    const newBlog = new this.blogModel({
      ...createBlogDto,
      author: `${user.first_name} ${user.last_name}`,
      authorId: user._id,
    });
    return newBlog.save();
  }

  async findAll(): Promise<Blog[]> {
    return this.blogModel.find().exec();
  }

  async findOne(id: string): Promise<any> {
    try {
      const blog = await this.blogModel.findById(id).exec();
      if (!blog) {
        throw BadRequestException.RESOURCE_NOT_FOUND(
          `Blog with ID ${id} not found`,
        );
      }

   
     const tags = blog.tags || [];

   
     const relatedBlogs = await this.getRelatedBlogs(tags, id, 3);
     
     return {
       ...blog.toObject(),
       relatedBlogs: relatedBlogs.map(b => b.toObject()),
     };

   } catch (error) {
     if (error.name === 'CastError') {
       throw BadRequestException.RESOURCE_NOT_FOUND(
         `Invalid ID format: ${id}`,
       );
     }
     throw error;
   }
 }

  async update(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog> {
    try {
      const updatedBlog = await this.blogModel.findByIdAndUpdate(
        id,
        updateBlogDto,
        { new: true },
      );
      if (!updatedBlog) {
        throw BadRequestException.RESOURCE_NOT_FOUND(
          `Blog with ID ${id} not found`,
        );
      }
      return updatedBlog;
    } catch (error) {
      if (error.name === 'CastError') {
        throw BadRequestException.RESOURCE_NOT_FOUND(
          `Invalid ID format: ${id}`,
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const blog = await this.blogModel.deleteOne({ _id: id });
      if (blog.deletedCount === 0) {
        throw BadRequestException.RESOURCE_NOT_FOUND(
          `Blog with ID ${id} not found`,
        );
      }
    } catch (error) {
      if (error.name === 'CastError') {
        throw BadRequestException.RESOURCE_NOT_FOUND(
          `Invalid ID format: ${id}`,
        );
      }
      throw error;
    }
  }
}
