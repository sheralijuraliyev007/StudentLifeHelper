import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SqlQueryEntry {
  sql: string;
  duration: string;
}

@Injectable({ providedIn: 'root' })
export class SqlPanelService {
  private queriesSubject = new BehaviorSubject<SqlQueryEntry[]>([]);
  private silentBuffer: SqlQueryEntry[] = [];

  queries$ = this.queriesSubject.asObservable();

  push(queries: SqlQueryEntry[]) {
    const current = this.queriesSubject.getValue();
    this.queriesSubject.next([...current, ...queries]);
  }

  pushSilent(queries: SqlQueryEntry[]) {
    this.silentBuffer.push(...queries);
  }

  flushSilent() {
    if (this.silentBuffer.length) {
      const current = this.queriesSubject.getValue();
      this.queriesSubject.next([...current, ...this.silentBuffer]);
      this.silentBuffer = [];
    }
  }

  clear() {
    this.queriesSubject.next([]);
    this.silentBuffer = [];
  }
}