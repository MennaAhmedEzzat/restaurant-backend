import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'BLABAN_SUPER_SECRET_KEY',
    });
  }

  async validate(payload: { sub: string; phone?: string; email?: string }) {
    const identifier = payload.sub || payload.phone || payload.email;
    if (!identifier) {
      throw new UnauthorizedException('Invalid token payload');
    }
    const user = await this.usersService.findById(identifier);
    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }
    return user;
  }
}