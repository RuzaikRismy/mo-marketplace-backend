// src/users/users.service.ts
import { Injectable, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password, ...rest } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    const user = this.userRepository.create({
      username,
      email,
      passwordHash: password,
      ...rest,
    });

    return this.userRepository.save(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, updateData);
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.remove(user);
  }

  // New method to fix invalid password hashes
  async fixInvalidPasswordHashes(): Promise<void> {
    this.logger.log('Checking for invalid password hashes...');
    
    const users = await this.userRepository.find();
    let fixedCount = 0;

    for (const user of users) {
      // Check if hash is invalid (not 60 chars or contains placeholder text)
      const isInvalidHash = 
        !user.passwordHash || 
        user.passwordHash.length !== 60 || 
        user.passwordHash.includes('your_generated_hash') ||
        user.passwordHash.includes('YOUR_HASH_HERE');

      if (isInvalidHash) {
        this.logger.log(`Fixing invalid hash for user: ${user.username}`);
        
        // Determine the correct password based on username
        let correctPassword: string;
        if (user.username === 'admin') {
          correctPassword = 'admin123';
        } else if (['john_doe', 'jane_smith', 'mike_wilson'].includes(user.username)) {
          correctPassword = 'password123';
        } else {
          // Skip if we don't know the password
          this.logger.warn(`Unknown password for user: ${user.username}, skipping...`);
          continue;
        }

        // Generate proper hash
        const properHash = await bcrypt.hash(correctPassword, 10);
        
        // Update the user
        await this.userRepository.update(user.id, { passwordHash: properHash });
        fixedCount++;
        
        this.logger.log(`Fixed password for ${user.username}`);
      }
    }

    if (fixedCount > 0) {
      this.logger.log(`Fixed ${fixedCount} invalid password hashes`);
    } else {
      this.logger.log('All password hashes are valid');
    }
  }

  async createDefaultAdmin(): Promise<void> {
    const adminExists = await this.userRepository.findOne({
      where: { role: UserRole.ADMIN },
    });

    if (!adminExists) {
      const admin = this.userRepository.create({
        username: 'admin',
        email: 'admin@momarketplace.com',
        passwordHash: 'admin123',
        role: UserRole.ADMIN,
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
      });
      await this.userRepository.save(admin);
      this.logger.log('Default admin user created');
    }
  }

  // Add method to create demo users if they don't exist
  async createDemoUsers(): Promise<void> {
    const demoUsers = [
      {
        username: 'john_doe',
        email: 'john@example.com',
        passwordHash: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.CUSTOMER,
      },
      {
        username: 'jane_smith',
        email: 'jane@example.com',
        passwordHash: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.CUSTOMER,
      },
      {
        username: 'mike_wilson',
        email: 'mike@example.com',
        passwordHash: 'password123',
        firstName: 'Mike',
        lastName: 'Wilson',
        role: UserRole.CUSTOMER,
      },
    ];

    for (const userData of demoUsers) {
      const existingUser = await this.userRepository.findOne({
        where: { username: userData.username },
      });
      
      if (!existingUser) {
        const user = this.userRepository.create(userData);
        await this.userRepository.save(user);
        this.logger.log(`Demo user ${userData.username} created`);
      }
    }
  }
}