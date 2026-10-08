import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
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

// Validador asíncrono: código duplicado
export function codigoDuplicadoValidator(clienteService: ClienteService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        if (!control.value) {
            return of(null);
        }
        return clienteService.verificarCodigo(control.value).pipe(
            map(existe => (existe ? { codigoDuplicado: true } : null)),
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

    constructor(private clienteService: ClienteService, private router: Router) { }

    ngOnInit(): void {
        this.formulario = new FormGroup({
            codigo: new FormControl('', [Validators.required, validarFormatoCodigo()], [codigoDuplicadoValidator(this.clienteService)]),
            nombre: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]),
            apellido: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]),
            email: new FormControl('', [Validators.required, Validators.email, validarCorreoUnicauca()])
        });
    }

    public crearCliente() {
        console.log("Creando cliente");
        const cliente = this.formulario.value;
        this.clienteService.create(cliente).subscribe({
            next: (response) => {
                console.log("Cliente creado exitosamente");
                this.router.navigate(['clientes/listarClientes']);
                Swal.fire('Nuevo cliente', `Cliente ${response.nombre} creado con éxito!`, 'success');
            },
            error: (err) => {
                console.error('Error al crear cliente:', err.message);
            }
        });
    }
}