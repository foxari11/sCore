export function drawFeaturesAll(options) {
    const lonsCnt = options.lons.length;
    const latsCnt = options.lats.length;
    const innerColorCnt = options.innerColor.length;
    const rimColorCnt = options.rimColor.length;
    const ftDataCnt = options.FtData.length;

    if (
        lonsCnt === latsCnt &&
        lonsCnt === innerColorCnt &&
        lonsCnt === rimColorCnt &&
        lonsCnt === ftDataCnt
    ) {
        const featurething = [];
        const atlasManager = new ol.style.AtlasManager({ initialSize: 512 });

        for (let i = 0; i < lonsCnt; i++) {
            const FStyle = new ol.style.Style({
                image: new ol.style.Circle({
                    fill: new ol.style.Fill({
                        color: options.innerColor[i],
                    }),
                    stroke: new ol.style.Stroke({
                        color: options.rimColor[i],
                        width: options.Vector_Stroke || 1,
                    }),
                    opacity: 0.2,
                    scale: 1,
                    radius: options.Vector_Radius || 5,
                    atlasManager: atlasManager,
                }),
            });

            const feature = new ol.Feature({
                geometry: new ol.geom.Point(
                    ol.proj.transform(
                        [Number(options.lons[i]), Number(options.lats[i])],
                        "EPSG:4326",
                        "EPSG:5179"
                    )
                ),
                ftinfo: options.FtData[i],
            });

            feature.setStyle(FStyle);
            featurething.push(feature);
        }

        const lyno = LayerNoCall(options.LyName);
        if (lyno > -1) {
            if (options.cleanChk) {
                SystemLog("기존 데이터 삭제.");
                FeaturesSource[lyno].clear(true);
            }
            FeaturesSource[lyno].addFeatures(featurething);
        } else {
            SystemLog(options.LyName + " 이름의 레이어가 없습니다.");
        }
    } else {
        SystemLog("데이터 개수가 맞지 않습니다.");
        SystemLog("lonsCnt : " + lonsCnt + "개.");
        SystemLog("latsCnt : " + latsCnt + "개.");
        SystemLog("innerColorCnt : " + innerColorCnt + "개.");
        SystemLog("rimColorCnt : " + rimColorCnt + "개.");
        SystemLog("FtDataCnt : " + ftDataCnt + "개.");
    }
}
