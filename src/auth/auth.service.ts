// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import * as bcrypt from 'bcrypt';

// // Mock user for demo purposes
// const MOCK_USER = {
//   id: '1',
//   username: 'admin',
//   // password: 'admin123' (hashed)
//   passwordHash: '$2b$10$YourHashedPasswordHere', // Generate with bcrypt.hash('admin123', 10)
// };

// @Injectable()
// export class AuthService {
//   constructor(private jwtService: JwtService) {}

//   async validateUser(username: string, password: string): Promise<any> {
//     // In production, this would query a users table
//     if (username === 'admin' && password === 'admin123') {
//       const { passwordHash, ...result } = MOCK_USER;
//       return result;
//     }
//     return null;
//   }

//   async login(username: string, password: string) {
//     const user = await this.validateUser(username, password);
//     if (!user) {
//       throw new UnauthorizedException('Invalid credentials');
//     }

//     const payload = { username: user.username, sub: user.id };
//     return {
//       access_token: this.jwtService.sign(payload),
//       user: {
//         id: user.id,
//         username: user.username,
//       },
//     };
//   }
// }

// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    this.logger.log(`Validating user: ${username}`);
    
    // Try to find by username or email
    let user = await this.usersService.findByUsername(username);
    this.logger.log(`Found by username: ${!!user}`);
    
    if (!user) {
      user = await this.usersService.findByEmail(username);
      this.logger.log(`Found by email: ${!!user}`);
    }

    if (!user) {
      this.logger.warn(`User not found: ${username}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`User found: ${user.username}, role: ${user.role}`);
    this.logger.log(`Stored password hash: ${user.passwordHash}`);
    this.logger.log(`Password to validate: ${password}`);

    // Direct bcrypt comparison for debugging
    const isValidDirect = await bcrypt.compare(password, user.passwordHash);
    this.logger.log(`Direct bcrypt comparison result: ${isValidDirect}`);

    // Try using the entity method
    let isValid = false;
    try {
      isValid = await user.validatePassword(password);
      this.logger.log(`Entity validatePassword result: ${isValid}`);
    } catch (error) {
      this.logger.error(`Error in validatePassword: ${error.message}`);
    }

    if (!isValid && !isValidDirect) {
      this.logger.warn(`Invalid password for user: ${username}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      this.logger.warn(`Account deactivated: ${username}`);
      throw new UnauthorizedException('Account is deactivated');
    }

    const { passwordHash, ...result } = user;
    this.logger.log(`User validated successfully: ${username}`);
    return result;
  }

  async login(username: string, password: string) {
    try {
      const user = await this.validateUser(username, password);
      
      const payload = { 
        username: user.username, 
        sub: user.id,
        email: user.email,
        role: user.role,
      };
      
      this.logger.log(`Generating token for user: ${username}`);
      
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      };
    } catch (error) {
      this.logger.error(`Login failed for ${username}: ${error.message}`);
      throw error;
    }
  }
}