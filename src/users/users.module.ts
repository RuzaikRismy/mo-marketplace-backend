// src/users/users.module.ts
import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule implements OnModuleInit {
  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    // Wait a bit for the database connection to be fully established
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create default admin if not exists
    await this.usersService.createDefaultAdmin();
    
    // Create demo users if not exists
    await this.usersService.createDemoUsers();
    
    // Fix any invalid password hashes
    await this.usersService.fixInvalidPasswordHashes();
    
    console.log(' User initialization completed');
  }
}