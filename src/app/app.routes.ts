import { Routes } from '@angular/router';
import { FormComponent } from './clientes/crearClientes/form';
import { ClientesComponent } from './clientes/listarClientes/listarClientes';

export const routes: Routes = [
  { path: '', redirectTo: '/clientes/listarClientes', pathMatch: 'full' },
  { path: 'clientes/listarClientes', component: ClientesComponent },
  { path: 'cliente/crearClientes', component: FormComponent },
  { path: 'cliente/editarClientes/:id', component: FormComponent }   // ← nueva
];