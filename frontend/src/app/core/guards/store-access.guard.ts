import { CanActivateFn } from '@angular/router';

export const storeAccessGuard: CanActivateFn = (route, state) => {
  // TODO: Implement actual store access logic here.
  // This guard should check if the current user has access to the requested store/resource.
  // For now, it always returns true.
  return true;
};
