const  MEASURE_PROJECTION = 'EPSG:5179';

function calculateLonLat(coords) {
    const transformedCoords = [];
    for (let i = 0; i < coords.length; i++) {
        let lonlat = ol.proj.transform(coords[i], MEASURE_PROJECTION, 'EPSG:4326');
        transformedCoords.push(lonlat);
    }
    return transformedCoords;
}

function createMeasureLayer() {
    const measureLayerSource = new ol.source.Vector();
    const measureLine = new ol.layer.Vector({
        source: measureLayerSource,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33'
                })
            })
        })
    });
    return { measureLayerSource, measureLine };
}

function createDrawInteraction(measureType, measureLayerSource) {
    return new ol.interaction.Draw({
        source: measureLayerSource,
        type: measureType,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: 'rgba(0, 0, 0, 0.5)',
                lineDash: [10, 10],
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.7)'
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.2)'
                })
            })
        })
    });
}

function addInteraction(map, draw) {
    map.addInteraction(draw);
}

function addLayer(map, measureLine) {
    map.addLayer(measureLine);
}

function removeInteraction(map, draw) {
    map.removeInteraction(draw);
}

function removeLayer(map, measureLine) {
    map.removeLayer(measureLine);
}

// 기타 필요한 측정 기능 관련 함수들을 추가할 수 있습니다.

export {
    calculateLonLat,
    createMeasureLayer,
    createDrawInteraction,
    addInteraction,
    addLayer,
    removeInteraction,
    removeLayer
};