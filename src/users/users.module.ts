import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ControllersController } from './controllers/user.controllers';
import { UserEntity } from './models/user.entity';
import { UserService } from './services/user.service';
@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [ControllersController],
  providers: [UserService],
  exports: [UserService],
})
export class UsersModule { }
