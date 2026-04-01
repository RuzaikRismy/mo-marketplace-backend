// import { ExtractJwt, Strategy } from 'passport-jwt';
// import { PassportStrategy } from '@nestjs/passport';
// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(private configService: ConfigService) {
//     // Get the JWT secret with proper error handling
//     const jwtSecret = configService.get<string>('jwt.secret');
    
//     console.log('JWT Secret loaded:', jwtSecret ? 'Yes' : 'No');
    
//     if (!jwtSecret) {
//       // Try alternative paths
//       const altSecret = configService.get<string>('JWT_SECRET');
//       console.log('Alternative JWT_SECRET:', altSecret ? 'Yes' : 'No');
      
//       throw new Error(
//         'JWT secret is not defined. Please check your .env file and configuration.\n' +
//         'Expected to find jwt.secret in configuration.'
//       );
//     }
    
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKey: jwtSecret,
//     });
//   }

//   async validate(payload: any) {
//     return { userId: payload.sub, username: payload.username };
//   }
// }

// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'your-secret-key'),
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }
    return { 
      id: payload.sub, 
      username: payload.username, 
      email: payload.email,
      role: payload.role,
    };
  }
}