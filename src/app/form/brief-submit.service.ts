import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BriefSubmitService {
  constructor(private http: HttpClient) {}

  /**
   * Submits the brief to the backend which will generate a PDF and email it to the internal address.
   * Backend is expected at POST /api/brief/submit
   */
  submit(payload: unknown): Observable<unknown> {
    return this.http.post('/api/brief/submit', payload, {
      headers: {
        'x-api-key': environment.internalApiKey
      }
    });
  }
}
