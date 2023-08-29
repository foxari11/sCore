var extent = [-200000.0, -3015.4524155292, 3803015.45241553, 4000000.0];
var resolutions = [
    2088.96					// 5
    ,	1044.48					// 6
    ,	522.24000000000001		// 7
    ,	261.12					// 8
    ,	130.56					// 9
    ,	65.280000000000001 		// 10
    ,	32.640000000000001		// 11
    ,	16.32					// 12
    ,	8.1600000000000001		// 13
    ,	4.0800000000000001		// 14
    ,	2.04					// 15
    ,	1.02					// 16
    ,	0.51000000000000001		// 17
    ,	0.255 					// 18
    ,	0.1275 					// 19
];


var projection;
var TileUrl = "D://tiles";



var Start_lon = 129.081895; /* 시작 위치 임시 lon 값 */
var Start_lat = 35.157470; /* 시작 위치 임시 lat 값*/

var Def_Center;  /* 디폴트 중심좌표 */
var initStart = true; /* 시작 */

var LocalLayer;
var BaseLayer;/*베이스 레이어 더미*/

var map;/*기본 레이어 */

var Omap;/*OSM 레이어 */
var localTileGrid;

var OMDiv;/*OSM div */
var BDiv;/*맵 베이스 div */


var OnView;

var LocalSource;
var LocalView;

export function init(tiles, startlon, startlat) {
    if (!initStart) {
        return false;
    }
    initStart = false;

    if (tiles != "") {
        TileUrl = tiles;
    } else {
        TileUrl = 'D:/ITS_PROJECT/SynologyDrive/제1연구소/Map/newEmap';
    }

    Start_lon = startlon;
    Start_lat = startlat;

    OBJ_LAYER();
    OpenStreetMapCreat(TileUrl);

    console.log('initialized');
}

function OpenStreetMapCreat(tiles) {
    localTileGrid = new ol.tilegrid.TileGrid({
        extent: extent,
        resolutions: resolutions
    });

    LocalView = new ol.View({
        projection: "EPSG:5179",
        extent: extent,
        maxResolution: 2088.96,
        maxZoom: 12,
        center: ol.proj.transform([127, 37.5], "EPSG:4326", "EPSG:5179")
    });

    LocalSource = new ol.layer.Tile({
        title: "Emap",
        visible: true,
        type: "base",
        source: new ol.source.XYZ({
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
                var z = tileCoord[0] + 5;
                var x = tileCoord[1].toString();
                var y = -tileCoord[2] - 1;

                return tiles + '/' + z + '/' + x + '/' + y + '.png';
            },
        })
    });

    LocalLayer = new ol.layer.Group({
        name: "LocalLayer",
        layers: [LocalSource]
    });

    Omap = new ol.Map({
        layers: [LocalLayer],
        target: OMDiv,
        view: LocalView
    });
}

function OBJ_LAYER() {

    Def_Center = _4326ToMapProj(Start_lon, Start_lat, 'EPSG:5179');

    projection = new ol.proj.Projection({
        code: 'EPSG:5179',
        extent: extent,
        units: 'm'
    });


    OnView = new ol.View({
        center: Def_Center, // 시작 센터값을 중심으로 설정
        projection: projection,
        extent: extent,
        maxResolution: 2088.96, // 최대 줌 레벨에 대한 설정
        maxZoom: 12 // 최대 줌 레벨
    });

    // 베이스 레이어 생성 (오브젝트 레이어)
    BaseLayer = new ol.layer.Group({
        name: "BaseLayer",
        layers: [new ol.layer.Tile({ source: new ol.source.XYZ({ projection: projection }), opacity: 0 })]
    });

    // 맵 객체 생성
    map = new ol.Map({
        layers: [BaseLayer], // 오브젝트 레이어를 설정한 베이스 레이어를 사용
        target: BDiv, // 맵이 표시될 HTML 요소
        view: OnView // 지도 매칭용 뷰 설정
    });

}

function _4326ToMapProj(lon, lat, projectionCode) {
    // proj4를 사용하여 WGS84 좌표계인 EPSG:4326을 지정한 좌표계로 변환합니다.
    if (!ol.proj.get(projectionCode)) {
        // 등록되어 있지 않은 경우, 새로운 좌표계를 생성하고 proj4를 사용하여 정의합니다.
        proj4.defs(projectionCode, '+proj=utm +zone=52 +datum=WGS84 +units=m +no_defs');
        ol.proj.proj4.register(proj4);

    }

    // 좌표 변환을 수행합니다.
    var lonLat = ol.proj.transform([lon, lat], 'EPSG:4326', projectionCode);

    return lonLat;
}
export function setMapCenter(mapView, lonlat) {
    const center = ol.proj.fromLonLat(lonlat, "EPSG:5179");
    mapView.getView().animate({ center: center });
}


