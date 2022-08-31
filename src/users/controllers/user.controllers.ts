import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import { catchError, map, Observable, of } from 'rxjs';
import { hasRoles } from '../../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../auth/guards/jwt-guard';
import { RolesGuard } from '../../auth/guards/roles-guard';
import { LoginDto } from '../dtos/login.dto';
import { User } from '../models/user.enterface';
import { UserService } from '../services/user.service';

@Controller('users')
export class ControllersController {
  constructor(private _usersService: UserService) { }



  @hasRoles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  findAll(): Observable<User[]> {
    return this._usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Observable<User> | any {
    console.log(id);
    return this._usersService.findOne(+id);
  }

  @Post()
  create(@Body() user: User): Observable<User | object> {
    return this._usersService.create(user).pipe(
      map((user: User) => user),
      catchError((error: any) => of({ error: error })),
    );
  }

  @Post('login')
  login(@Body() loginDto: LoginDto): Observable<any> {
    return this._usersService
      .login(loginDto)
      .pipe(map((jwt: string) => {
        return { access_token: jwt };
      }),
      );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() user: User): Observable<any> {
    return this._usersService.update(+id, user);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Observable<any> | any {
    return this._usersService.delete(+id);
  }
}
