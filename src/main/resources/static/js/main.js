import { init, setMapCenter } from './map.js';
import { startMapMeasurement, endMapMeasurement } from './measurement.js';
import { drawFeaturesAll } from './feature.js';
import {searchLonLat} from './clickHandler.js';

// const mapView = init('D:/ITS_PROJECT/SynologyDrive/제1연구소/Map/newEmap',127,37);
const mapView = init('D:/eMap/tiles',127,37);

// 지도 중심 설정
const centerCoords = [14248656.389982047, 4331624.063626864];
/*setMapCenter(mapView, centerCoords);*/

// 클릭 이벤트 처리 및 측정 기능 시작
// searchLonLat(mapView);
startMapMeasurement(mapView, "LineString");
endMapMeasurement(mapView);
// setMapCenter(mapView,centerCoords)

// 피처 그리기
const options = {
    lons: [126.978, 127.003, 127.02],
    lats: [37.566, 37.5, 37.51],
    innerColor: ['#FF0000', '#00FF00', '#0000FF'],
    rimColor: ['#FFFFFF', '#000000', '#FFFF00'],
    FtData: ['Feature 1', 'Feature 2', 'Feature 3'],
    LyName: 'MyLayer',
    Vector_Stroke: 2,
    Vector_Radius: 7,
    cleanChk: true,
};

drawFeaturesAll(mapView, options);
