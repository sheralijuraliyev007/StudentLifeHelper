import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LanguageStateService {
  private readonly languageCodeSubject = new BehaviorSubject<number | null>(null);
  readonly languageCode$ = this.languageCodeSubject.asObservable();

  setLanguageCode(languageCode: number | null): void {
    this.languageCodeSubject.next(languageCode);
  }
}
