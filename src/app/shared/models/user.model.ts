import { Person } from "./person.model";

export interface User {
    id: number;
    username: string;
    password: string;
    persona: Person;
    activo?: boolean;
}