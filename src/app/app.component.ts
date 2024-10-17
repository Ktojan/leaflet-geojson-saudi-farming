import { Component } from '@angular/core';
import { LeafletComponent } from './leaflet/leaflet.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LeafletComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
}
