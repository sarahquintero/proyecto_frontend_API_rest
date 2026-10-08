import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ClienteService } from '../servicios/cliente';

// Validador síncrono: formato del código (6 dígitos y termina en 456)
export function validarFormatoCodigo(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const valor = control.value;
        if (!valor) return null;
        const valido = /^\d{3}456$/.test(valor);
        return valido ? null : { codigoInvalido: true };
    };
}

// Validador síncrono: correo debe terminar en @unicauca.edu.co
export function validarCorreoUnicauca(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const email = control.value;
        if (!email) return null;
        const dominio = '@unicauca.edu.co';
        return email.endsWith(dominio) ? null : { dominioInvalido: true };
    };
}

// Validador asíncrono: código duplicado (ignora el cliente actual si estamos editando)
export function codigoDuplicadoValidator(clienteService: ClienteService, idActual?: number): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        if (!control.value) {
            return of(null);
        }
        return clienteService.verificarCodigo(control.value).pipe(
            map(existe => {
                // Si existe y NO es el mismo cliente que estamos editando → error
                if (existe && control.value !== control.root.get('codigo')?.value) {
                    return { codigoDuplicado: true };
                }
                return null;
            }),
            catchError(() => of(null))
        );
    };
}

@Component({
    selector: 'app-form',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
    templateUrl: './form.html',
    styleUrl: './form.css'
})
export class FormComponent implements OnInit {

    public formulario!: FormGroup;
    public titulo: String = 'Crear cliente';
    public modoEdicion: boolean = false;
    public codigoOriginal: string = '';

    constructor(
        private clienteService: ClienteService,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) { }

    ngOnInit(): void {
        this.formulario = new FormGroup({
            id: new FormControl(null),
            codigo: new FormControl('', [Validators.required, validarFormatoCodigo()], [codigoDuplicadoValidator(this.clienteService)]),
            nombre: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]),
            apellido: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]),
            email: new FormControl('', [Validators.required, Validators.email, validarCorreoUnicauca()]),
            createAt: new FormControl(null)
        });

        // Detectar si viene un id en la ruta
        this.activatedRoute.params.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.modoEdicion = true;
                this.titulo = 'Editar cliente';
                this.cargarCliente(id);
            }
        });
    }

    cargarCliente(id: number): void {
        this.clienteService.getCliente(id).subscribe({
            next: (cliente) => {
                this.codigoOriginal = cliente.codigo;
                this.formulario.patchValue({
                    id: cliente.id,
                    codigo: cliente.codigo,
                    nombre: cliente.nombre,
                    apellido: cliente.apellido,
                    email: cliente.email,
                    createAt: cliente.createAt
                });
            },
            error: (err) => console.error('Error al cargar cliente:', err)
        });
    }

    public guardarCliente() {
        const cliente = this.formulario.value;

        if (this.modoEdicion) {
            this.clienteService.update(cliente).subscribe({
                next: (response) => {
                    this.router.navigate(['clientes/listarClientes']);
                    Swal.fire('Cliente actualizado', `Cliente ${response.nombre} actualizado con éxito!`, 'success');
                },
                error: (err) => console.error('Error al actualizar cliente:', err.message)
            });
        } else {
            this.clienteService.create(cliente).subscribe({
                next: (response) => {
                    this.router.navigate(['clientes/listarClientes']);
                    Swal.fire('Nuevo cliente', `Cliente ${response.nombre} creado con éxito!`, 'success');
                },
                error: (err) => console.error('Error al crear cliente:', err.message)
            });
        }
    }
}