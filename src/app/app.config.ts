import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, Routes } from '@angular/router';
import { LeafletComponent } from './leaflet/leaflet.component';
import { MapboxGlComponent } from './mapbox-gl/mapbox-gl.component';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'mapboxgl',
    pathMatch: 'full',
  },
  {
    path: 'mapboxgl',
    component: MapboxGlComponent
  },
  {
    path: 'leaflet',
    component: LeafletComponent
  },
  {
    path: '**',
    redirectTo: 'leaflet',
    pathMatch: 'full'
  }
];
export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    provideRouter(routes),
    importProvidersFrom(NgxMapboxGLModule)
  ]
};

