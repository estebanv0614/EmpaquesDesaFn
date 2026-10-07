import { Estado } from './estado.model';
import { Person } from './person.model';

export interface Empleado {
  id: number;
  person: Person;
  position: string;
  salary: number;
  fechaIngreso: string;
  estado: Estado;
}
