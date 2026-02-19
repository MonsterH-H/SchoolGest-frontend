import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Import locale data for supported languages
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeEn from '@angular/common/locales/en';
import localeAr from '@angular/common/locales/ar';

// Register locale data
registerLocaleData(localeFr, 'fr');
registerLocaleData(localeEn, 'en');
registerLocaleData(localeAr, 'ar');

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
