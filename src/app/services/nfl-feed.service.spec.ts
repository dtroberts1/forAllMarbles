import { TestBed } from '@angular/core/testing';

import { NflFeedService } from './nfl-feed.service';

describe('NflFeedService', () => {
  let service: NflFeedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NflFeedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
