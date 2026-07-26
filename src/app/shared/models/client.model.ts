import { Estado } from "./estado.model";
import { Person } from "./person.model";

export interface Client {
    id: number;
    person: Person;
    empresa?: string;
    estado: Estado;
}