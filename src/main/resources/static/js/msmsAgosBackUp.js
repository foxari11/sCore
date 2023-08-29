// import { getArea,getDistance } from './ol/sphere.js';
sketch = null; //라인스트링 이벤트 시 geometry객체를 담을 변수
measureTooltipElement = null;//draw 이벤트가 진행 중일 때 담을 거리 값 element

class MapManager {

    constructor(targetElementId) {
        this.targetElement = document.getElementById(targetElementId);
        this.map = new ol.Map({
            target: this.targetElement,
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM({
                        //url: 'https://xdworld.vworld.kr/2d/midnight/service/{z}/{x}/{y}.png'
                    })
                })
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat([126.978275264, 37.566642192]),
                zoom: 7
            })
        });


        // 커스텀 요소를 추가할 Overlay 생성
        this.customOverlayElement  = document.getElementById('customElement');
        this.customOverlay = new ol.Overlay({
            element: this.customOverlayElement ,
            position: ol.proj.fromLonLat([126.978275264, 37.566642192]),
            positioning: 'top-left' // 요소의 중심을 화면의 중심에 맞춤
        });



        // Overlay를 지도에 추가
        this.map.addOverlay(this.customOverlay);

        this.map.on('postrender', () => {
            const mapSize = this.map.getSize(); // 맵의 현재 크기를 가져옵니다.

            // 오버레이의 크기와 위치를 조정합니다.
            this.customOverlayElement.style.width = '120px'; // 고정된 너비
            this.customOverlayElement.style.height = '40px'; // 맵의 높이와 동일한 높이

            // 맵의 현재 범위에서 왼쪽 상단의 좌표를 가져옵니다.
            const extent = this.map.getView().calculateExtent(this.map.getSize());
            const leftTopCoordinate = [extent[0] + 5, extent[3]- 100];

            // 오버레이 위치를 왼쪽 상단 좌표로 설정합니다.
            this.customOverlay.setPosition(leftTopCoordinate);

        });

    }


    handleMapClick(event) {
        const coordinate = event.coordinate;
        this.addBlueMarker(coordinate);
        console.log('클릭 좌표:', ol.proj.toLonLat(coordinate));

        this.clickedPoints.push(coordinate);

        if (this.clickedPoints.length === 2) {
            const point1 = ol.proj.toLonLat(this.clickedPoints[0]);
            const point2 = ol.proj.toLonLat(this.clickedPoints[1]);

            // 좌표값의 유효성을 확인
            if (point1 && point1.length === 2 && point2 && point2.length === 2) {
                const distance = UtilFunctions.calculateDistance(point1, point2);
                console.log('두 점 사이의 거리:', distance.toFixed(2), 'km');
            } else {
                console.log('잘못된 좌표값입니다.');
            }

            // 클릭한 점 배열 초기화
            this.clickedPoints = [];
        }
    }



    formatLength(line) {
        var length = ol.sphere.getLength(line);
        var output;
        if (length > 100) {
            output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
        } else {
            output = Math.round(length * 100) / 100 + ' ' + 'm';
        }

        return output;
    };

    formatArea(polygon) {
        var area;
        var sourceProj = this.map.getView().getProjection(); // 수정된 부분
        var geom = polygon.clone().transform(sourceProj, 'EPSG:4326');
        var coordinates = geom.getLinearRing(0).getCoordinates();
        area = Math.abs(ol.sphere.getArea(coordinates)); // this를 추가하여 wgs84Sphere에 접근합니다.
        var output;
        if (area > 10000) {
            output = (Math.round(area / 1000000 * 100) / 100) + ' ' + 'km<sup>2</sup>';
        } else {
            output = (Math.round(area * 100) / 100) + ' ' + 'm<sup>2</sup>';
        }
        return output;
    }
    addBlueMarker(coord) {
        // 파란색 원 형태의 마커 생성
        const blueMarker = new ol.Feature({
            geometry: new ol.geom.Point(coord),
        });

        blueMarker.setStyle(
            new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 7,
                    fill: new ol.style.Fill({ color: 'blue' }),
                    stroke: new ol.style.Stroke({ color: 'white', width: 2 }),
                }),
            })
        );

        // 파란색 원을 담을 벡터 레이어 생성
        const blueMarkerSource = new ol.source.Vector({ features: [blueMarker] });

        this.blueMarkerLayer = new ol.layer.Vector({
            source: blueMarkerSource,
        });

        // 벡터 레이어를 지도에 추가
        this.map.addLayer(this.blueMarkerLayer);
    }


    addVectorLayer(source, style, name) {
        const vectorLayer = new ol.layer.Vector({
            source: source,
            style: style,
            name: name
        });

        this.map.addLayer(vectorLayer);
    }



    addInteraction(interaction) {
        this.map.addInteraction(interaction);
    }

    removeInteraction(interaction) {
        this.map.getInteractions().forEach(function (int) {
            if (int === interaction) {
                this.map.removeInteraction(int);
            }
        });
    }

    removeLayer(layer) {
        this.map.getLayers().forEach(function (lyr) {
            if (lyr === layer) {
                this.map.removeLayer(lyr);
            }
        });
    }

    startMeasurement(geometryType) {
        // 기존의 인터랙션을 제거합니다.
        this.removeInteraction(this.draw);

        this.draw = new ol.interaction.Draw({
            source: new ol.source.Vector(),
            type: geometryType,
        });

        this.addInteraction(this.draw);
        createMeasureTooltip();

        var listener;
        draw.on('drawstart', function(e) {
            console.log(e)
            sketch = e.feature;
            var tooltipCoord = e.coordinate;

            listener = sketch.getGeometry().on('change', function(evt) {
                var geom = evt.target;
                var output = formatLength(geom);
                tooltipCoord = geom.getLastCoordinate();

                measureTooltipElement.innerHTML = output;
                measureTooltip.setPosition(tooltipCoord);
            })
        })

        draw.on('drawend', function() {
            measureTooltipElement.className = 'ol-tooptip ol-tooltip-static';
            measureTooltip.setOffset([0, -7]);

            //unset sketch
            sketch = null;
            measureTooltipElement = null;
            createMeasureTooltip();
            new ol.Observable(listener)
        })


    }


    setCenter(lon, lat) {
        this.map.getView().setCenter(_4326ToMapProj(lon, lat, 'EPSG:5179'));
    }

    setRotation(angle) {
        this.map.getView().setRotation(angle);
    }

    setZoom(zoomLevel) {
        this.map.getView().setZoom(zoomLevel);
    }

    onPointerMove(callback) {
        this.map.on('pointermove', callback);
    }

    onClick(callback) {
        this.map.on('click', callback);
    }

    removeAllBlueMarkers() {
        if (this.blueMarkerLayer) {
            this.map.removeLayer(this.blueMarkerLayer);
            this.blueMarkerLayer = null;
        }
    }
    End_mapMeasurement() {
        this.map.getInteractions().forEach((interaction) => {
            if (interaction == this.draw) {
                this.map.removeInteraction(this.draw);
            }
        });

        // Overlays와 Layers는 Collection 객체이므로 getArray()를 사용하여 배열로 변환한 후 forEach 사용
        this.map.getOverlays().getArray().forEach((overlay) => {
            if (overlay == this.measureTooltip) {
                this.map.removeOverlay(this.measureTooltip);
            }
        });

        this.map.getLayers().getArray().forEach((layer) => {
            if (layer == this.MeasureLine) {
                this.map.removeLayer(this.MeasureLine);
            }
        });
    }


}

class UtilFunctions {
    constructor(map) {
        this.map = map;
    }

    static calculateDistance(point1, point2) {
        var lon1 = point1[0];
        var lat1 = point1[1];
        var lon2 = point2[0];
        var lat2 = point2[1];

        var R = 6371; // 지구 반지름 (단위: km)
        var dLat = UtilFunctions.deg2rad(lat2 - lat1);
        var dLon = UtilFunctions.deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(UtilFunctions.deg2rad(lat1)) * Math.cos(UtilFunctions.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var distance = R * c;

        return distance;
    }

    static deg2rad(deg) {
        return deg * (Math.PI / 180);
    }

    codeByTime() {
        {var t = new Date();return t.getFullYear()+"-"+(Number(t.getMonth())+1)+"-"+t.getDate()+" "+t.getHours()+":"+t.getMinutes()+":"+t.getSeconds();}
    }


}

// Utility functions
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

// 클래스 인스턴스 생성
const mapManager = new MapManager("map");
const util = new UtilFunctions(mapManager.map); // MapManager 인스턴스의 map을 전달하여 UtilFunctions 인스턴스 생성



// HTML 버튼 이벤트에 맞게 함수 호출
function zoomToLevel(level) {
    mapManager.setZoom(level);
}

function rotate(angle) {
    mapManager.setRotation(angle);
}

function drawPolygon() {
    mapManager.startMeasurement('Polygon');
}

function drawLineString() {
    mapManager.startMeasurement('LineString');
}

function removeAllMarkers() {
    util.removeAllBlueMarkers();
}

function moveToCenter() {
    mapManager.setCenter(130.3, 36);
}

function endMe(){
    mapManager.End_mapMeasurement();
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
    addOverlay(measureTooltip);
}


function handleExcelFile() {
    const excelFileInput = document.getElementById('excelFileInput');

    // 사용자가 선택한 파일을 가져옵니다.
    const selectedFile = excelFileInput.files[0];

    // FileReader 객체를 생성하여 파일을 읽습니다.
    const reader = new FileReader();
    reader.onload = function (event) {
        const fileContent = event.target.result;

        // 엑셀 파일 처리 함수 호출
        processExcelFile(fileContent);
    };

    // 파일을 텍스트로 읽기 시작합니다.
    reader.readAsText(selectedFile);
}

function processExcelFile(fileContent) {
    // 여기에 엑셀 파일 처리 로직을 추가합니다.
    // fileContent는 엑셀 파일의 내용입니다.
    console.log('엑셀 파일 내용:', fileContent);
}

function getFileAndReadCSV() {
    const fileInput = document.getElementById('fileInput');

    // 사용자가 선택한 파일을 가져옵니다.
    const selectedFile = fileInput.files[0];

    // FileReader 객체를 생성하여 파일을 읽습니다.
    const reader = new FileReader();
    reader.onload = function (event) {
        const fileContent = event.target.result;

        // CSV 파일 내용 처리 함수 호출
        readCSVContent(fileContent);
    };

    // 파일을 텍스트로 읽기 시작합니다.
    reader.readAsText(selectedFile);
}

function readCSVContent(fileContent) {
    // 파일 내용을 줄별로 분리합니다.
    const lines = fileContent.split('\n');

    // 첫 줄은 열 이름이라고 가정합니다.
    const columnNames = lines[0].split(',');

    // 나머지 줄의 데이터를 처리하여 JSON 형태로 변환합니다.
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        const row = {};
        for (let j = 0; j < columnNames.length; j++) {
            row[columnNames[j]] = values[j];
        }
        data.push(row);
    }

    console.log(data);
}



