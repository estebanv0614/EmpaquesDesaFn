import { Person } from './person.model';
import { Rol } from './rol.model';

export interface User {
  id: number;
  username: string;
  password: string;
  persona: Person;
  activo?: boolean;
  roles?: Rol[];
}

export interface UserCreateRequest {
  person: { id: number };
  username: string;
  password: string;
  activo: boolean;
  roles: Rol[];
}
