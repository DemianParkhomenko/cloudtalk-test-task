import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Task {
  id: string;
  title: string;
  notes: string | null;
  completed: boolean;
  order: number;
  taskListId: string;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  data: T;
  timestamp: string;
}

@Injectable({ providedIn: 'root' })
export class TasksService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private readonly _tasksByList = new BehaviorSubject<Map<string, Task[]>>(new Map());
  readonly tasksByList$ = this._tasksByList.asObservable();

  loadTasksForList(listId: string): Observable<ApiResponse<Task[]>> {
    return this.http
      .get<ApiResponse<Task[]>>(`${this.baseUrl}/task-lists/${listId}/tasks`)
      .pipe(tap((res) => this.setTasksForList(listId, res.data)));
  }

  create(listId: string, data: { title: string; notes?: string }): Observable<ApiResponse<Task>> {
    return this.http
      .post<ApiResponse<Task>>(`${this.baseUrl}/task-lists/${listId}/tasks`, data)
      .pipe(
        tap((res) => {
          const current = this.getTasksForList(listId);
          this.setTasksForList(listId, [...current, res.data]);
        }),
      );
  }

  update(
    id: string,
    data: { title?: string; notes?: string | null; completed?: boolean },
  ): Observable<ApiResponse<Task>> {
    return this.http.patch<ApiResponse<Task>>(`${this.baseUrl}/tasks/${id}`, data).pipe(
      tap((res) => {
        const listId = res.data.taskListId;
        const current = this.getTasksForList(listId);
        this.setTasksForList(
          listId,
          current.map((t) => (t.id === id ? res.data : t)),
        );
      }),
    );
  }

  updateOrder(id: string, listId: string, order: number): Observable<ApiResponse<Task>> {
    return this.http.patch<ApiResponse<Task>>(`${this.baseUrl}/tasks/${id}/order`, { order }).pipe(
      tap((res) => {
        const current = this.getTasksForList(listId);
        this.setTasksForList(
          listId,
          current.map((t) => (t.id === id ? res.data : t)).sort((a, b) => a.order - b.order),
        );
      }),
    );
  }

  moveToList(
    id: string,
    sourceListId: string,
    targetListId: string,
    order?: number,
  ): Observable<ApiResponse<Task>> {
    return this.http
      .patch<ApiResponse<Task>>(`${this.baseUrl}/tasks/${id}/move`, { targetListId, order })
      .pipe(
        tap((res) => {
          // Remove from source list
          const sourceList = this.getTasksForList(sourceListId).filter((t) => t.id !== id);
          this.setTasksForList(sourceListId, sourceList);
          // Add to target list
          const targetList = this.getTasksForList(targetListId).filter((t) => t.id !== id);
          const insertIndex = targetList.findIndex((t) => t.order >= (order ?? Infinity));
          if (insertIndex === -1) {
            this.setTasksForList(targetListId, [...targetList, res.data]);
          } else {
            const newList = [...targetList];
            newList.splice(insertIndex, 0, res.data);
            this.setTasksForList(targetListId, newList);
          }
        }),
      );
  }

  delete(id: string, listId: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tasks/${id}`).pipe(
      tap(() => {
        const current = this.getTasksForList(listId);
        this.setTasksForList(
          listId,
          current.filter((t) => t.id !== id),
        );
      }),
    );
  }

  getTasksForList(listId: string): Task[] {
    return this._tasksByList.value.get(listId) ?? [];
  }

  removeList(listId: string): void {
    const map = new Map(this._tasksByList.value);
    map.delete(listId);
    this._tasksByList.next(map);
  }

  private setTasksForList(listId: string, tasks: Task[]): void {
    const map = new Map(this._tasksByList.value);
    map.set(listId, tasks);
    this._tasksByList.next(map);
  }
}
