// measurement.js - 측정 관련 함수 모듈
var sketch;
var measureTooltipElement;
var measureTooltip;
let tooltipCoord;

const polySource = new ol.source.Vector();
const polyVector = new ol.layer.Vector({
    source: polySource,
});

const lineSource = new ol.source.Vector();
const lineVector = new ol.layer.Vector({
    source: lineSource,
});


const pointSource = new ol.source.Vector();
const pointVector = new ol.layer.Vector({ source: pointSource });
// 측정 기능 시작
export function startMapMeasurement(mapView, type) {
    var draw = new ol.interaction.Draw({
        source: type === 'Polygon' ? polySource : (type === 'LineString' ? lineSource : pointSource),
        type: type, // <-- Check the spelling here, it should be "LineString"
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'red',
            }),
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 2,
            }),
            image: new ol.style.Circle({
                radius: 10,
            }),
        }),
    });

    mapView.addInteraction(draw);
    createMeasureTooltip(mapView);

    var listener;
    draw.on('drawstart', function (evt) {
        sketch = evt.feature;

        listener = sketch.getGeometry().on('change', function (evt) {
            var geom = evt.target;
            var output;
            if (type === 'Polygon') {
                output = formatArea(geom);
                tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (type === 'LineString') {
                output = formatLength(geom);
                tooltipCoord = geom.getLastCoordinate();
            } else if (type === 'Point') {
                output = formatPoint(geom);
                tooltipCoord = geom.getCoordinates();
            }

            measureTooltipElement.innerHTML = output;
            measureTooltip.setPosition(tooltipCoord);
        });
    });

    draw.on('drawend', function () {
        measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
        measureTooltip.setOffset([0, -7]);

        // 그리기 완료 후 초기화
        sketch = null;
        measureTooltipElement = null;
        createMeasureTooltip(mapView);
        ol.Observable.unByKey(listener);
    });
}

// 측정 기능 종료
export function endMapMeasurement(mapView) {
    // 그리기 인터랙션 제거
    mapView.getInteractions().forEach(function (interaction) {
        if (interaction instanceof ol.interaction.Draw) {
            mapView.removeInteraction(interaction);
        }
    });

    // 측정 툴팁 제거
    mapView.getOverlays().forEach(function (overlay) {
        if (overlay === measureTooltip) {
            mapView.removeOverlay(overlay);
        }
    });

    // 그리기 결과 레이어 제거
    mapView.getLayers().forEach(function (layer) {
        if (layer === MeasureLine) {
            mapView.removeLayer(layer);
        }
    });
}

// 측정 툴팁 생성 함수
// 함수에서 var 대신 let을 사용하여 변수를 재선언하지 않도록 합니다.
function createMeasureTooltip(mapView) {
    // 기존 툴팁 엘리먼트가 있다면 삭제
    if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }

    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';

    measureTooltip = new ol.Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center',
    });

    mapView.addOverlay(measureTooltip);
}



// 면적 측정 함수
function formatArea(polygon) {
    var area = ol.sphere.getArea(polygon);
    var output;
    if (area > 10000) {
        output = (Math.round((area / 1000000) * 100) / 100) + ' ' + 'km<sup>2</sup>';
    } else {
        output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
    }
    return output;
}

// 거리 측정 함수
function formatLength(line) {
    var length = ol.sphere.getLength(line);
    var output;
    if (length > 100) {
        output = (Math.round((length / 1000) * 100) / 100) + ' ' + 'km';
    } else {
        output = (Math.round(length * 100) / 100) + ' ' + 'm';
    }
    return output;
}

// 점 형식 측정 함수
function formatPoint(point) {
    var coords = point.getCoordinates();
    return 'Point: ' + coords[0] + ', ' + coords[1];
}

// 두 점 사이의 거리 계산 함수
export function calculateDistance(point1, point2) {
    var lon1 = point1[0];
    var lat1 = point1[1];
    var lon2 = point2[0];
    var lat2 = point2[1];

    var R = 6371; // 지구 반지름 (단위: km)
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var distance = R * c;

    return distance;
}

// 각도를 라디안으로 변환하는 함수
export function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
