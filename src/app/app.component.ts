import { Component } from '@angular/core';
import { LeafletComponent } from './leaflet/leaflet.component';
import { MapboxGlComponent } from './mapbox-gl/mapbox-gl.component';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgForOf, LeafletComponent, MapboxGlComponent, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  links = [{
    link: 'leaflet',
    label: 'Leaflet (S.Arabia)'
  },
  {
    link: 'mapboxgl',
    label: 'Mapbox-GL'
  },
]
}
