import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../constants/environment';
import { Client } from '../../shared/models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private baseUrl = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) {}

  create(client: Client): Observable<Client> {
    return this.http.post<Client>(this.baseUrl, client);
  }

  getByPersonId(idPerson: number): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}/by-person/${idPerson}`);
  }

  getAll(): Observable<Client[]> {
  return this.http.get<Client[]>(this.baseUrl);
}
}