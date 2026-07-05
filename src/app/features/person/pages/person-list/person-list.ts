import { Component, OnInit, signal  } from '@angular/core';
import { PrimeImportsModule } from '../../../../prime-imports/prime-imports-module';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PersonService } from '../../../../core/services/person-service';
import { Person } from '../../../../shared/models/person.model';
import { PersonFrom } from '../person-from/person-from';


@Component({
  selector: 'app-person-list',
  standalone: true,
  imports: [
    PrimeImportsModule, 
    PersonFrom
  ],
  templateUrl: './person-list.html',
  styleUrl: './person-list.css',
  providers: [ConfirmationService],
})
export class PersonList implements OnInit {
  persons = signal<Person[]>([]);
  loading = signal<boolean>(false);

  showForm = false;
  selectedPerson: Person | null = null;

  constructor(
    private personService: PersonService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.loadPersons();
  }

  loadPersons(): void {
    this.loading.set(true)
    this.personService.getAll().subscribe({
      next: (data) => {
        this.persons.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.messageService.add({severity: 'error', summary: 'Error', detail: 'No se pudo cargar la lista de personas'});
      }
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
      accept: () => this.deletePerson(person.id)
    });
  }

  deletePerson(id: number): void {
    this.personService.delete(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Persona eliminada correctamente' });
        this.loadPersons();
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' });
      }
    });
  }
}
