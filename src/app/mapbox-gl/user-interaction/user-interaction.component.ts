import { KeyValuePipe, NgForOf, UpperCasePipe, NgIf } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatAccordion, MatExpansionModule} from '@angular/material/expansion';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatButtonModule} from '@angular/material/button';
import {MatRadioModule} from '@angular/material/radio';
import {MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';

import { MapboxService, ProjectionLabels } from '../mapbox.service';
import { COLOR_SHADES } from '../../utils';
import { IMapboxLocation, IMapboxMarker } from '../../interfaces';

@Component({
  selector: 'app-user-interaction',
  standalone: true,
  imports: [NgForOf, NgIf, FormsModule, ReactiveFormsModule, MatAccordion, MatExpansionModule, MatButtonModule, 
    MatButtonToggleModule, MatRadioModule, UpperCasePipe, KeyValuePipe, MatChipsModule, MatFormFieldModule, MatIconModule, MatSelectModule],
  templateUrl: './user-interaction.component.html',
  styles: `.accordion-content {
  justify-content: space-between;
  align-items: center;

  ::ng-deep.mat-expansion-panel { opacity: 0.8 }
  ::ng-deep.mat-internal-form-field>label { padding-left: 0; padding-right: 12px; }
  ::ng-deep.mat-mdc-form-field { width: 260px; margin-left: 1rem;}
 
  .markers-form-field { width: 100%; }

  #exportjson {opacity: 0.6; padding: 12px; height: 36px;}
}`
})
export class UserInteractionComponent {
  @Input('config') config: any;
  @Input('isFloating') isFloating: boolean = false;
  @Input('customMarkers') customMarkers: IMapboxMarker[];
  @Output() changeMapLocation = new EventEmitter();
  @Output() toggleLayer = new EventEmitter();
  @Output() toggleFloating = new EventEmitter();
  @Output() changeMapTilesStyle = new EventEmitter();
  @Output() updateMarkers = new EventEmitter();
  @Output() exportJSONtoFIle = new EventEmitter();
  @Output() centerToMarker = new EventEmitter();
  @Output() changeProjection = new EventEmitter();

  mapboxService = inject(MapboxService);
  locations: IMapboxLocation[] = this.mapboxService.locations;
  projections = this.mapboxService.projections;
  projectionLabels = ProjectionLabels;
  readonly formControl = new FormControl([]);
  layerId = 'streets';
  colorShades = COLOR_SHADES;
  
  filteredCustomMarkers() {
    if (this.customMarkers && this.customMarkers.length > 0)
      return this.customMarkers.filter(m => m.location === this.config.currentLocation.name);
    else return [];
  }

  removeMarker(name: string) {
    this.updateMarkers.emit(this.customMarkers.filter(marker => marker.name !== name));
  }

  addMarker(event): void {
    const value = (event.value || '').trim();
    if (!value) return;
    event.chipInput!.clear();
    this.customMarkers.push({ name: value, coords: [], location: this.config.currentLocation['name'] || '' });
    this.updateMarkers.emit(this.customMarkers)
  }

  keepOrder(x, y) { return 0 } //hack for keyvalue pipe ordering

}
