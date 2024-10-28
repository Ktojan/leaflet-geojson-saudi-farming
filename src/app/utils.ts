// ---------------------   INTERACTIVITY, HANDLERS todo feature versions  ----------------//

export const COLOR_SHADES = {
    // lightest first
    blue: [
        "#70eafa",
        "#62d3ec",
        "#57bddd",
        "#4ea7cc",
        "#4792bb",
        "#427ca8",
        "#3c6894",
        "#375480",
        "#30416b",
        "#292f56"
    ],
    // darkest first
    violet: [
        '#36175e',
        '#40216a',
        '#4a2b75',
        '#553581',
        '#5f3f8e',
        '#6a4a9a',
        '#7454a6',
        '#7f5fb3',
        '#8a6ac0',
        '#9575cd'
    ],
    green: ['#33691e', '#4f8338', '#6b9d52', '#86b76b', '#a2d185', '#beeb9f'],
    orange: ['#D23600', '#DF5600', '#ED7600', '#FA9600'],
}

export function resetHighlight(e) {
    // this.geoJson.resetStyle(e.target);
    var layer = e.target;
    layer.setStyle({
        weight: 1,
    });
    setTimeout(() => {
        if (layer.options.weight == 1) this.currentObjectLegendUpdate(null)
    },
        this.config.hoverDelayMs);
}

export function highlightFeature(e: any) {
    if (this.isDrawing) return;
    const layer = e.target, props = layer.feature?.properties;
    layer.setStyle({
        weight: this.config.hoverBorderWidth,
    });
    layer.bringToFront();
    setTimeout(() => {
        if (layer.options.weight == this.config.hoverBorderWidth && props) {
            let LegendPropsHTML = '';
            Object.entries(props).forEach(el => LegendPropsHTML += `${el[0]}: ${el[1]}<br>`);
            this.currentObjectLegendUpdate(LegendPropsHTML);
        }
    }, this.config.hoverDelayMs);
}

export function zoomToFeature(e: any) {
    this.map.fitBounds(e.target.getBounds());
}

export function setInitialStyles(feature, isDrawn?: boolean) {
    return {
        fillColor: this.config.activeDrawColor || 'black',
        weight: 3,
        opacity: 1,
        color: this.config.activeDrawColor || 'black',
        fillOpacity: isDrawn ? 0.6 : 0.2
    };
}

//green palette
export function getMoistureColor(d): string {
    const g: string[] = COLOR_SHADES.green;
    return d > 20 ? g[0] :
        d > 0 ? g[1] :
            d > -20 ? g[2] :
                d > -40 ? g[3] :
                    d > -60 ? g[4] :
                        g[5] || '';
}
//orange palette
export function getNDVIColor(d): string {
    const o: string[] = COLOR_SHADES.orange;
    return d > 0.5 ? o[0] :
        d > 0 ? o[1] :
            d > -0.5 ? o[2] :
                o[3] || '';
}
