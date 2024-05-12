import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { FakeApiService } from "./fake-api.service";
import { InMemoryDbService, RequestInfo, RequestInfoUtilities } from "angular-in-memory-web-api";
import { USERS } from "./db.data";
import { FakeAuth } from "./fake-auth";
import { of } from "rxjs";
import {
	HttpClientTestingModule,
	HttpTestingController,
} from "@angular/common/http/testing";

describe("FakeApiService", () => {
	let httpMock: HttpTestingController;
	let fakeApiService: FakeApiService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [FakeApiService],
		});
		httpMock = TestBed.inject(HttpTestingController);
		fakeApiService = TestBed.inject(FakeApiService);
	});

	afterEach(() => {
		httpMock.verify();
	});

	it('should call FakeAuth handler if collectionName is "auth"', () => {
		const requestInfo: Partial<RequestInfo> = { collectionName: "auth" };
		jest.spyOn(FakeAuth.prototype, "handleRequest").mockReturnValue(of({}));
		const result = fakeApiService.post(requestInfo as RequestInfo);
		expect(FakeAuth.prototype.handleRequest).toHaveBeenCalled();
	});

	it("should be created", () => {
		expect(fakeApiService).toBeTruthy();
	});

	describe("createDb", () => {
		it("should return a database object with users", () => {
			const db = fakeApiService.createDb();
			expect(db.users).toBeDefined();
			expect(db.users.length).toBe(USERS.length);
		});
	});

	describe("post", () => {
		it('should call FakeAuth handler if collectionName is "auth"', () => {
			const requestInfo: Partial<RequestInfo> = { collectionName: "auth" };
			jest.spyOn(FakeAuth.prototype, "handleRequest").mockReturnValue(of({}));
			const result = fakeApiService.post(requestInfo as RequestInfo);
			expect(FakeAuth.prototype.handleRequest).toHaveBeenCalled();
		});

		it('should return undefined if collectionName is not "auth"', () => {
			const requestInfo: Partial<RequestInfo> = { collectionName: "not_auth" };
			const result = fakeApiService.post(requestInfo as RequestInfo);
			expect(result).toBeUndefined();
		});
	});

	describe("get", () => {
		it('should return undefined if collectionName is not "users" or "auth"', (done) => {
			const requestInfo: Partial<RequestInfo> = { collectionName: "not_users" };
			const result = fakeApiService.get(requestInfo as RequestInfo);
			if (result) {
				result.subscribe((response) => {
					expect(response).toBeUndefined();
					done();
				});
			} else {
				done();
			}
		});

		xit('should return OK status if collectionName is "auth" and id is "logout"', () => {
			const requestInfo: Partial<RequestInfo> = {
				collectionName: "auth",
				id: "logout",
				utils: {} as RequestInfoUtilities,
			};

			const mockResponse = { status: 200 };

			if (fakeApiService) {
				fakeApiService.get(requestInfo as RequestInfo)!.subscribe((response) => {
					expect(response).toEqual(mockResponse);
				});

				httpMock.expectOne("/api/auth/logout").flush(mockResponse);
			} else {
				fail("fakeApiService should be defined");
			}
		});

		it('should return undefined if collectionName is not "users" or "auth"', () => {
			const requestInfo: Partial<RequestInfo> = { collectionName: "not_users" };
			const result = fakeApiService.get(requestInfo as RequestInfo);
			expect(result).toBeUndefined();
		});
	});
});
