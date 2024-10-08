import { Component } from '@angular/core';
import * as Leaflet from 'leaflet';
import tabuk_area_1 from '../../../public/assets/tabuk_area_1.json';
import moistures from '../../../public/assets/moisture_polygons.json';
import ndvis from '../../../public/assets/ndvi_polygons.json';

const TabukAreaCoords = [28.570822845044518, 36.60157535807713];

@Component({
  selector: 'app-leaflet',
  standalone: true,
  templateUrl: './leaflet.component.html',
  styleUrls: ['./leaflet.component.scss']
})
export class LeafletComponent {

  map: any = null;
  ////  Layers, Groups /////
  osm = {};
  osmHOT = {};
  markers = {};
  moisture_layer: Leaflet.LayerGroup;
  ndvi_layer: Leaflet.LayerGroup;

  ngAfterViewInit() {
    this.addLayers();
    this.createMap();
    this.addControls();
    this.generateLegends();
  }

  addLayers() {    
    this.osm = Leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    });
    this.osmHOT = Leaflet.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
    });
    
    const STPMarker = Leaflet.marker([28.571257737307036, 36.621866331130065]).bindPopup('This is Tabuk S.T.P.');
    const DambMarker = Leaflet.marker([28.58017749612219, 36.61606217775113]).bindPopup('This is Damb');
    this.markers = Leaflet.layerGroup([STPMarker, DambMarker]);

    // eject coordinates of moisture polygons from Geojson and assign to layerGroup
    let moistureCoords = [];
    moistures.forEach(feature => {
      moistureCoords.push(feature.geometry.coordinates[0].map(coord => coord.reverse()))
    })
    const moisture_polygons = moistureCoords.map((coords, index) =>
      Leaflet.polygon(coords, {
        fillOpacity: 1,
        weight: 1,
        color: 'gray',
        fillColor: getMoistureColor(moistures[index].properties['moisture_index'])
      }).bindPopup('Moisture index = ' + moistures[index].properties['moisture_index'] + '<br> Area id: ' + moistures[index].id));
    this.moisture_layer = Leaflet.layerGroup(moisture_polygons);

    // eject coordinates of NDVI polygon from Geojson and assign to layerGroup
    let ndviCoords = [];
    ndvis.forEach(feature => {
      ndviCoords.push(feature.geometry.coordinates[0].map(coord => coord.reverse()))
    })
    const NDVI_polygons = ndviCoords.map((coords, index) =>
       Leaflet.polygon(coords, {
        weight: 1,
        color: 'gray',
        fillColor: getNDVIColor(ndvis[index]?.properties?.ndvi) || 'yellow',
        fillOpacity: 1
      }).bindPopup('NDVI: ' + ndvis[index]?.properties?.ndvi));

    this.ndvi_layer = Leaflet.layerGroup(NDVI_polygons);
  }

  addControls() {
    const baseMaps = {
      "OpenStreetMap Basic": this.osm,
      "OpenStreetMap Detailed": this.osmHOT,
    };
    const overlayMaps = {
      "Moisture indexes": this.moisture_layer,
      "NDVI zones": this.ndvi_layer,
      "Markers": this.markers
    };
    const layerControl = Leaflet.control.layers(baseMaps, overlayMaps).addTo(this.map);

    const openTopoMap = Leaflet.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
    });
    layerControl.addBaseLayer(openTopoMap, "Topographic Map");
  }

  generateLegends() {
    const MoistureColorsLegend = Leaflet.control({position: 'topleft'});
    MoistureColorsLegend.onAdd = function () {
      var div = Leaflet.DomUtil.create('div', 'legend info'),
        grades = [40, 20, '0', -20, -40, -60];
      // loop through intervals and generate a label with a colored square for each interval
      div.innerHTML = '<h4>MOISTURE INDEXES</h4>';
      for (var i = 0; i < grades.length-1; i++) {
        div.innerHTML +=
          '<i style="background:' + getMoistureColor(+grades[i]) + '"></i> ' +
          grades[i+1] + ' .. ' + grades[i] + '<br>';
      }
      div.innerHTML += `<br><span>Main roads</span><br>
      <hr style="border: 2px solid rgb(51, 136, 255);">`;
      return div;
    };
    const MoistureTable = Leaflet.control({position: 'bottomleft'});
    MoistureTable.onAdd = function () {
      var div = Leaflet.DomUtil.create('div', 'legend info');
      div.innerHTML = `<h4>Moisture Indexes</h4>
      <div style="width: 210px;">
        <img src="assets/moisture_index_range.png" style="width: 100%;"/>
      </div>`;
      return div;
    };

    const NDVIColorsLegend = Leaflet.control({position: 'bottomright'});
    NDVIColorsLegend.onAdd = function () {
      var div = Leaflet.DomUtil.create('div', 'legend info'),
        grades = [1, 0.5, '0', -0.5, -1];
      div.innerHTML = '<h4>NDVI INDEXES</h4>';
      for (var i = 0; i < grades.length-1; i++) {
        div.innerHTML +=
          '<i style="background:' + getNDVIColor(+grades[i]) + '"></i> ' +
          grades[i+1] + ' .. ' + grades[i] + '<br>';
      }
      return div;
    };

    MoistureColorsLegend.addTo(this.map);
    MoistureTable.addTo(this.map);
    NDVIColorsLegend.addTo(this.map);
  }

  createMap() {
    this.map = Leaflet.map('map', {
      layers: [this.osm, this.markers, this.ndvi_layer, this.moisture_layer]
    }).setView(TabukAreaCoords, 14);
    Leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(this.map);

    Leaflet.geoJson(tabuk_area_1).addTo(this.map);
    console.log('------------- The Map using Leaflet is Created!', this.map)
  }
}
///// ------------------  COMPONENT CLASS BOUNDARY ---------------//


// ---------------------   STYLING   ----------------//

//green palette
function getMoistureColor(d) {
  return d > 20 ? '#607c3c' :
         d > 0  ? '#809c13' :
         d > -20  ? '#abc32f' :
         d > -40  ? '#b5e550' :
         d > -60   ? '#ececa3' :         
                    '#f3f6f4';
}
//orange palette
function getNDVIColor(d) {
  return d > 0.5 ? '#FF6200' :
         d > 0  ? '#FD7F2C' :
         d > -0.5  ? '#FD9346' :
        '#FDB777';
}

// ---------------------   INTERACTIVITY, HANDLERS todo feature versions  ----------------//
function highlightFeature(e: any, feature?: any) {
  var layer = e.target;
  layer.setStyle({
      weight: 4,
      color: '#666',
      dashArray: '',
  });
  if (feature) layer.bindPopup('Moisture index: ' + feature.properties.moisture_index);
  layer.bringToFront();
}
