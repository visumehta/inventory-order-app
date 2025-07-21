import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data?.['roles'] as Array<string>;

  if (authService.currentUserValue && expectedRoles) {
    const userRole = authService.getUserRole();
    if (userRole && expectedRoles.includes(userRole)) {
      return true;
    } else {
      // Optionally redirect to an unauthorized page or home
      router.navigate(['/unauthorized']); // Create this route later
      return false;
    }
  }

  router.navigate(['/login']);
  return false;
};
