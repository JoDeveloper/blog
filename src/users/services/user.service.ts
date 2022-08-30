/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { catchError, from, map, Observable, switchMap, throwError } from 'rxjs';

import { Repository } from 'typeorm';
import { AuthService } from '../../auth/services/auth.service';
import { User } from '../models/user.enterface';
import { UserEntity } from '../models/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly _userRepository: Repository<UserEntity>,
    private _authService: AuthService,
  ) {}

  findOne(id: number): Observable<User> | any {
    const user = from(this._userRepository.findOneBy({ id: id })).pipe(
      map((user: User) => this._removePasswordFromUser(user)),
    );
  }

  create(user: User): Observable<User> |any{
    return this._authService.hashPassword(user.password).pipe(
      switchMap((passwordHash: string) => {
        const newUser = this._swaprawPasswordWithHashedOne(passwordHash, user);

        return from(this._userRepository.save(newUser)).pipe(
          map((user: User) => {
            return this._removePasswordFromUser(user);
          }),
          catchError(err => throwError(() => err.detail)),
        );
      }),
    );
  }

  findAll(): Observable<User[]> {
    return from(this._userRepository.find()).pipe(
      map((users: User[]) => {
        users.forEach((user) => {
          delete user.password;
        });
        return users;
      }),
    );
  }

  delete(id: number): Observable<any> {
    return from(this._userRepository.delete(id));
  }

  update(id: number, user: User): Observable<any> {
    delete user.email;
    delete user.password;
    return from(this._userRepository.update(id, user));
  }

  login(user: User): Observable<string> {
    return this.validate(user.email, user.password).pipe(
      switchMap((user: User) => {
        if (user) {
          return this._authService
            .generateJWt(user)
            .pipe(map((jwt: string) => jwt),
          );
        }else
        return 'Wrong username or password provided';
      },
      ),

    );
  }

  validate(email: string, password: string): Observable<User> {
    return this.findByEmail(email).pipe(
      switchMap((user: User) =>
        this._authService.comparePassword(password, user.password).pipe(
          map((match: boolean) => {
            console.log(match);
            if (match) {
              return this._removePasswordFromUser(user);
            } else {
              console.log("should throw exception")
              throw Error;
            }
            
          }),
        ),
      ),
    );
  }

  findByEmail(email: string): Observable<User> {
    return from(this._userRepository.findOneBy({ email: email }));
  }

  private _swaprawPasswordWithHashedOne(passwordHash: string, user: User) {
    const newUser = new UserEntity();
    newUser.password = passwordHash;
    newUser.email = user.email;
    newUser.username = user.username;
    newUser.name = user.name;
    return newUser;
  }

  private _removePasswordFromUser(user: User): User {
    const { password, ...result } = user;
    return result;
  }
}
