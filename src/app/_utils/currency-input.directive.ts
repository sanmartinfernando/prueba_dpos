import { Directive, ElementRef, HostListener, Renderer2, LOCALE_ID, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';

/**
 * @class CurrencyInputDirective
 * @description
 * Directiva que permite formatear un input de tipo texto como campo de moneda.
 * Funcionalidades:
 * - Mientras se escribe, solo permite dígitos y guarda el valor en céntimos en el FormControl.
 * - Al enfocar, muestra el valor en euros con 2 decimales para edición (sin símbolo).
 * - Al perder foco, formatea el valor como euros con símbolo (€) y 2 decimales.
 */
@Directive({
  selector: '[appCurrencyInput]',
  providers: [CurrencyPipe]
})
export class CurrencyInputDirective {

  private input: HTMLInputElement;

  private ngControl = inject(NgControl);
  private renderer = inject(Renderer2);
  private currency = inject(CurrencyPipe);
  private elRef = inject(ElementRef<HTMLInputElement>);
  private locale = inject(LOCALE_ID);

  constructor() {
    this.input = this.elRef.nativeElement;
  }

  /**
   * Evento que se dispara mientras el usuario escribe en el input.
   * Convierte el valor introducido a dígitos únicamente y lo guarda
   * en el FormControl como céntimos.
   * 
   * @param event Evento input del input HTML
   */
  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const raw = (event.target as HTMLInputElement).value;
    const digitsOnly = raw.replace(/\D+/g, '');
    const cents = digitsOnly ? parseInt(digitsOnly, 10) : null;

    this.ngControl.control?.setValue(cents, {
      emitEvent: true,
      emitModelToViewChange: false
    });
  }

  /**
   * Evento que se dispara al enfocar el input.
   * Muestra el valor del FormControl en euros con 2 decimales,
   * sin el símbolo de moneda, para permitir la edición.
   */
  @HostListener('focus')
  onFocus() {
    const cents: number | null = this.ngControl.value;
    if (typeof cents === 'number') {
      const euros = cents / 100;
      this.renderer.setProperty(this.input, 'value', euros.toFixed(2).replace('.', ','));
    } else {
      this.renderer.setProperty(this.input, 'value', '');
    }
  }

  /**
   * Evento que se dispara al perder foco el input.
   * Formatea el valor del FormControl como euros con símbolo (€)
   * y 2 decimales para mostrarlo al usuario.
   */
  @HostListener('blur')
  onBlur() {
    const cents: number | null = this.ngControl.value;
    if (typeof cents === 'number') {
      const euros = cents / 100;
      const formatted =
        this.currency.transform(euros, 'EUR', 'symbol', '1.2-2', this.locale) ?? '';
      this.renderer.setProperty(this.input, 'value', formatted);
    } else {
      this.renderer.setProperty(this.input, 'value', '');
    }
  }
}
