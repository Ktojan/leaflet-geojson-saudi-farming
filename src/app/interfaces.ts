export interface INDVIproperties {
    id: string
    ndvi: number,
    evi?: number,
}

export const blankINDVIproperties = {
    id: '',
    ndvi: null,
    evi: null,
}
