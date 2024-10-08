import { Component } from '@angular/core';
import { LeafletComponent } from './leaflet/leaflet.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LeafletComponent],
  template: `
    <app-leaflet/>
  `,
  styles: [],
})
export class AppComponent {
}
