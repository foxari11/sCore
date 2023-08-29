var OpenStreet_Map_Use_CHK = false; /* 오픈스트리트맵 사용 유무 */
var extent = [-200000.0, -3015.4524155292, 3803015.45241553, 4000000.0];
var projection;
var OnView;
var Def_Center;  /* 디폴트 중심좌표 */
var CenterCrossViewChk = false;
var OMDiv;/*OSM div */
var BDiv;/*맵 베이스 div */
var BSmallDiv;/* 스몰 맵 베이스 div */

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

function Draw_LineString_Center(LyName,polyCoord,rimColor,rimWidth,dash,cleanChk){
    var lyno = LayerNoCall(LyName);
    if(lyno > -1){
        var vectorLayer;
        var Loncnt = polyCoord.length;
        var fStryle ,i ,j;
        var coordList = [];
        var polygonFeature = [];
        for(i=0;i<Loncnt;i++){
            for(j=0;j<polyCoord[i].lon.length;j++){coordList[j] =  ol.proj.transform([Number(polyCoord[i].lon[j]),Number(polyCoord[i].lat[j])], 'EPSG:4326', 'EPSG:5179');}
            polygonFeature[i] = new ol.Feature({geometry:new ol.geom.LineString(coordList)});
        }
        fStryle = new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: rimColor
                ,width:rimWidth
                ,lineDash: dash
            })
        });
        vectorLayer = map.getLayers().getArray();
        vectorLayer[lyno+1].setStyle(fStryle);
        if(cleanChk){ /* 지울지 체크*/
            FeaturesSource[lyno].clear(true); /*기존 Features 삭제*/
        }
        FeaturesSource[lyno].addFeatures(polygonFeature); /*새 Features 표시*/
    }
}


function Center_Viewer(){

    if(CenterCrossViewChk){
        var center = ol.proj.transform(OnView.getCenter(), 'EPSG:5179', 'EPSG:4326'); /* 베이스맵 중심좌표 찾기 */
        var extent = map.getView().calculateExtent(map.getSize());
        var bottomLeft = ol.proj.transform(ol.extent.getBottomLeft(extent),'EPSG:5179', 'EPSG:4326');
        var topRight = ol.proj.transform(ol.extent.getTopRight(extent),'EPSG:5179', 'EPSG:4326');

        var polyCoord = [
            {
                lon:[bottomLeft[0],topRight[0]]
                ,lat:[center[1],center[1]]
            }
            ,{
                lon:[center[0],center[0]]
                ,lat:[bottomLeft[1],topRight[1]]
            }
        ];
        var rimColor = [255,255,255,1]; // 테두리색 rgba 타입은 배열로 표시 그냥 일반 컬러를 넣으면 투명도 조절이 안된다.
        var rimWidth = 1 ; // 테두리, 선 두께
        var dash =[2,2] ;
        // Draw_LineString_Center("CenterViewerLayer2",polyCoord,rimColor,rimWidth,dash,T);
        Draw_LineString_Center("Ref_POINT",polyCoord,rimColor,rimWidth,dash,T);
        rimColor = [0,0,0,1];
        dash =[1,0] ;
        // Draw_LineString_Center("CenterViewerLayer",polyCoord,rimColor,rimWidth,dash,T);
        Draw_LineString_Center("Ref_POINT",polyCoord,rimColor,rimWidth,dash,T);

    }else{
        removeElement("CenterViewerLayer");
        removeElement("CenterViewerLayer2");
    }
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
    map.getView().setCenter(_4326ToMapProj(lon,lat,'EPSG:5179')); /*console.log(lon+" , "+lat+" 으로 좌표이동");*/
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

function init(tiles,startlon,startlat){

    // if(!initStart){return false;} /*init 함수는 한번만 여러번 실행되는것 방지 재실행이 필요할 경우 initStart = true 할것*/
    initStart = false;
    if(tiles !=""){
        TileUrl=tiles;
    }else{
        TileUrl = 'D:\\MAP\\EMAP';
    }

    Start_lon = startlon; // 시작 lon
    Start_lat = startlat; // 시작 lat


    /* 사용하는 맵체크*/
    /*if($("#"+BDiv).length){$("#"+BDiv).css("z-index","9999995");}else{SystemLog("ID "+BDiv+"인 div를 찾을수 없어 지도 시작을 정지합니다.");return false;}
    if($("#"+BSmallDiv).length){$("#"+BSmallDiv).css("z-index","9999994");}else{SystemLog("ID "+BSmallDiv+"인 div를 찾을수 없어 지도 시작을 정지합니다.");return false;}
    if($("#"+OMDiv).length){$("#"+OMDiv).css("z-index","9999993");}else{OpenStreet_Map_Use_CHK=F;SystemLog("ID "+OMDiv+"인 div를 찾을수 없어 OSM을 사용 할수 없습니다.");} /!*OSM div 체크*!/
*/
    //if(!OpenStreet_Map_Use_CHK){SystemLog("사용할 지도가 없습니다.지도 사용 체크를 확인해 주세요");return false;}
    /*맵 레이어 생성 끝*/
    BASEMAP_CREAT();/*베이스맵 생성*/

    if(OpenStreet_Map_Use_CHK){OpenStreetMapCreat(TileUrl);}/*오픈스트리트맵 생성*/
    SetCenter(Start_lon,Start_lat);
    Zoom(Start_Zoom);
    Obj_Layer_Creat();
    SetMapChange(DefaultMap);/*맵 변경*/
    //DeveloperStart();/* 개발자용 시작 설정 */



    $(".folding-btn").hide()
    console.log('initialized');
}
function layerMatching(){/* 베이스맵과 사용중인 지도를 매칭한다. */
    var now_center = new ol.proj.transform(map.getView().getCenter(), 'EPSG:5179', "EPSG:4326"); /* 현재 중심좌표 */
    SetCenter(now_center[0],now_center[1]); /* 현재 중심으로 다시 중심설정 */
    Zoom(map.getView().getZoom()); /* 현재줌으로 다시 줌 설정 */
}

function SetMapChange(mapCode){/* 맵 변경 불필요한 지도를 display none 시키고 필요한 지도를 display 시키고 지도 리셋함 */
    if(OpenStreet_Map_Use_CHK){$("#"+OMDiv).css("display","none");}
    /* OSM */		if(OSM==mapCode&&OpenStreet_Map_Use_CHK){$("#"+OMDiv).css("display","");Omap.updateSize();}
    layerMatching();
}

function OpenStreetMapCreat(tiles){/*OSM 생성 : 맵생성 옵션은 OSM 홈페이지 참조 */
    /* OSM은 API자체는 지원하지 않기 때문에 ol3을 한개 더만들어 지도를 생성한다 */
    proj4.defs("EPSG:5179", '+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +units=m +no_defs');	// 네이버맵 좌표계

    localTileGrid =  new ol.tilegrid.TileGrid({
        extent: extent,
        resolutions: resolutions
    });

    LocalView = new ol.View({
        projection: "EPSG:5179"
        ,extent: extent
        ,maxResolution: 2088.96
        ,maxZoom: 12
        ,center: ol.proj.transform([127, 37.5], "EPSG:4326", "EPSG:5179")
    });

    LocalSource = new ol.layer.Tile({
        title : "Emap",
        visible : true,
        type : "base",
        source : new ol.source.XYZ({
            projection: new ol.proj.Projection({
                code: 'EPSG:5179',
                extent: extent,
                units: 'm'
            }),
            tileGrid: new ol.tilegrid.TileGrid({
                extent: extent,
                origin: [extent[0], extent[3]],
                resolutions: resolutions
            }),
            tileUrlFunction: function(tileCoord) {
                var z = tileCoord[0]+5;
                var x = tileCoord[1].toString();
                var y = -tileCoord[2]-1;

                return tiles + '/' + z + '/' + x + '/' + y + '.png';
            },
        })
    });

    //var LocalSource_Line = new ol.layer.Tile({
    //	source: new ol.source.TileDebug({
    //		projection: "EPSG:5179",
    //		tileGrid: localTileGrid
    //	})
    //});

    LocalLayer = new ol.layer.Group({name:"LocalLayer",layers:[LocalSource]});

    /**************************************************************/
    //내 위치 찾기 버튼 등록
    var rotateButton = document.createElement('button');
    rotateButton.innerHTML = '🕀';

    rotateButton.addEventListener('click', handleRotateNorth, false);

    var element = document.createElement('div');
    element.className = 'rotate-north ol-unselectable ol-control';
    element.appendChild(rotateButton);

    var RotateNorthControl = new ol.control.Control({
        element: element
    });


    var foldingButton = document.createElement("button");
    foldingButton.innerHTML = "접기";

    var foldingButtonElement = document.createElement("div");
    foldingButtonElement.className = 'folding-btn ol-unselectable ol-control'
    foldingButtonElement.appendChild(foldingButton);

    var foldingButtonControl = new ol.control.Control({
        element : foldingButtonElement
    })

    /**************************************************************/

    Omap = new ol.Map({ /* 베이스맵 생성 */
        layers : [LocalLayer] /* 오브젝트 레이어 */
        ,target : OMDiv /* 사용할 div */
        ,view: LocalView /* 지도 매칭용 뷰 */
    });
    map.addControl(new ol.control.ZoomSlider());
    Omap.addControl(RotateNorthControl)
    Omap.addControl(foldingButtonControl);
}



function Obj_Layer_Creat(){
    for(i=0;i<Vector_Layer_Lists.length;i++){
        VectorLayerCreat(Vector_Layer_Lists[i]);
    }
    for(i=0;i<Vector_Label_Layer_Lists.length;i++){
        VectorLabelLayerCreat(Vector_Label_Layer_Lists[i]);
    }
    for(i=0;i<Heatmap_Layer_Lists.length;i++){
        HeatmapLayerCreat(Heatmap_Layer_Lists[i].layerName
            ,Heatmap_Layer_Lists[i].gradient
            ,Heatmap_Layer_Lists[i].radius
            ,Heatmap_Layer_Lists[i].blur);
    }
    for(i=0;i<Cluster_Layer_Lists.length;i++){
        ClusterLayerCreat(Cluster_Layer_Lists[i]);
    }
}

function _4326ToMapProj(x,y,proj){return new ol.proj.transform([Number(x), Number(y)],  'EPSG:4326', proj);}/* 좌표 변경 */


function BASEMAP_CREAT(){/* 베이스맵 생성 맵이라기 보단 오브젝트 레이어가 맞음*/
    Def_Center = _4326ToMapProj(Start_lon,Start_lat,'EPSG:5179'); /* 시작 센터값 변수이름 수정할것. cen쓰지말고*/

    projection = new ol.proj.Projection({
        code: 'EPSG:5179',
        extent: extent,
        units: 'm'
    });

    OnView = new ol.View({ /* 다른 맵을 매칭 시킬 뷰를 생성 (ol3 에서 생긴 기능 view)*/
        center : Def_Center /* 시작 센터값*/
        ,projection: projection
        ,extent: extent
        //,maxResolution: 1954.597389
        ,maxResolution: 2088.96
        ,maxZoom: 12
    });

    OnBigView = new ol.View({ /* 다른 맵을 매칭 시킬 뷰를 생성 (ol3 에서 생긴 기능 view)*/
        center : Def_Center /* 시작 센터값*/
        ,projection: projection
        ,extent: extent
        ,maxResolution: 2088.96
        ,maxZoom: 12
    });

    OnView.on('change:center', function() { /* 중심좌표 변화가 일어날때 현재 좌표를 사용중인 지도의 중심 좌표와 베이스맵 중심좌표를 매칭 시킴*/
        let center = ol.proj.transform(OnView.getCenter(), 'EPSG:5179', 'EPSG:4326'); /* 베이스맵 중심좌표 찾기 */
        let z = Math.round(OnView.getZoom()); /* 베이스맵 줌 찾기 */
        if(OpenStreet_Map_Use_CHK){Omap.getView().setCenter(OnView.getCenter());} /* OSM 좌표매칭 */
        OnBigView.setZoom(OnView.getZoom());
        OnBigView.setCenter(OnView.getCenter());
        Center_Viewer();
    });
    OnView.on('change:resolution', function() { /* 해상도 그러니까 줌값이 변할때 이벤트 */
        var z = Math.round(OnView.getZoom()); /* 베이스맵 줌 찾기 */
        var center = ol.proj.transform(OnView.getCenter(), 'EPSG:5179', 'EPSG:4326'); /* 베이스맵 중심좌표 찾기 */
        if(OpenStreet_Map_Use_CHK){Omap.getView().setZoom(z);/*console.log(z+",,zoomchange");*/} /* OSM맵 줌 매칭 */
        OnBigView.setZoom(OnView.getZoom());
        OnBigView.setCenter(OnView.getCenter());
        Center_Viewer();
        console.log(z+",,zoomchange");

        console.log(" OnView : " + OnView.getResolution());
        console.log(" Omap : " + LocalView.getResolution());
    });

    BaseLayer = new ol.layer.Group({name:"BaseLayer",layers:[new ol.layer.Tile({source: new ol.source.XYZ({projection: projection}),opacity:0}) ]}); /* 베이스 레이어생성 옵션 필요없음 */
    SmallLayer = new ol.layer.Group({name:"SmallLayer",layers:[new ol.layer.Tile({source: new ol.source.XYZ({projection: projection}),opacity:0}) ]}); /* 베이스 레이어생성 옵션 필요없음 */

    container = document.getElementById('popup'); /* openlayers3 지원 팝업컨트롤 변수 */
    legend = document.getElementById('legend'); /* openlayers3 지원 팝업컨트롤 변수 */
    content = document.getElementById('popup-content'); /* openlayers3 지원 팝업컨트롤 변수 */
    closer = document.getElementById('popup-closer'); /* openlayers3 지원 팝업컨트롤 변수 */
    legendPanel = document.getElementById('legend-panel'); /* openlayers3 지원 팝업컨트롤 변수 */

    PopupOverLay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({ /* 팝업(말풍선) 레이어 생성 */
        element: container
        ,autoPan: true
        ,autoPanAnimation: {
            duration: 0 /* api지도들은 바로 이동하므로 0으로 해야 떨어져 나가는 느낌이 안생김 */
        }
    }));

    closer.onclick = function() { /* 팝업(말풍선) 닫힘 버튼 생성 */
        PopupOverLay.setPosition(undefined);
        closer.blur();
        return false;
    };

    dragpanInt = new ol.interaction.DragBox({
        condition: ol.events.condition.altKeyOnly,
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({color: [0, 0, 255, 1]})
        })});/*드레그 박스 이벤트 생성*/


    /**************************************************************/

    //내 위치 찾기 버튼 등록
    var button = document.createElement('button');
    button.innerHTML = '🕀';

    button.addEventListener('click', handleRotateNorth, false);

    var element = document.createElement('div');
    element.className = 'rotate-north ol-unselectable ol-control';
    element.appendChild(button);

    var RotateNorthControl = new ol.control.Control({
        element: element
    });

    var foldingButton = document.createElement("button");
    foldingButton.innerHTML = "접기";

    foldingButton.addEventListener("click",initFoldingMode)

    var foldingButtonElement = document.createElement("div");
    foldingButtonElement.className = 'folding-btn ol-unselectable ol-control'
    foldingButtonElement.appendChild(foldingButton);

    var foldingButtonControl = new ol.control.Control({
        element : foldingButtonElement
    })

    /**************************************************************/


    map = new ol.Map({ /* 베이스맵 생성 */
        layers : [BaseLayer] /* 오브젝트 레이어 */
        ,target : BDiv /* 사용할 div */
        ,interactions: [
            new ol.interaction.DragPan({kinetic:new ol.Kinetic(-1,1,1)}) /* 지도 관성 끄기 */
            ,new ol.interaction.MouseWheelZoom() /* 마우스 휠줌 켜기 */
            ,dragpanInt
        ]
        ,view: OnView /* 지도 매칭용 뷰 */
        ,overlays: [PopupOverLay] /* 팝업(말풍성)레이어 */
        //,renderer:('webgl')
    });

    map.addControl(new ol.control.ZoomSlider());
    map.addControl(RotateNorthControl);
    map.addControl(foldingButtonControl);

    SystemLog("베이스맵 생성.");
    map.on("click", function(e) { /* 맵 포인트 클릭 이벤트 */
        map.forEachFeatureAtPixel(e.pixel, function (feature, layer){
            var LyType="None Data";
            if(layer){
                LyType = layer.get("Type"); /* 클릭한 포인트의 레이어 타입을 확인 */
                SystemLog('ID :'+layer.get("name") +"(Type : "+LyType+") 레이어의 포인트를 클릭했습니다.");
            }
            if(LyType == CS){ /* cluster 포인트의 경우 배열로 값을 뽑기 때문에 해당 객체를 통째로 보냄 */
                var features = feature.get('features'); /* 클릭한 객체데이터를 뽑음 */
                Cluster_Feature_Click_Event(features,layer); /* 뽑아낸 객체를 전송 */
            }else{
                Feature_Click_Event(feature.get("ftinfo"),layer,e); /* 클릭한 포인트의 객체를 전송 */
            }
        })
    });


    map.on('singleclick',MapClickEvt); /* 지도 클릭이벤트 */
    map.on('pointermove',MapMouseMoveEvt); /* 마우스 이동 이벤트 */
    map.on('dblclick', MapDBClickEvt); /* 지도 더블클릭 이벤트 */
    map.on('moveend', MapMoveEvt); /* 맵이동 이벤트*/

    dragpanInt.on('boxend', MapDragEndEvt);
    dragpanInt.on('boxstart', MapDragEvt);

    //map.on('drag', MapDragEvt); /* 드래그 이벤트 */
    //map.on('dragend', MapDragEndEvt); /* 드래그 완료 이벤트 */
    dragpanInt.setActive(true);

    Smallmap = new ol.Map({ /* 베이스맵 생성 */
        layers : [SmallLayer] /* 오브젝트 레이어 */
        ,target : BSmallDiv /* 사용할 div */
        ,view: OnBigView /* 지도 매칭용 뷰 */
    });

}




