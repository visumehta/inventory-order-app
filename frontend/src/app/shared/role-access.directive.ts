import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../core/services/auth.service';

@Directive({
  selector: '[appRoleAccess]'
})
export class RoleAccessDirective {
  private hasView = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) { }

  @Input()
  set appRoleAccess(allowedRoles: string[]) {
    const userRole = this.authService.getUserRole(); // Assuming this method exists in AuthService

    if (userRole && allowedRoles.includes(userRole)) {
      if (!this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      }
    } else {
      if (this.hasView) {
        this.viewContainer.clear();
        this.hasView = false;
      }
    }
  }
}
