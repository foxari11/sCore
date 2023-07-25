
function Start_mapMeasurement(MesaType){
    MeasNowType = MesaType
    MeasLayerSouce = new ol.source.Vector();
    MeasLayerSouce.on('addfeature', function(evt){
        var feature = evt.feature;
        var coords = feature.getGeometry().getCoordinates();
        var coord = coords;
        if(MesaType == "Polygon"){
            coord = coords[0];
        }

        var lonlat;
        for(var i=0;i<coord.length;i++){
            lonlat = coord[i];
            lonlat = ol.proj.transform(lonlat, 'EPSG:5179', 'EPSG:4326');
            MeasNowlon[i] = lonlat[0];
            MeasNowlat[i] = lonlat[1];
        }
        MeasureMentOut(MeasNowlon,MeasNowlat,MeasNowDist,MeasNowType);
    });

    function MeasureMentOut(lon,lat,output,MesaType){
        var out = "";
        var PointChk = true;
        if(MesaType == "LineString") {
            out += ",,pointdist," + output;
        } else if(MesaType == "Polygon") {
            out += ",,areaSize," + output;
        } else if(MesaType == "Point") {
            PointChk = false;
        }

        if(PointChk){
            var lons="";
            var lats="";
            for(var i=0;i<lon.length;i++){
                lons += lon[i]+'@';
                lats += lat[i]+'@';
            }
            console.log(",,pointdist," +lons+"-"+lats);
        }
    }

    MeasureLine = new ol.layer.Vector({
        source: MeasLayerSouce,
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

    map.addLayer(MeasureLine);

    draw = new ol.interaction.Draw({
        source: MeasLayerSouce,
        type:MesaType,
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
    map.addInteraction(draw);
    createMeasureTooltip();
    createHelpTooltip();

    draw.on('drawstart',
        function(evt) {
            if(MeasNowType != "Point"){
                MeasLayerSouce.clear(true);
            }

            sketch = evt.feature;
            var tooltipCoord = evt.coordinate;
            listener = sketch.getGeometry().on('change', function(evt) {
                var geom = evt.target;
                var output;
                if (geom instanceof ol.geom.Polygon) {
                    output = formatArea(geom);
                    tooltipCoord = geom.getInteriorPoint().getCoordinates();
                    MeasNowDist = output;
                    measureTooltipElement.innerHTML = output;
                    measureTooltip.setPosition(tooltipCoord);
                } else if (geom instanceof ol.geom.LineString) {
                    output = formatLength(geom);
                    tooltipCoord = geom.getLastCoordinate();
                    MeasNowDist = output;
                    measureTooltipElement.innerHTML = output;
                    measureTooltip.setPosition(tooltipCoord);
                }
            });
        }
        , this);
    draw.on('drawend',
        function() {
            measureTooltipElement.className = 'tooltip tooltip-static';
            measureTooltip.setOffset([0, -7]);
            ol.Observable.unByKey(listener);
        }
        , this);
}

function createMeasureTooltip() {
    if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'tooltip tooltip-measure';
    measureTooltip = new ol.Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center'
    });
    map.addOverlay(measureTooltip);
}

function createHelpTooltip() {
    if (helpTooltipElement) {
        helpTooltipElement.parentNode.removeChild(helpTooltipElement);
    }
    helpTooltipElement = document.createElement('div');
    helpTooltipElement.className = 'tooltip hidden';
    helpTooltip = new ol.Overlay({
        element: helpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left'
    });
    map.addOverlay(helpTooltip);
}

function End_mapMeasurement(){
    map.getInteractions().forEach(function (interaction) {
        if(interaction == draw) {
            map.removeInteraction(draw);
        }
    });
    map.getOverlays().forEach(function (interaction) {
        if(interaction == measureTooltip) {
            map.removeOverlay(measureTooltip);
        }
    });
    map.getLayers().forEach(function (interaction) {
        if(interaction == MeasureLine) {
            map.removeLayer(MeasureLine);
        }
    });
}

function DrawLine(){
    pointToggle.value = "line";
    End_mapMeasurement();
    Start_mapMeasurement("LineString");
}

function DrawPolygon(){
    pointToggle.value = "polygon";
    End_mapMeasurement();
    Start_mapMeasurement("Polygon");
}

function DrawPoint(){
    alert(" DrawPoint ");
    pointToggle.value = "point";
    End_mapMeasurement();
    Start_mapMeasurement("Point");
}


function LineDistanceCalc(){
    pointToggle.value = "line_c";
    End_mapMeasurement();
    Start_mapMeasurement("LineString");
}

function AreaSizeCalc(){
    pointToggle.value = "polygon_c";
    End_mapMeasurement();
    Start_mapMeasurement("Polygon");
}

function MapMove(){
    pointToggle.value = "move";
    End_mapMeasurement();
}


// 두 점 사이의 거리 계산 함수
function calculateDistance(point1, point2) {
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
function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

// 지도 생성
var map = new ol.Map({
    target: 'map',
    layers: [
        new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: 'https://xdworld.vworld.kr/2d/midnight/service/{z}/{x}/{y}.png'
            })
        })
    ],
    view: new ol.View({
        center: ol.proj.fromLonLat([126.978275264, 37.566642192]),
        zoom: 7
    })
});

var geojsonObject = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [126.978275264, 37.566642192],
                        [127.000000000, 37.500000000],
                        [127.100000000, 37.550000000],
                        [126.978275264, 37.566642192]
                    ]
                ]
            },
            "properties": {
                // Add properties of the first feature here
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [127.100000000, 37.550000000],
                        [127.150000000, 37.600000000],
                        [127.200000000, 37.580000000],
                        [127.100000000, 37.550000000]
                    ]
                ]
            },
            "properties": {
                // Add properties of the second feature here
            }
        }
    ]
};

var vectorSource = new ol.source.Vector({
    features: new ol.format.GeoJSON().readFeatures(geojsonObject),
    wrapX: false
});

var vectorLayer = new ol.layer.Vector({
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0)',
            width: 2
        }),
        fill: new ol.style.Fill({
            color: 'rgba(255, 0, 0, 0.2)'
        })
    }),
    source: vectorSource,
    name: 'area'
});

// 행정구역 레이어 추가
map.addLayer(vectorLayer);

// 각 행정구역 마우스 오버시 하이라이팅
// 마우스 오버시 스타일 지정
var selectPointerMove = new ol.interaction.Select({
    condition: ol.events.condition.pointerMove,
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'white',
            width: 2
        }),
        fill: new ol.style.Fill({
            color: 'rgba(0, 0, 255, 0.6)'
        })
    })
});

// interaction 추가
map.addInteraction(selectPointerMove);

// 마우스 오버 이벤트 처리
map.on('pointermove', function (e) {
    if (e.dragging) return;
    var coordinate = e.coordinate;
    console.log('마우스 좌표:', ol.proj.toLonLat(coordinate));
});

// 변수 초기화
var clickedPoints = [];

// 마우스 클릭 이벤트 처리 (점 찍기)
// 마우스 클릭 이벤트 처리 (점 찍기)
map.on('click', function (e) {
    var coordinate = e.coordinate;
    console.log('클릭 좌표:', ol.proj.toLonLat(coordinate));

    // 클릭한 위치에 점 표시
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
    map.addLayer(blueMarkerLayer);

    // 클릭한 점들을 배열에 추가
    clickedPoints.push(coordinate);

    // 두 점이 모두 클릭되면 거리를 계산하여 출력
    if (clickedPoints.length === 2) {
        var point1 = ol.proj.toLonLat(clickedPoints[0]);
        var point2 = ol.proj.toLonLat(clickedPoints[1]);

        var distance = calculateDistance(point1, point2);
        console.log('두 점 사이의 거리:', distance.toFixed(2), 'km');

        // 클릭한 점 배열 초기화
        clickedPoints = [];

    }
});

// 파란색 점 레이어를 저장할 전역 변수
var blueMarkerLayer;

function Rotations(angle){map.getView().setRotation(angle);console.log(angle+"도로 각도 변경");}/* 지도 회전 */

function Zoom(zno){map.getView().setZoom(zno);/*console.log(zno+" 으로 줌 변경");*/} /* 준변경 */

function CodebyTime(){var t = new Date();return t.getFullYear()+"-"+(Number(t.getMonth())+1)+"-"+t.getDate()+" "+t.getHours()+":"+t.getMinutes()+":"+t.getSeconds();} /* 현재시간 호출용 */

// 파란색 점 레이어를 삭제하는 함수
// 파란색 점 레이어를 모두 삭제하는 함수

// 파란색 점 레이어를 삭제하는 함수
function RemoveAllBlueMarkers() {
    if (blueMarkerLayer) {
        map.removeLayer(blueMarkerLayer);
        blueMarkerLayer = null;
    }
}

function SetCenter(lon,lat){
    map.getView().setCenter(_4326ToMapProj(lon,lat,'EPSG:5179'));/*console.log(lon+" , "+lat+" 으로 좌표이동");*/
}

function LayerInfo(ChkName, mapObject) {
    var vectorLayer = mapObject.getLayers().getArray();
    var lycnt = vectorLayer.length - 1;
    var i;
    var result = {
        chk: true,
        cnt: lycnt
    };
    for (i = 0; i < vectorLayer.length; i++) {
        if (vectorLayer[i].get('name') == ChkName) {
            result.chk = false;
            break;
        }
    }
    return result;
}

function LayerNoCall(ChkName, mapObject) {
    var vectorLayer = mapObject.getLayers().getArray();
    var i;
    var lyno = -1;
    for (i = 0; i < vectorLayer.length; i++) {
        if (vectorLayer[i].get('name').trim() == ChkName.trim()) {
            lyno = i - 1;
            break;
        }
    }
    return lyno;
}


/*
function formatLength(line) {
    var length;
    var coordinates = line.getCoordinates();
    length = 0;
    var sourceProj = map.getView().getProjection();
    for (var i = 0, ii = coordinates.length - 1; i < ii; ++i) {
        var c1 = ol.proj.transform(coordinates[i], sourceProj, 'EPSG:4326');
        var c2 = ol.proj.transform(coordinates[i + 1], sourceProj, 'EPSG:4326');
        console.log("이게먼데" + c1);
        console.log("야이거봐" + c2);

        length += wgs84Sphere.haversineDistance(c1, c2);
    }
    var output;
    if (length > 100) {
        output = (Math.round(length / 1000 * 100) / 100) +' ' + 'km';
    } else {
        output = (Math.round(length * 100) / 100) +' ' + 'm';
    }
    return output;
};
*/

function formatLength(line) {
    var length = ol.sphere.getLength(line);
    var output;
    if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
    } else {
        output = Math.round(length * 100) / 100 + ' ' + 'm';
    }
    return output;
};


function formatArea(polygon) {
    var area;
    var sourceProj = map.getView().getProjection();
    var geom = (polygon.clone().transform(sourceProj, 'EPSG:4326'));
    var coordinates = geom.getLinearRing(0).getCoordinates();
    area = Math.abs(wgs84Sphere.geodesicArea(coordinates));
    var output;
    if (area > 10000) {
        output = (Math.round(area / 1000000 * 100) / 100) +' ' + 'km<sup>2</sup>';
    } else {
        output = (Math.round(area * 100) / 100) +' ' + 'm<sup>2</sup>';
    }
    return output;
};

function showElement(LyName){
    var lyno = LayerNoCall(LyName);
    if(lyno > -1){
        FeaturesSource[27].ab.change[0].Ch.N.visible = true
        FeaturesSource[27].refresh();
    }
}

// 레이어 삭제
function removeElement(LyName){
    var lyno = LayerNoCall(LyName);
    if(lyno > -1){
        FeaturesSource[lyno].clear(true); /*기존 Features 삭제*/
    }
    if(LyName == "ALL"){
        var i;
        for(i=0;i<FeaturesSource.length;i++){
            FeaturesSource[i].clear(true)
        }
    }

    lyno = SmallLayerNoCall(LyName);
    if(lyno > -1){
        SmallFeaturesSource[lyno].clear(true); /*기존 Features 삭제*/
    }
    if(LyName == "ALL"){
        var i;
        for(i=0;i<SmallFeaturesSource.length;i++){
            SmallFeaturesSource[i].clear(true)
        }
    }
}


