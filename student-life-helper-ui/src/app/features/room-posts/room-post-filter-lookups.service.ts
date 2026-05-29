import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, shareReplay } from 'rxjs';
import type { SelectListItem } from '../../services/manual.service';
import { RegisterLookupService } from '../../services/register-lookup.service';

export interface RoomPostFilterLookups {
  countries: SelectListItem<number>[];
  roomTypes: SelectListItem<number>[];
  roomPostTypes: SelectListItem<number>[];
  currencies: SelectListItem<number>[];
  genders: SelectListItem<number>[];
}

/** Cached manual lists for room-post filters (shared across browse / mine). */
@Injectable({ providedIn: 'root' })
export class RoomPostFilterLookupsService {
  private readonly lookups = inject(RegisterLookupService);

  private readonly bundle$ = forkJoin({
    countries: this.lookups.getCountrySelect(),
    roomTypes: this.lookups.getRoomTypeSelect(),
    roomPostTypes: this.lookups.getRoomPostTypeSelect(),
    currencies: this.lookups.getCurrencyTypeSelect(),
    genders: this.lookups.getGenderSelect(),
  }).pipe(shareReplay({ bufferSize: 1, refCount: false }));

  load(): Observable<RoomPostFilterLookups> {
    return this.bundle$;
  }
}
