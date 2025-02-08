import { TestBed } from '@angular/core/testing';

import { HolomateWebsocketService } from './holomate-websocket.service';

describe('HolomateWebsocketService', () => {
  let service: HolomateWebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HolomateWebsocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
