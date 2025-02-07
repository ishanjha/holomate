import { TestBed } from '@angular/core/testing';

import { WebSocketServiceServiceService } from './web-socket-service-service.service';

describe('WebSocketServiceServiceService', () => {
  let service: WebSocketServiceServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebSocketServiceServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
