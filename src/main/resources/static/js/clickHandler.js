import {calculateDistance} from "./measurement.js";
// 변수 초기화
// blueMarkerLayer 변수 정의
var blueMarkerLayer;

var clickedPoints = [];
export function searchLonLat(mapView) {
    mapView.on('click', function (e) {
        var coordinate = e.coordinate;
        console.log('클릭 좌표:', ol.proj.toLonLat(coordinate));

        // 클릭한 점들을 배열에 추가
        clickedPoints.push(coordinate);

        // 첫 번째 점 클릭 시, 해당 위치에 점 표시
        if (clickedPoints.length === 1) {
            var markerFeature = new ol.Feature({
                geometry: new ol.geom.Point(coordinate)
            });
            var markerSource = new ol.source.Vector({
                features: [markerFeature],
                wrapX: false
            });
            blueMarkerLayer = new ol.layer.Vector({
                source: markerSource,
                style: new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 6,
                        fill: new ol.style.Fill({
                            color: 'blue'
                        }),
                        stroke: new ol.style.Stroke({
                            color: 'white',
                            width: 2
                        })
                    })
                })
            });
            mapView.addLayer(blueMarkerLayer);
        }

        // 두 점이 모두 클릭되면 거리를 계산하여 출력
        if (clickedPoints.length === 2) {
            var point1 = ol.proj.toLonLat(clickedPoints[0]);
            var point2 = ol.proj.toLonLat(clickedPoints[1]);

            var distance = calculateDistance(point1, point2);
            console.log('두 점 사이의 거리:', distance.toFixed(2), 'km');

            // 클릭한 점 배열 초기화
            clickedPoints = [];

            // 기존에 표시한 점 레이어 제거
            mapView.getLayers().forEach(function (layer) {
                if (layer === blueMarkerLayer) {
                    mapView.removeLayer(layer);
                }
            });
        }
    });
}
