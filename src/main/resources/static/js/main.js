// main.js - 메인 진입점
import { createMap, setMapCenter } from './map.js';
import { Start_mapMeasurement, End_mapMeasurement } from './measurement.js';
import { Draw_Features_All } from './feature.js';
import { searchLonLat } from './clickHandler.js';

const mapView = createMap('map');

// 지도 중심 설정
const centerCoords = [14248656.389982047, 4331624.063626864];
setMapCenter(mapView, centerCoords);

// 클릭 이벤트 처리 및 측정 기능 시작
searchLonLat(mapView);
Start_mapMeasurement(/* 측정 타입 전달 */);

// 피처 그리기
const options = {
    // 피처 그리기 옵션
};
Draw_Features_All(mapView, options);