import { JwtGuard } from './jwt.guard';

export class JwtOrGuestGuard extends JwtGuard {
  protected handleUnauthorized(): boolean {
    return true;
  }
}
