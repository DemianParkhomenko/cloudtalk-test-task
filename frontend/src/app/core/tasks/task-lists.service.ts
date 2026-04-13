import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map, switchMap, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TaskList {
  id: string;
  name: string;
  order: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class TaskListsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/task-lists`;

  private readonly _lists = new BehaviorSubject<TaskList[]>([]);
  readonly lists$ = this._lists.asObservable();

  loadLists(): Observable<ApiResponse<TaskList[]>> {
    return this.http
      .get<ApiResponse<TaskList[]>>(this.baseUrl)
      .pipe(tap((res) => this._lists.next(res.data)));
  }

  create(name: string): Observable<ApiResponse<TaskList>> {
    return this.http
      .post<ApiResponse<TaskList>>(this.baseUrl, { name })
      .pipe(tap((res) => this._lists.next([...this._lists.value, res.data])));
  }

  update(id: string, name: string): Observable<ApiResponse<TaskList>> {
    return this.http.patch<ApiResponse<TaskList>>(`${this.baseUrl}/${id}`, { name }).pipe(
      tap((res) => {
        const updated = this._lists.value.map((l) => (l.id === id ? res.data : l));
        this._lists.next(updated);
      }),
    );
  }

  updateOrder(id: string, order: number): Observable<ApiResponse<TaskList>> {
    return this.http
      .patch<ApiResponse<TaskList>>(`${this.baseUrl}/${id}/order`, { order })
      .pipe(switchMap((res) => this.loadLists().pipe(map(() => res))));
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        this._lists.next(this._lists.value.filter((l) => l.id !== id));
      }),
    );
  }

  getSnapshot(): TaskList[] {
    return this._lists.value;
  }
}
