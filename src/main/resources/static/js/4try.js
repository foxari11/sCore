import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import {Map, View} from 'ol/index.js';
import {applyBackground, applyStyle} from 'ol-mapbox-style';
import {createXYZ} from 'ol/tilegrid.js';

const url = 'http://xdworld.vworld.kr:8080/2d/Base/201802/{z}/{x}/{y}.png';

// Match the server resolutions
const tileGrid = createXYZ({
    extent: [-180, -90, 180, 90],
    tileSize: 512,
    maxResolution: 180 / 512,
    maxZoom: 13,
});

const layer = new VectorTileLayer({
    declutter: true,
    source: new VectorTileSource({
        projection: 'EPSG:4326',
        tileGrid: tileGrid,
    }),
});
applyStyle(layer, url, '', {resolutions: tileGrid.getResolutions()});
applyBackground(layer, url);

const map = new Map({
    target: 'map',
    layers: [layer],
    view: new View({
        projection: 'EPSG:4326',
        zoom: 0,
        center: [0, 30],
    }),
});