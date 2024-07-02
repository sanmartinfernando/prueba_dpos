import { HttpClient } from '@angular/common/http';
import { Injectable, EventEmitter } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { LanguageService } from './language.service';

@Injectable({
  providedIn: 'root'
})

export class TranslationSet {
  public languange: string;
  public values: {[key: string]: string} = {};
}

@Injectable()
export class LanguageManagerService {
  // protected baseUrlLang = environment.urlWS + 'language';
  protected baseUrlLang = "https://localhost:44336/api/Languages/GetLanguagesV2";
  private cacheValue = 'a';
  public language = 'en';
  public languages = ['en','es','fr'];
  //public languages = ['es'];

  private dictionary: any = {}
 
  userLang = navigator.language; 

  constructor(private languageService: LanguageService,private titleService: Title) { 
    this.GetLanguagesDictionaryWithCache('');
  }
  SetLanguageDefault(){
    var userLangAux = this.userLang;
    if(userLangAux.toLocaleLowerCase().includes('es')){
      this.setLanguage('es-ES');
    }else if (userLangAux.toLocaleLowerCase().includes('en')){
      this.setLanguage('en-GB');
    }else{
      this.setLanguage('es-ES');
    }
  }
  /*GetLanguagesDictionary(){
    this.languageService.GetLanguages().subscribe(
      data => {
        this.cacheValue = data["languagecache"];
        this.GetLanguagesDictionaryWithCache(this.cacheValue);
      },
      (err) => {
        this.GetLanguagesDictionaryWithCache(this.cacheValue);
        console.log (err.message);
      }
    );
  }*/
  GetLanguagesDictionaryWithCache(cache:string){
    this.languageService.GetLanguages().subscribe({
      next: data => {
        this.dictionary = data;	 // FILL THE ARRAY WITH DATA.
        this.SetLanguageDefault();
        console.log(this.dictionary);
      },
      error:(err) => {
        this.SetLanguageDefault();
        this.dictionary={};
        this.dictionary['homeTitle']='ejemplo';
        console.log (err.message);
      }
  });
  }
  setLanguage(lang: any) {

    this.language = lang;
    this.titleService.setTitle(this.translate('homeTitle') );
    this.emitLangChange(lang);
  }
  translate(key: string): string {
    if (this.dictionary!=undefined && this.dictionary[this.language] != null && this.dictionary[this.language][key]!=undefined) {
        return this.dictionary[this.language][key];
    }else{
      //console.log("err_translation_not_found_"+this.language+"-"+key);
        return "."+this.language+"-"+key;
    }
  }
  
  public configObservable = new Subject<string>();
    emitLangChange(val) {
    this.configObservable.next(val);
  }

}