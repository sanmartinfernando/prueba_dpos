import { LanguageManagerService } from '../_services/languagemanager.service';
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
      name: 'translate',
      pure: false
    })
    export class TranslatePipe implements PipeTransform {
    
        constructor(private translationService: LanguageManagerService) {

        }
    
      transform(value: string): string {
        return this.translationService.translate(value);
      }
    }