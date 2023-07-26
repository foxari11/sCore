export function createMap(targetElement) {
    const map = new ol.Map({
        target: targetElement,
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM(),
            }),
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([0, 0]),
            zoom: 2,
        }),
    });

    return map;
}
export function setMapCenter(mapView, lonlat) {
    const center = ol.proj.fromLonLat(lonlat, "EPSG:5179");
    mapView.getView().animate({ center: center });
}