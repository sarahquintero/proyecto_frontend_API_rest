import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../servicios/cliente';
import { Cliente } from '../modelos/cliente';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './listarClientes.html',
  styleUrl: './listarClientes.css'
})
export class ClientesComponent implements OnInit {
  public clientes = signal<Cliente[]>([]);

  constructor(private clienteService: ClienteService) { }

  ngOnInit(): void {
    this.clienteService.getClientes().subscribe(
      (clientes) => {
        this.clientes.set(clientes);
      }
    );
  }

  // Ejemplo de método para eliminar cliente usando Swal con confirmación
  public eliminar(cliente: Cliente): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar al cliente ${cliente.nombre} ${cliente.apellido}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Lógica para llamar al servicio y eliminar

        this.clienteService.delete(cliente.id).subscribe(() => {
          this.clientes.set(this.clientes().filter(c => c.id !== cliente.id));
          Swal.fire('Eliminado!', 'El cliente ha sido eliminado.', 'success');
        });

      }
    });
  }
}