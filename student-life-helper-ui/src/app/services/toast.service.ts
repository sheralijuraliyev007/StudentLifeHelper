import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: number;
  text: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  private counter = 0;

  readonly toasts$ = this.toastsSubject.asObservable();

  show(text: string, success: boolean): void {
    const id = ++this.counter;
    const nextToast: ToastMessage = { id, text, success };
    this.toastsSubject.next([...this.toastsSubject.value, nextToast]);

    window.setTimeout(() => {
      const filtered = this.toastsSubject.value.filter((toast) => toast.id !== id);
      this.toastsSubject.next(filtered);
    }, 3000);
  }
}
