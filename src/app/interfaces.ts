export interface INDVIproperties {
    id: string
    ndvi: number,
    evi?: number,
}

export interface IMapboxLocation {
    name: string,
    label: string,
    initialZoom: number,
    coords: number[],
    layers?: string[]

}
export interface IMapboxMarker {
    name: string,
    coords: number[],
    location?: string,
}

interface IGeojsonData {
    type: "FeatureCollection",
    features: any[]
}

export interface IMapboxGeojson {
    type: 'geojson',
    data: IGeojsonData
}

//------- CONSTANTS --------- //

export const blankINDVIproperties = {
    id: '',
    ndvi: null,
    evi: null,
}

export const BlankGeojson: IMapboxGeojson = {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: []
    }
}
