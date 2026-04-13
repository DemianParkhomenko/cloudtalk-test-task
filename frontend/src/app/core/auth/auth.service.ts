import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  data: {
    accessToken: string;
    user: User;
  };
}

const TOKEN_KEY = 'todo_access_token';
const USER_KEY = 'todo_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly _token = signal<string | null>(this.getFromStorage(TOKEN_KEY));
  private readonly _user = signal<User | null>(this.parseStoredUser(this.getFromStorage(USER_KEY)));

  readonly isLoggedIn = computed(() => !!this._token());
  readonly currentUser = computed(() => this._user());
  readonly token = computed(() => this._token());

  register(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, { email, password })
      .pipe(tap((res) => this.handleAuthResponse(res)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap((res) => this.handleAuthResponse(res)));
  }

  logout(): void {
    this.removeFromStorage(TOKEN_KEY);
    this.removeFromStorage(USER_KEY);
    this._token.set(null);
    this._user.set(null);
    void this.router.navigate(['/login']);
  }

  private handleAuthResponse(res: AuthResponse): void {
    const { accessToken, user } = res.data;
    this.setInStorage(TOKEN_KEY, accessToken);
    this.setInStorage(USER_KEY, JSON.stringify(user));
    this._token.set(accessToken);
    this._user.set(user);
  }

  private parseStoredUser(rawValue: string | null): User | null {
    if (!rawValue) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawValue) as Partial<User>;
      if (typeof parsed.id === 'string' && typeof parsed.email === 'string') {
        return parsed as User;
      }
      return null;
    } catch {
      return null;
    }
  }

  private getFromStorage(key: string): string | null {
    if (!this.isBrowser) {
      return null;
    }

    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private setInStorage(key: string, value: string): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      sessionStorage.setItem(key, value);
    } catch {
      // Ignore storage write failures and keep auth state in memory.
    }
  }

  private removeFromStorage(key: string): void {
    if (!this.isBrowser) {
      return;
    }

    try {
      sessionStorage.removeItem(key);
    } catch {
      // Ignore storage removal failures.
    }
  }
}
