import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { from, Observable } from 'rxjs';
import { User } from 'src/users/models/user.enterface';
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  constructor(private jwtservice: JwtService) {}

  generateJWt(user: User): Observable<string> {
    return from(this.jwtservice.signAsync({ user }));
  }

  hashPassword(password: string): Observable<string> {
    return from<string>(bcrypt.hash(password, 12));
  }

  comparePassword(
    newPassword: string,
    passwordHash: string,
  ): Observable<boolean | any> {
    return from<boolean | any>(bcrypt.compare(newPassword, passwordHash));
  }
}
