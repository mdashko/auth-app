import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { StoreModule, Store } from '@ngrx/store';
import { of } from 'rxjs';
import { AuthService, AccessData } from './auth.service';
import { ConfigService } from '../core/services';
import { TokenStorageService } from '../core/services/token-storage.service';
import { AuthState, AuthUser, TokenStatus } from './store/auth.models';
import * as AuthActions from './store/auth.actions';
import * as AuthSelectors from './store/auth.selectors';

describe('AuthService', () => {
  let authService: AuthService;
  let httpMock: HttpTestingController;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, StoreModule.forRoot({})],
      providers: [
        AuthService,
        ConfigService,
        TokenStorageService,
        {
          provide: Store,
          useValue: {
            dispatch: jest.fn(),
            select: jest.fn(() => of({
              refreshTokenStatus: TokenStatus.VALID,
              user: {} as AuthUser
            } as AuthState))
          }
        }
      ]
    });
    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(Store);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(authService).toBeTruthy();
  });

  it('should dispatch refreshTokenRequest action during init', async () => {
    await authService.init();
    expect(store.dispatch).toHaveBeenCalledWith(AuthActions.refreshTokenRequest());
  });

  it('should make a POST request to login endpoint', fakeAsync(() => {
    const username = 'testuser';
    const password = 'password';

    const mockAccessData: AccessData = {
      token_type: 'Bearer',
      expires_in: 3600,
      access_token: 'ACCESS_TOKEN',
      refresh_token: 'REFRESH_TOKEN'
    };

    authService.login(username, password).subscribe(data => {
      expect(data).toEqual(mockAccessData);
    });

	tick();

    const req = httpMock.expectOne(`${authService['hostUrl']}/api/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      client_id: authService['clientId'],
      client_secret: authService['clientSecret'],
      grant_type: 'password',
      username,
      password
    });

    req.flush(mockAccessData);
  }));

  it('should make a GET request to logout endpoint', () => {
    const clients = 'current';
  
    authService.logout(clients).subscribe(() => {
      expect(() => {}).not.toThrow();
    });
  
    const req = httpMock.expectOne(`${authService['hostUrl']}/api/auth/logout?clients=${clients}`);
    expect(req.request.method).toBe('GET');
  
    req.flush({});
  });

  xit('should make a POST request to refresh token endpoint', fakeAsync(() => {
	const mockAccessData: AccessData = {
	  token_type: 'Bearer',
	  expires_in: 3600,
	  access_token: 'NEW_ACCESS_TOKEN',
	  refresh_token: 'NEW_REFRESH_TOKEN'
	};
  
	authService.refreshToken().subscribe((data) => {
	  expect(data).toEqual(mockAccessData);
	});
  
	tick();
	httpMock.expectOne(`${authService['hostUrl']}/api/auth/login`).flush(mockAccessData);
  }));

  xit('should make a GET request to logout endpoint', () => {
	const clients = 'current';
  
	authService.logout(clients).subscribe((data) => {
	  expect(data).toBeUndefined();
	});
  
	const req = httpMock.expectOne(`${authService['hostUrl']}/api/auth/logout?clients=${clients}`);
	expect(req.request.method).toBe('GET');
  
	req.flush({});
  });
});
