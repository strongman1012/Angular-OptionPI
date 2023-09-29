import { TestBed } from '@angular/core/testing';

import { DasboardService } from './dashboard.service';

describe('DasboardService', () => {
  let service: DasboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DasboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
