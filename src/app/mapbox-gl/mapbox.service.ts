
import { Injectable } from '@angular/core';
import { IMapboxLocation, IMapboxMarker } from '../interfaces';

@Injectable({ providedIn: 'root'}) export class MapboxService {
    private  _Public_TOKEN = 'pk.eyJ1IjoiZnJvbnQta2FycCIsImEiOiJjbTJnbWQwOGQwMzl1MmtzZ2k1YmYwdzF0In0.JUG2IY5Iondl4R7lUzumxQ';
    public get Public_TOKEN() { return this._Public_TOKEN }
    public set Public_TOKEN(token) { this._Public_TOKEN = token; }

    private _locations: IMapboxLocation[] = [
        { name: 'lisbon', label: 'Lisbon', initialZoom: 15, coords: [ -9.13375953828801, 38.71596224520072 ]},
        { name: 'manhattan', label: 'New York', initialZoom: 15.5, coords: [ -74.0066, 40.7135 ]},
        { name: 'sanjose', label: 'California', initialZoom: 6, coords: [ -121.89934412154716, 37.3323119983157 ], layers: ['quakes', 'polygons']},
        { name: 'tabuk', label: 'Tabuk (S.Arabia)', initialZoom: 10, coords: [ 36.60157535807713, 28.570822845044518 ], layers: ['polygons', 'lines']},
    ]
    public get locations() { return this._locations}
    
    private _zoomLevels = [
        { zoom: 15, scale: 'Buildings (with 3D)'},
        { zoom: 12, scale: 'District'},
        { zoom: 10, scale: 'Cities/towns'},
        { zoom: 6, scale: 'States'},
      ];
    public get zoomLevels() { return this._zoomLevels}

    public initialMarkers: IMapboxMarker[] = [{
            "name": "Commercial Square",
            "location": "lisbon",
            "coords": [ -9.13642757293934, 38.707348250968295]
        },
        {
            "name": "Cool roof-bar",
            "location": "lisbon",
            "coords": [-9.178643690449377, 38.70198326313405]
        }
    ]

    private _projections = [
        { name: 'mercator'},
        { name: 'equirectangular'},
        { name: 'equalEarth'},
        { name: 'naturalEarth'}
    ]
    public get projections() { return this._projections}

    getLocation(location: string): IMapboxLocation {
        return this._locations.find(l => l.name === location) || this._locations[0];
    }

    getProjection(name: string) {
        return this._projections.find(pr => pr.name === name) || this._projections[0];
    }
}

export enum ProjectionLabels {
    mercator = 'Mercator (basic)',
    equirectangular = 'Equirectangular',
    equalEarth = 'Equal Earth',
    naturalEarth = 'Natural Earth'
}

export enum CommonMapStyles {
    streets9 = 'mapbox://styles/mapbox/streets-v9',
    light10 = 'mapbox://styles/mapbox/light-v10',
}

export const Default3DbuildingsConfig = {
    'fill-extrusion-color': '#999',
    'fill-extrusion-height': [
      'interpolate',
      ['linear'],
      ['zoom'],
      15,
      0,
      15.05,
      ['get', 'height']
    ],
    'fill-extrusion-base': [
      'interpolate',
      ['linear'],
      ['zoom'],
      15,
      0,
      15.05,
      ['get', 'min_height']
    ],
    'fill-extrusion-opacity': 0.7
}

