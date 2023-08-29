

var sketch;
var measureTooltipElement;
var measureTooltip;
let tooltipCoord;
// 클릭한 점들을 저장할 배열
var clickedPoints = [];
var blueMarkerLayer;
// 지도 생성 함수
export function createMap(targetElement) {
    const map = new ol.Map({
        target: targetElement,
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([0, 0]),
            zoom: 2
        })
    });

    return map;
}

// 브이월드 타일레이어 URL 설정
var source = new ol.source.XYZ({
    url: 'http://xdworld.vworld.kr:8080/2d/Base/201802/{z}/{x}/{y}.png'
});
// 타일레이어 생성하기
var viewLayer = new ol.layer.Tile({
    source: source,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'red', // 빨간색으로 채우는 색상 설정
        }),
        stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0, 0)', // 투명한 색상으로 설정
            lineDash: [10, 10],
            width: 0, // 선 두께 0으로 설정
        }),
    }),
});

// 위치는 우리나라 중앙
var view = new ol.View({
    center: [14248656.389982047, 4331624.063626864],
    zoom: 7,
});

// 빈 객체 생성
var polySource = new ol.source.Vector();
var polyVector = new ol.layer.Vector({
    source: polySource
});

var lineSource = new ol.source.Vector();
var lineVector = new ol.layer.Vector({
    source: lineSource
});

var pointSource = new ol.source.Vector();
var pointVector = new ol.layer.Vector({ source: pointSource });

// 지도 생성
var mapView = new ol.Map({
    target: "map", // 지도를 생성할 element 객체의 id 값
    layers: [viewLayer, polyVector, lineVector, pointVector], // 생성한 레이어 추가
    view: view, // view 설정
});


// 클릭한 점들을 저장할 배열
var clickedPoints = [];
var blueMarkerLayer;

// 측정 기능 시작 함수
export function Start_mapMeasurement(type) {
    var draw = new ol.interaction.Draw({
        source: type === 'Polygon' ? polySource : (type === 'LineString' ? lineSource : pointSource),
        type: type,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'red', // 점의 색상을 빨간색으로 설정
            }),
            stroke: new ol.style.Stroke({
                color: 'red', // 점의 테두리 색상을 빨간색으로 설정
                width: 2,
            }),
            image: new ol.style.Circle({
                radius: 10,
            }),
        }),
    });

    mapView.addInteraction(draw);
    createMeasureTooltip();

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
        createMeasureTooltip();
        ol.Observable.unByKey(listener);
    });
}

// 측정 기능 종료 함수
export function End_mapMeasurement() {
    // 그리기 인터랙션 제거
    mapView.getInteractions().forEach(function (interaction) {
        if (interaction instanceof ol.interaction.Draw) {
            mapView.removeInteraction(interaction);
        }
    });

    // 측정 툴팁 제거
    mapView.getOverlays().forEach(function (overlay) {
        if (overlay === measureTooltip) {
            mapView.removeOverlay(measureTooltip);
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

// 좌표를 클릭하여 위도, 경도를 출력하는 함수
export function searchLonLat(mapView) {
    mapView.on('click', function (e) {
        var coordinate = e.coordinate;
        console.log('클릭 좌표:', ol.proj.toLonLat(coordinate));
        SetCenter(e);
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

export function Rotations(angle) {
    mapView.getView().setRotation(angle);
    console.log(angle + "도로 각도 변경");
}
export function Zoom(zno){mapView.getView().setZoom(zno);/*console.log(zno+" 으로 줌 변경");*/} /* 준변경 */

export function CodebyTime(){var t = new Date();return t.getFullYear()+"-"+(Number(t.getMonth())+1)+"-"+t.getDate()+" "+t.getHours()+":"+t.getMinutes()+":"+t.getSeconds();} /* 현재시간 호출용 */

export function SetCenter(lonlat) {
    var center = ol.proj.fromLonLat(lonlat, 'EPSG:5179');
    view.animate({ center: center });
}




