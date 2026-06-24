import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  findById(id: number) {
    return this.userRepo.findOne({ where: { id } });
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  // ─── ADMIN CRUD ───────────────────────────────────────────────────────────

  findAll() {
    return this.userRepo.find({
      select: ['id', 'email', 'fullName', 'role', 'status', 'createdAt', 'updatedAt'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      select: ['id', 'email', 'fullName', 'role', 'status', 'createdAt', 'updatedAt'],
    });
    if (!user) throw new NotFoundException('Tài khoản không tồn tại');
    return user;
  }

  async createUser(dto: CreateUserDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email đã được sử dụng');

    const { password, ...rest } = dto;
    const passwordHash = await bcrypt.hash(password, 12);
    const user = this.userRepo.create({
      ...rest,
      passwordHash,
      role: dto.role ?? UserRole.USER,
    });
    const saved = await this.userRepo.save(user);
    const { passwordHash: _h, ...result } = saved as any;
    return result;
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Tài khoản không tồn tại');

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepo.findOne({ where: { email: dto.email } });
      if (existing) throw new ConflictException('Email đã được sử dụng');
    }

    Object.assign(user, dto);
    const saved = await this.userRepo.save(user);
    const { passwordHash: _h, ...result } = saved as any;
    return result;
  }

  async removeUser(id: number, currentUserId: number) {
    if (id === currentUserId) {
      throw new BadRequestException('Không thể xóa tài khoản đang đăng nhập');
    }

    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Tài khoản không tồn tại');

    if (user.role === UserRole.ADMIN) {
      const adminCount = await this.userRepo.count({ where: { role: UserRole.ADMIN } });
      if (adminCount <= 1) throw new BadRequestException('Không thể xóa admin cuối cùng');
    }

    await this.userRepo.remove(user);
  }

  async changePassword(id: number, dto: ChangePasswordDto) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Tài khoản không tồn tại');

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.userRepo.update(id, { passwordHash });
    return { message: 'Đổi mật khẩu thành công' };
  }
}
