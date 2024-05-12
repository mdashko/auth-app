import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { NoAuthGuardService } from './no-auth-guard.service';
import { selectIsLoggedIn } from '../store/auth.selectors';

describe('NoAuthGuardService', () => {
  let service: NoAuthGuardService;
  let router: Router;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        NoAuthGuardService,
        provideMockStore({
          selectors: [{ selector: selectIsLoggedIn, value: false }]
        })
      ]
    });
    service = TestBed.inject(NoAuthGuardService);
    router = TestBed.inject(Router);
    store = TestBed.inject(MockStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return true if user is not logged in', () => {
    const canActivate$ = service.canActivate();
    canActivate$.subscribe(result => {
      expect(result).toBeTruthy();
    });
  });

  it('should navigate to "/" if user is logged in', () => {
    jest.spyOn(router, 'navigateByUrl');
    store.overrideSelector(selectIsLoggedIn, true);
    const canActivate$ = service.canActivate();
    canActivate$.subscribe(result => {
      expect(router.navigateByUrl).toHaveBeenCalledWith('/');
      expect(result).toBeFalsy();
    });
  });
});
