//  -------------  ANGULAR FEATURES AND FILES ------------ //
import { Component, ElementRef, inject, TemplateRef, ViewChild } from '@angular/core';
import { NgForOf, NgIf, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getMoistureColor, getNDVIColor, highlightFeature, resetHighlight, setInitialStyles, zoomToFeature } from '../utils.js';
//  -------------  ANGULAR MATERIAL ------------ //
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatDialog, MatDialogModule,  MatDialogActions,  MatDialogClose,  MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
//  -------------  LEAFLET LIB AND PLUGINS, JSON ------------ //
import * as L from 'leaflet';
import '../../plugins/SidePanel/leaflet-sidepanel.min.js';// https://github.com/maxwell-ilai/Leaflet.SidePanel/tree/main
import { TerraDraw, TerraDrawCircleMode, TerraDrawFreehandMode, TerraDrawLeafletAdapter, TerraDrawPolygonMode, TerraDrawRectangleMode }
 from 'terra-draw'; // https://github.com/JamesLMilner/terra-draw/tree/main
import tabuk_area_1 from '../../../public/assets/tabuk_area_1.json';
import moistures from '../../../public/assets/moisture_polygons.json';
import ndvis from '../../../public/assets/ndvi_polygons.json';


@Component({
  selector: 'app-leaflet',
  standalone: true,
  templateUrl: './leaflet.component.html',
  styleUrls: ['./leaflet.component.scss'],
  imports: [NgForOf, NgIf, FormsModule, UpperCasePipe,
    MatButtonModule, MatButtonToggleModule, MatIconModule, MatSlideToggleModule, MatInputModule, MatSelectModule, 
    MatDialogModule, MatDialogActions,  MatDialogClose,  MatDialogContent, MatDialogTitle ]
})
export class LeafletComponent {
  @ViewChild('map') mapElement: ElementRef<HTMLElement>;
  @ViewChild('saveDrawnModal') saveDrawnModal: TemplateRef<any> | undefined;
  readonly dialog = inject(MatDialog);

  map: L.Map = null;
  panelRight: any;
  config = {
    TabukAreaCoords: [28.570822845044518, 36.60157535807713],
    gradientLegendPosition: 'bottomright',
    hoverDelayMs: '1200',
    hoverBorderWidth: 6,
    basicZoom: 19,
    secondaryZoom: 16,
    default_gray: '#BBB',
    defaultFillOpacity: 0.6,
    drawFigures: [],
    activeDrawTool: '',
    activeDrawName: '',
    activeDrawColor: '',
    currentDrawObj: { newLayerName: '', features: [] },
    saveNewDrawColors: ['green', 'yellow', 'brown', 'red', 'violet'],
    isDrawingLayer: false,
    customDrawsCounter: 1
  }
  ////           Layers, Groups, Controls
  osm: L.TileLayer = {};
  osmHOT: L.TileLayer = {};
  moisture_layer: L.LayerGroup;
  ndvi_layer: L.LayerGroup;
  markers: L.LayerGroup = {};
  layerControl: L.Control;
  CurrentObjectDetails: L.Control;
  //            draw properties (terra-draw plugin)
  draw: TerraDraw;
  isDrawing = false;
  customPolyline: any;

  
  ngAfterViewInit() {
    this.createLayers();
    this.addMarkers();
    this.importPolygonsFromGeoJSONs();
    this.setupMap();
    this.addControls();
    this.generateLegends();
    this.createSidePanel(); 
  }


  createLayers() {
    this.osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: this.config.basicZoom,
      attribution: 'Tiles style by Humanitarian OpenStreetMap Team'
    });
    this.osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: this.config.basicZoom,
      attribution: '© OpenStreetMap'
    });
  }

  addMarkers() {
    const stpicon = L.icon({
      iconUrl: 'assets/stp.png',
      iconSize: [30, 30],
    });
    const dumbicon = L.icon({
      iconUrl: 'assets/dam.png',
      iconSize: [30, 30],
    });
    const lakeicon = L.icon({
      iconUrl: 'assets/lake.png',
      iconSize: [40, 40],
    });

    const STPMarker = L.marker([28.571257737307036, 36.621866331130065], { icon: stpicon })
      .bindPopup('This is Tabuk S.T.P.');
    const DambMarker = L.marker([28.58017749612219, 36.61606217775113], { icon: dumbicon })
      .bindPopup('This is lake dum');
    const LakeMarker = L.marker([28.597232703329773, 36.592995070867545], { icon: lakeicon })
      .bindPopup('<h3>Tabuk wetland (lake)</h3><img src="assets/tabuk_wetland.png" style="width: 300px"/>');
  
    this.markers = L.layerGroup([STPMarker, DambMarker, LakeMarker]);
  }

  importPolygonsFromGeoJSONs() {
     // eject coordinates of moisture polygons from Geojson and assign to layerGroup
     let moistureCoords = [];
     moistures.forEach(feature => {
       moistureCoords.push(feature.geometry.coordinates[0].map(coord => coord.reverse()))
     })
     const moisture_polygons = moistureCoords.map((coords, index) =>
       L.polygon(coords, {
         fillOpacity: this.config.defaultFillOpacity,
         weight: 1,
         color: this.config.default_gray,
         fillColor: getMoistureColor(moistures[index].properties['moisture_index']) || this.config.default_gray
       }).bindPopup('Moisture index = ' + moistures[index].properties['moisture_index'] + '<br> Area id: ' + moistures[index].id));
     this.moisture_layer = L.layerGroup(moisture_polygons);
 
     // eject coordinates of NDVI polygons from Geojson and assign to layerGroup
     let ndviCoords = [];
     ndvis.forEach(feature => {
       ndviCoords.push(feature.geometry.coordinates[0].map(coord => coord.reverse()));
     })
 
     const ndvi_polygons = ndviCoords.map((coords, index) =>
       L.polygon(coords, {
         fillOpacity: this.config.defaultFillOpacity,
         weight: 1,
         color: this.config.default_gray,
         fillColor: getNDVIColor(ndvis[index].properties['ndvi']) || this.config.default_gray
       }).bindPopup('NDVI index = ' + ndvis[index].properties['ndvi'] + '<br> EVI: ' + ndvis[index].properties['evi'] + '<br> Area id: ' + ndvis[index].id));
     this.ndvi_layer = L.layerGroup(ndvi_polygons);
  }

  setupMap() {
    this.map = L.map('map', {
      layers: [
        this.osm,
        this.markers,
        this.ndvi_layer,
        this.moisture_layer]
    }).setView(this.config.TabukAreaCoords, 11);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: this.config.basicZoom,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    this.osmHOT.addTo(this.map);  //detailed map from humanitarian france team
    
  // Append Tabuk (lines) and other objects
   L.geoJson(tabuk_area_1, {
      onEachFeature: this.onEachLinesFeature.bind(this)
    }).eachLayer(function (layer) {
      layer.bindPopup(layer.feature.properties.name);
    })
    .addTo(this.map);
    console.log('--- The Map using Leaflet is Created! ----', this.map);
  }

  addControls() {
    const baseMaps = {
      "OpenStreetMap Detailed": this.osmHOT,
      "OpenStreetMap Basic": this.osm,
    };
    const overlayMaps = {
      "Moisture indexes": this.moisture_layer,
      "NDVI zones": this.ndvi_layer,
      "Markers": this.markers
    };
    this.layerControl = L.control.layers(baseMaps, overlayMaps).addTo(this.map);

    const openTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: this.config.basicZoom,
      attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
    });
    this.layerControl.addBaseLayer(openTopoMap, "Topographic Map");
    this.layerControl.expand();
    // show the scale bar on the lower left corner
    L.control.scale({imperial: false, metric: true, maxWidth: 200}).addTo(this.map);
  }

  generateLegends() {
    const ColorsLegend = L.control({position: this.config.gradientLegendPosition});
    ColorsLegend.onAdd = function () {
      var div = L.DomUtil.create('div', 'legend info'),
        grades = [40, 20, '0', -20, -40, -60];
      // loop through intervals and generate a label with a colored square for each interval
      div.innerHTML = '<h4>MOISTURE</h4>';
      for (var i = 0; i < grades.length-1; i++) {
        div.innerHTML +=
          '<i style="background:' + (getMoistureColor(+grades[i]) || this.config.default_gray) + '"></i> ' +
          grades[i+1] + ' .. ' + grades[i] + '<br>';
      }
      const gradesndvi = [1, 0.5, '0', -0.5, -1];
      div.innerHTML += `<br><h4>NDVI INDEXES</h4>`;
      for (var i = 0; i < gradesndvi.length-1; i++) {
        div.innerHTML +=
          '<i style="background:' + getNDVIColor(+gradesndvi[i]) + '"></i> ' +
          gradesndvi[i+1] + ' .. ' + gradesndvi[i] + '<br>';
      }
      div.innerHTML += `<br><span>Main roads</span><br>
      <hr style="border: 2px solid rgb(51, 136, 255);">`;
      return div;
    };

    this.CurrentObjectDetails = L.control({position: 'topright'});
    this.CurrentObjectDetails.onAdd = function () {
      var div = L.DomUtil.create('div', 'legend info');
      div.innerHTML = `<h4>Current object info</h4>
      <div style="width: 140px;">
      </div>`;
      return div;
    };

    ColorsLegend.addTo(this.map);
    this.CurrentObjectDetails.addTo(this.map);
  }

  createSidePanel() {
    this.panelRight = L.control.sidepanel('panelID', {
      panelPosition: 'left',
      hasTabs: true,
      tabsPosition: 'top',
      pushControls: true,
      darkMode: false,
      startTab: 'tab-1'
    }).addTo(this.map);
  }

    // ---------------------------- START OF terra-draw HANDLERS ------------------------- //
    addToolbarDraw() {
      const adapter = new TerraDrawLeafletAdapter({ map: this.map, lib: L });
      const modes = [new TerraDrawPolygonMode(), new TerraDrawRectangleMode(), new TerraDrawCircleMode(), new TerraDrawFreehandMode()];
      this.config.drawFigures = modes.map(el => el['mode']);
  
      this.draw = new TerraDraw({
         adapter: adapter,
         modes: modes 
      });  
    }

    switchEditMode(e) {
      if (e.checked) {      
        this.addToolbarDraw();
        this.mapElement.nativeElement.classList.add('isediting-border')
      }
      else {
        this.draw.stop();
        this.mapElement.nativeElement.classList.remove('isediting-border');
        this.mapElement.nativeElement.style.cursor = 'grab';
      }
    }
  
    startNewLayer() {
      this.draw.start();
      this.config.isDrawingLayer = true;
      this.config.activeDrawTool = this.config.drawFigures[0] || "freehand";
      this.draw.setMode(this.config.activeDrawTool);
      this.config.currentDrawObj = { newLayerName: '', features: [] };
     }
  
    switchDrawTool() { 
      this.draw.setMode(this.config.activeDrawTool || "freehand");
    }
  
    saveEdited() {
      let features = this.draw.getSnapshot();
      const newLayerName = this.config.activeDrawName || `Custom_${this.config.customDrawsCounter}`;
      if (!this.config.activeDrawName) this.config.customDrawsCounter++;
      features.forEach(f => f.properties['name'] = newLayerName);
      this.config.currentDrawObj = { features, newLayerName };
      const ftrs = L.geoJson(features, {
        style: setInitialStyles.bind(this, true),
        onEachFeature: this.onEachDrawnFeature.bind(this)
      }).addTo(this.map);
      this.layerControl.addOverlay(ftrs, newLayerName);
      this.draw.stop();
      this.resetDrawConfig();
      this.layerControl.expand();
      setTimeout(() => {
        this.layerControl.collapse();      
      }, 2300);    
    }
  
    clearEdited() { this.draw.stop();  this.draw.start();  }
  
    openSaveObjectDialog() {
      const dialogRef = this.dialog.open(this.saveDrawnModal);
  
      dialogRef.afterClosed().subscribe(isSaved => {
        if (isSaved) this.saveEdited();
        else  this.draw.stop();
      });
    }

    exportJSONtoFIle() { //todo less like a spike
      const body = {
        "type": "FeatureCollection",
        "features": this.config.currentDrawObj.features
      };
      let dataUri = "data:application/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(body));
      let linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", this.config.currentDrawObj.newLayerName + ".json");
      linkElement.click();  
      this.config.currentDrawObj = { newLayerName: '', features: [] };
    }
  
    resetDrawConfig() {
      this.config.activeDrawTool = '';
      this.config.activeDrawName = '',
      this.config.activeDrawColor = '',
      this.config.isDrawingLayer = false;
    }
  
    setDrawFigureIcon(figure: string): string {
      switch (figure) {
        case 'polygon':
          return 'polyline' 
        case 'freehand':
          return 'draw'
        default:
          return figure
      }
    }  
  
  // ---------------------------- FINISH OF terra-draw HANDLERS ------------------------- //

  onEachDrawnFeature(feature, layer) {
    layer.on({
        mouseover: (e) => highlightFeature.call(this, e),
        mouseout: resetHighlight.bind(this),
        contextmenu: zoomToFeature.bind(this)
    });
  } 

  onEachLinesFeature(feature, layer) {
    layer.on({
        mouseover: (e) => highlightFeature.call(this, e),
        mouseout: resetHighlight.bind(this),
        contextmenu: zoomToFeature.bind(this)
    });
    layer.bindPopup('Name ' + feature?.properties?.name);  
  } 

  currentObjectLegendUpdate(html?: string) {    
    this.CurrentObjectDetails.remove();
    this.CurrentObjectDetails.onAdd = function () {
      var div = L.DomUtil.create('div', 'legend info current');
      div.innerHTML = `<h4>Object properties</h4>`;
      if (html) div.innerHTML += `<div>${html}</div>`;
      return div;
    };
    this.CurrentObjectDetails.addTo(this.map);
  }
}
