import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../constants/environment';
import { Empleado } from '../../shared/models/empleado.model';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
    private baseUrl = `${environment.apiUrl}/employee`;

    constructor(private http: HttpClient) {}

    getAll(): Observable<Empleado[]> {
        return this.http.get<Empleado[]>(this.baseUrl);
    }

    getById(id: number): Observable<Empleado> {
        return this.http.get<Empleado>(`${this.baseUrl}/${id}`);
    }

    create(empleado: any): Observable<Empleado>{
        return this.http.post<Empleado>(this.baseUrl, empleado);
    }

    update(id: number, empleado: Empleado): Observable<Empleado> {
        return this.http.put<Empleado>(`${this.baseUrl}/${id}`, empleado);
      }

    delete(id: number): Observable<void>{
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }

}