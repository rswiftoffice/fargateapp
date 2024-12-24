import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user) {
      const isValidPassword = await this.validatePassword(
        password,
        user.password,
      );

      if (isValidPassword) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, provider, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user.id };
    console.log(this.jwtService.sign(payload, {secret: process.env.JWT_SECRET}),"====TOKEN",user)
    return {
      access_token: this.jwtService.sign(payload, {secret: process.env.JWT_SECRET}),
      user,
    };
  }
}
