window.onload = init;

let map; // map 변수를 전역으로 선언


function init() {

    EMapCreat("D:/eMap/tiles/")

}

function zoom(zno) {
    map.getView().setZoom(zno);
    console.log(zno + " 으로 줌 변경");
}

function Rotations(angle){map.getView().setRotation(angle);console.log(angle+"도로 각도 변경");}/* 지도 회전 */


function CodebyTime(){
    var t = new Date();
    return t.getFullYear()+"-"+(Number(t.getMonth())+1)+"-"+t.getDate()+" "+t.getHours()+":"+t.getMinutes()+":"+t.getSeconds();
} /* 현재시간 호출용 */

function PopUpViewLayer(){
    //document.getElementById('popup_list').innerHTML = "";
    for (var i = 0; i < PopupLayer.length; i++) {
        map.removeOverlay(PopupLayer[i]);
    }
    PopupLayer = [];

    var cnt = popup_lon_arr.length;

    for(i=0;i<cnt;i++){
        var popup_html = "<div id='popup"+i+"' class='ol-popup' style='z-index:9999999'>"
            +"<input type='hidden' value='"+i+"' id='"+popup_id_arr[i]+"'>"
            +"<a href='#' id='popup-closer"+i+"' class='ol-popup-closer' onclick='closePopup(this,"+i+");'></a>"
            +"<div id='popup-content"+i+"'></div>"
            +"</div>"
        ;
        document.getElementById('popup_list').innerHTML = popup_html;

        container = document.getElementById('popup'+i); /* openlayers3 지원 팝업컨트롤 변수 */
        content = document.getElementById('popup-content'+i); /* openlayers3 지원 팝업컨트롤 변수 */
        closer = document.getElementById('popup-closer'+i); /* openlayers3 지원 팝업컨트롤 변수 */

        content.className = "popup-content";
        content.innerHTML = popup_html_arr[i];

        var coordinate = ol.proj.transform([Number(popup_lon_arr[i]),Number(popup_lat_arr[i])], 'EPSG:4326', 'EPSG:5179');

        PopupLayer[i] = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({ /* 팝업(말풍선) 레이어 생성 */
            element: container
            ,autoPan: true
            ,autoPanAnimation: {
                duration: 0 /* api지도들은 바로 이동하므로 0으로 해야 떨어져 나가는 느낌이 안생김 */
            }
            ,position: coordinate
            //,positioning: 'center-center'
        }));
        map.addOverlay(PopupLayer[i]);

    }
    if(popup_id_arr.length > 0){
        tooltipChk = 1;
    }else{
        tooltipChk = 0;
    }
}

function EMapCreat(tiles){/*OSM 생성 : 맵생성 옵션은 OSM 홈페이지 참조 */
    var extent	= [-200000.0, -28024123.62 , 31824123.62, 4000000.0];
    var resolutions = [
        1954.597389
        , 977.2986945
        , 488.64934725
        , 244.324673625
        , 122.1623368125
        , 61.08116840625
        , 30.540584203125
        , 15.2702921015625
        ,7.63514605078125
        ,3.817573025390625
        ,1.9087865126953125
        ,0.9543932563476563
        ,0.47719662817382813
        ,0.23859831408691406];

    /* OSM은 API자체는 지원하지 않기 때문에 ol3을 한개 더만들어 지도를 생성한다 */
    localTileGrid =  new ol.tilegrid.TileGrid({
        extent: extent,
        resolutions: resolutions
    });

    LocalView = new ol.View({
        projection: projection,
        extent: extent,
        maxResolution: 1954.597389,
        maxZoom: 13,
        center :[960363.60652286,1920034.9139856],
        zoom : 3
    });

    LocalSource = new ol.layer.Tile({
        title : 'eMap',
        visible : true,
        type : 'base',
        source : new ol.source.XYZ({
            projection: projection,
            tileSize: 256,
            //minZoom: 6,
            maxZoom: 13,
            tileGrid:localTileGrid,
            tileUrlFunction: function (tileCoord, pixelRatio, projection) {
                if (tileCoord == null) return undefined;
                var tileExtent = localTileGrid.getTileCoordExtent(tileCoord);
                var DLs = ol.extent.getBottomLeft(tileExtent);
                //var MapDLs = ol.extent.getBottomLeft(projection.c);
                var MapDLs = ol.extent.getBottomLeft(projection.i);
                var z = tileCoord[0]+6;
                var gRes = LocalView.getResolution();
                var x = Math.round((DLs[0] - MapDLs[0]) / (gRes * 256));
                var y = Math.round((DLs[1] - MapDLs[1]) / (gRes * 256));
                //console.log(z + '/' + x + '/' + y);
                //return '/map/e-map/' + z + '/' + x + '/' + y + '.png';
                return tiles + z + '/' + x + '/' + y + '.png';
            }
        })
    });

    LocalLayer = new ol.layer.Group({name:"LocalLayer_e",layers:[LocalSource]}); /* 베이스 레이어생성 옵션 필요없음 */
    Emap = new ol.Map({ /* 베이스맵 생성 */
        layers : [LocalLayer] /* 오브젝트 레이어 */
        ,target : EMDiv /* 사용할 div */
        ,view: LocalView /* 지도 매칭용 뷰 */
    });
    //console.log("ID "+OMDiv+"의 div를 OSM 생성.");
}
