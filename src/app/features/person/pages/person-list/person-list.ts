import { Component, OnInit, signal, computed } from '@angular/core';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PersonService } from '../../../../core/services/person-service';
import { Person } from '../../../../shared/models/person.model';
import { PersonFrom } from '../person-from/person-from';
import { EmpleadoList } from '../../../empleado/pages/empleado-list/empleado-list';
import { Client } from '../../../../shared/models/client.model';
import { ClientService } from '../../../../core/services/client-service';
import { forkJoin } from 'rxjs';
import { UserForm } from '../../components/user-form/user-form';
import { UserService } from '../../../../core/services/user-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-person-list',
  standalone: true,
  imports: [PrimeImportsModule, PersonFrom, EmpleadoList, UserForm, FormsModule],
  templateUrl: './person-list.html',
  styleUrl: './person-list.css',
  providers: [ConfirmationService],
})
export class PersonList implements OnInit {
  persons = signal<Person[]>([]);
  loading = signal<boolean>(false);
  clients = signal<Client[]>([]);
  showForm = false;
  selectedPerson: Person | null = null;
  showUserForm = false;
  selectedPersonForUser: Person | null = null;
  users = signal<any[]>([]);

  tipoFiltro = signal<'TODAS' | 'CLIENTES' | 'SIN_CLIENTE' | null>(null);

  opcionFiltro = [
    { label: 'Todas las personas', value: 'TODAS' },
    { label: 'Solo clientes', value: 'CLIENTES' },
    { label: 'No clientes', value: 'SIN_CLIENTE' },
  ];

  personaFiltrada = computed(() => {
    const filtro = this.tipoFiltro();
    const lista = this.persons();
    const clientes = this.clientePorPersona();
    if (filtro === 'CLIENTES') return lista.filter((p) => clientes.has(p.id));
    if (filtro === 'SIN_CLIENTE') return lista.filter((p) => !clientes.has(p.id));
    return lista;
  });

  openCreateUser(person: Person): void {
    this.selectedPersonForUser = person;
    this.showUserForm = true;
  }

  onUserFormClosed(saved: boolean): void {
    this.showUserForm = false;
    this.selectedPersonForUser = null;
    if (saved) {
      this.loadPersons();
    }
  }

  constructor(
    private personService: PersonService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private clientService: ClientService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.loadPersons();
  }

  userPersona = computed(() => {
    const mapa = new Map<number, any>();
    this.users().forEach((u) => mapa.set(u.person?.id, u));
    return mapa;
  });

  clientePorPersona = computed(() => {
    const mapa = new Map<number, Client>();
    this.clients().forEach((c) => mapa.set(c.person.id, c));
    return mapa;
  });

  loadPersons(): void {
    this.loading.set(true);

    forkJoin({
      persons: this.personService.getAll(),
      clients: this.clientService.getAll(),
      users: this.userService.getAll(),
    }).subscribe({
      next: ({ persons, clients, users }) => {
        this.persons.set(persons);
        this.clients.set(clients);
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar personas o clientes:', err);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las personas y los clientes.',
        });
      },
    });
  }

  openCreate(): void {
    this.selectedPerson = null;
    this.showForm = true;
  }

  openEdit(person: Person): void {
    this.selectedPerson = person;
    this.showForm = true;
  }

  onFormClosed(saved: boolean): void {
    this.showForm = false;
    if (saved) {
      this.loadPersons();
    }
  }

  confirmDelete(person: Person): void {
    this.confirmationService.confirm({
      message: `¿Seguro que deseas eliminar a "${person.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => this.deletePerson(person.id),
    });
  }

  deletePerson(id: number): void {
    this.personService.delete(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: 'Persona eliminada correctamente',
        });
        this.loadPersons();
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar',
        });
      },
    });
  }
}
