/**
 * 代表エリアのデモ座標。物件の所在地を表すものではない。
 * 都道府県・自治体: https://www.j-lis.go.jp/spd/code-address/jititai-code.html
 * 沖縄の鉄道: https://www.yui-rail.co.jp/routemap/
 * 価格係数は創作上の区分であり、実際の相場統計ではない。
 */
export const PRICE_FACTORS = { regional: 1, hub: 1.2, metro: 1.5, capital: 2.2 } as const;
type PriceTier = keyof typeof PRICE_FACTORS;
export interface DemoArea {
  city: string;
  area: string;
  nearestLine: string;
  nearestStation: string;
  latitude: number;
  longitude: number;
}
export interface PrefectureDemo {
  code: string;
  prefecture: string;
  priceTier: PriceTier;
  areas: readonly DemoArea[];
}
// 地理情報は組として扱い、駅・路線・市区町村を別々にランダム選択しない。
type AreaTuple = [string, string, string, string, number, number];
function area([city, area, nearestLine, nearestStation, latitude, longitude]: AreaTuple): DemoArea {
  return { city, area, nearestLine, nearestStation, latitude, longitude };
}
function prefecture(code: string, name: string, tier: PriceTier, ...places: AreaTuple[]): PrefectureDemo {
  return { code, prefecture: name, priceTier: tier, areas: places.map(area) };
}
export const PREFECTURES: readonly PrefectureDemo[] = [
  prefecture("01", "北海道", "hub", ["札幌市", "北区・札幌駅周辺", "JR函館本線", "札幌", 43.069, 141.351], ["小樽市", "小樽駅周辺", "JR函館本線", "小樽", 43.198, 140.994]),
  prefecture("02", "青森県", "regional", ["青森市", "青森駅周辺", "JR奥羽本線", "青森", 40.829, 140.735]),
  prefecture("03", "岩手県", "regional", ["盛岡市", "盛岡駅周辺", "JR東北本線", "盛岡", 39.701, 141.136]),
  prefecture("04", "宮城県", "hub", ["仙台市", "青葉区・仙台駅周辺", "JR東北本線", "仙台", 38.261, 140.882]),
  prefecture("05", "秋田県", "regional", ["秋田市", "秋田駅周辺", "JR奥羽本線", "秋田", 39.717, 140.129]),
  prefecture("06", "山形県", "regional", ["山形市", "山形駅周辺", "JR奥羽本線", "山形", 38.249, 140.327]),
  prefecture("07", "福島県", "regional", ["福島市", "福島駅周辺", "JR東北本線", "福島", 37.754, 140.46]),
  prefecture("08", "茨城県", "regional", ["水戸市", "水戸駅周辺", "JR常磐線", "水戸", 36.371, 140.477]),
  prefecture("09", "栃木県", "regional", ["宇都宮市", "宇都宮駅周辺", "JR東北本線", "宇都宮", 36.559, 139.898]),
  prefecture("10", "群馬県", "regional", ["前橋市", "前橋駅周辺", "JR両毛線", "前橋", 36.383, 139.073]),
  prefecture("11", "埼玉県", "metro", ["さいたま市", "大宮区・大宮駅周辺", "JR京浜東北線", "大宮", 35.907, 139.624]),
  prefecture("12", "千葉県", "metro", ["千葉市", "中央区・千葉駅周辺", "JR総武本線", "千葉", 35.613, 140.113]),
  prefecture("13", "東京都", "capital", ["新宿区", "新宿駅周辺", "JR山手線", "新宿", 35.69, 139.701], ["杉並区", "荻窪駅周辺", "JR中央線", "荻窪", 35.704, 139.62]),
  prefecture("14", "神奈川県", "metro", ["横浜市", "西区・横浜駅周辺", "JR東海道本線", "横浜", 35.466, 139.622]),
  prefecture("15", "新潟県", "regional", ["新潟市", "中央区・新潟駅周辺", "JR信越本線", "新潟", 37.912, 139.061]),
  prefecture("16", "富山県", "regional", ["富山市", "富山駅周辺", "JR高山本線", "富山", 36.702, 137.213]),
  prefecture("17", "石川県", "hub", ["金沢市", "金沢駅周辺", "IRいしかわ鉄道線", "金沢", 36.578, 136.648]),
  prefecture("18", "福井県", "regional", ["福井市", "福井駅周辺", "JR越美北線", "福井", 36.062, 136.223]),
  prefecture("19", "山梨県", "regional", ["甲府市", "甲府駅周辺", "JR中央本線", "甲府", 35.667, 138.569]),
  prefecture("20", "長野県", "regional", ["長野市", "長野駅周辺", "JR信越本線", "長野", 36.644, 138.189]),
  prefecture("21", "岐阜県", "regional", ["岐阜市", "岐阜駅周辺", "JR東海道本線", "岐阜", 35.41, 136.756]),
  prefecture("22", "静岡県", "hub", ["静岡市", "葵区・静岡駅周辺", "JR東海道本線", "静岡", 34.972, 138.389]),
  prefecture("23", "愛知県", "metro", ["名古屋市", "中村区・名古屋駅周辺", "JR東海道本線", "名古屋", 35.171, 136.882], ["豊橋市", "豊橋駅周辺", "JR東海道本線", "豊橋", 34.763, 137.382]),
  prefecture("24", "三重県", "regional", ["津市", "津駅周辺", "JR紀勢本線", "津", 34.734, 136.511]),
  prefecture("25", "滋賀県", "hub", ["大津市", "大津駅周辺", "JR東海道本線", "大津", 35.003, 135.864]),
  prefecture("26", "京都府", "metro", ["京都市", "下京区・京都駅周辺", "JR東海道本線", "京都", 34.985, 135.759]),
  prefecture("27", "大阪府", "metro", ["大阪市", "北区・大阪駅周辺", "JR大阪環状線", "大阪", 34.702, 135.495], ["吹田市", "吹田駅周辺", "JR東海道本線", "吹田", 34.763, 135.523]),
  prefecture("28", "兵庫県", "metro", ["神戸市", "中央区・三ノ宮駅周辺", "JR東海道本線", "三ノ宮", 34.695, 135.195]),
  prefecture("29", "奈良県", "hub", ["奈良市", "奈良駅周辺", "JR関西本線", "奈良", 34.681, 135.819]),
  prefecture("30", "和歌山県", "regional", ["和歌山市", "和歌山駅周辺", "JR阪和線", "和歌山", 34.232, 135.191]),
  prefecture("31", "鳥取県", "regional", ["鳥取市", "鳥取駅周辺", "JR山陰本線", "鳥取", 35.494, 134.226]),
  prefecture("32", "島根県", "regional", ["松江市", "松江駅周辺", "JR山陰本線", "松江", 35.464, 133.064]),
  prefecture("33", "岡山県", "hub", ["岡山市", "北区・岡山駅周辺", "JR山陽本線", "岡山", 34.666, 133.918]),
  prefecture("34", "広島県", "hub", ["広島市", "南区・広島駅周辺", "JR山陽本線", "広島", 34.397, 132.475]),
  prefecture("35", "山口県", "regional", ["山口市", "山口駅周辺", "JR山口線", "山口", 34.172, 131.481]),
  prefecture("36", "徳島県", "regional", ["徳島市", "徳島駅周辺", "JR高徳線", "徳島", 34.074, 134.551]),
  prefecture("37", "香川県", "regional", ["高松市", "高松駅周辺", "JR予讃線", "高松", 34.351, 134.047]),
  prefecture("38", "愛媛県", "regional", ["松山市", "松山駅周辺", "JR予讃線", "松山", 33.84, 132.751]),
  prefecture("39", "高知県", "regional", ["高知市", "高知駅周辺", "JR土讃線", "高知", 33.567, 133.543]),
  prefecture("40", "福岡県", "hub", ["福岡市", "博多区・博多駅周辺", "JR鹿児島本線", "博多", 33.59, 130.421], ["北九州市", "小倉北区・小倉駅周辺", "JR鹿児島本線", "小倉", 33.887, 130.883]),
  prefecture("41", "佐賀県", "regional", ["佐賀市", "佐賀駅周辺", "JR長崎本線", "佐賀", 33.265, 130.298]),
  prefecture("42", "長崎県", "regional", ["長崎市", "長崎駅周辺", "JR長崎本線", "長崎", 32.752, 129.87]),
  prefecture("43", "熊本県", "hub", ["熊本市", "西区・熊本駅周辺", "JR鹿児島本線", "熊本", 32.79, 130.688]),
  prefecture("44", "大分県", "regional", ["大分市", "大分駅周辺", "JR日豊本線", "大分", 33.233, 131.607]),
  prefecture("45", "宮崎県", "regional", ["宮崎市", "宮崎駅周辺", "JR日豊本線", "宮崎", 31.915, 131.432]),
  prefecture("46", "鹿児島県", "regional", ["鹿児島市", "中央町・鹿児島中央駅周辺", "JR鹿児島本線", "鹿児島中央", 31.584, 130.542], ["霧島市", "国分駅周辺", "JR日豊本線", "国分", 31.744, 130.763]),
  prefecture("47", "沖縄県", "hub", ["那覇市", "久茂地・県庁前駅周辺", "ゆいレール", "県庁前", 26.214, 127.68], ["浦添市", "前田・浦添前田駅周辺", "ゆいレール", "浦添前田", 26.241, 127.732]),
];
