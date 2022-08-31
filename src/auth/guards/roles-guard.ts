import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { map, Observable } from "rxjs";
import { User } from 'src/users/models/user.enterface';
import { UserService } from '../../users/services/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userservice: UserService
  ) { }


  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return this.userservice.findOne(user.id).pip(
      map((user: User) => {
        const hasRole = () => roles.indexOf(user.role) > -1;
        let hasPermission: boolean = false;
        if (hasRole()) {
          hasPermission = true;
        }
        return user && hasPermission;
      })
    );
  }
}
