import { Injectable, UnauthorizedException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info, context: ExecutionContext) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    // If user is a client, restrict their access
    if (user.role === 'client') {
      const allowedClientRoutes = [
        { method: 'GET', path: '/projects/dashboard' },
        { method: 'GET', path: '/tickets/my' },
        { method: 'GET', path: '/tickets/unread-count' },
        { method: 'POST', path: '/tickets' },
        { method: 'POST', path: '/projects' },
        { method: 'POST', path: '/upload' },
      ];

      const isTicketRoute = url.startsWith('/tickets/') && 
        !url.startsWith('/tickets/admin') && 
        !url.startsWith('/tickets/department') && 
        !url.startsWith('/tickets/all') && 
        !url.endsWith('/close');

      const isAllowed = allowedClientRoutes.some(route => 
        method === route.method && (url === route.path || url === route.path + '/')
      ) || (method === 'GET' && url.startsWith('/auth/profile'))
        || (method === 'POST' && url.startsWith('/auth/reset-telegram'))
        || (method === 'PUT' && url.match(/^\/auth\/users\/[^\/]+\/password$/))
        || isTicketRoute;

      if (!isAllowed) {
        throw new UnauthorizedException('Clients are not allowed to access this resource');
      }
    }

    return user;
  }
}
