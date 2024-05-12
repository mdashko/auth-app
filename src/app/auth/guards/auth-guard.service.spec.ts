import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthGuardService } from './auth-guard.service';
import { of } from 'rxjs';

describe('AuthGuardService', () => {
  let authGuardService: AuthGuardService;
  let router: Router;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        AuthGuardService,
        {
          provide: Router,
          useValue: { navigate: jest.fn() },
        },
        {
          provide: Store,
          useValue: {
            select: jest.fn().mockReturnValue(of(true)),
          },
        },
      ],
    });
    authGuardService = TestBed.inject(AuthGuardService);
    router = TestBed.inject(Router);
    store = TestBed.inject(Store);
  });

  it('should be created', () => {
    expect(authGuardService).toBeTruthy();
  });

  it('should return true and not navigate if user is logged in', (done) => {
    const canActivate$ = authGuardService.canActivate(
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot
    );
    canActivate$.subscribe((result) => {
      expect(result).toBeTruthy();
      expect(router.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('should return false and navigate to login page if user is not logged in', (done) => {
    (store.select as jest.Mock).mockReturnValue(of(false)); // Simulating user not logged in
    const canActivate$ = authGuardService.canActivate(
      {} as ActivatedRouteSnapshot,
      { url: '/protected' } as RouterStateSnapshot
    );
    canActivate$.subscribe((result) => {
      expect(result).toBeFalsy();
      expect(router.navigate).toHaveBeenCalledWith(['/login'], {
        queryParams: { returnUrl: '/protected' },
      });
      done();
    });
  });
});
