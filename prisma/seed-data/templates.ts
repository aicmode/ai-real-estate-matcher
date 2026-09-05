/** 4タイプの幅を定義。個々の値は固定PRNGでこの範囲内から選ぶ。 */
export const PROPERTY_TEMPLATES = [
  { key: "A", label: "駅近・築浅", name: "リュミナステラス", rent: 76000, layouts: ["1LDK", "1DK"], size: [32, 44], age: [0, 5], walk: [3, 5], floors: [3, 9], structures: ["鉄筋コンクリート造", "鉄骨鉄筋コンクリート造"], remote: [3, 4], appeal: "駅への近さと築年数を優先した住まい", caution: "駅に近い設定のため、静けさを優先する場合は比較が必要" },
  { key: "B", label: "コスト重視", name: "コトリハイツ", rent: 40000, layouts: ["1K", "1DK"], size: [23, 31], age: [19, 32], walk: [12, 20], floors: [1, 2], structures: ["木造", "鉄骨造"], remote: [1, 2], appeal: "敷金・礼金ゼロの設定で初期費用を抑えやすい", caution: "築年数が経過した設定で、断熱性や防音性は重視していません" },
  { key: "C", label: "広さ・ファミリー", name: "ソラネガーデン", rent: 89000, layouts: ["2LDK", "3LDK"], size: [62, 78], age: [8, 18], walk: [9, 16], floors: [1, 5], structures: ["鉄筋コンクリート造", "鉄骨造"], remote: [3, 4], appeal: "寝室と家族共用スペースを分けやすい間取り", caution: "広さを確保した分、単身向けタイプより月額総額が高い設定" },
  { key: "D", label: "設備・在宅ワーク", name: "ミライネワークス", rent: 96000, layouts: ["1LDK", "2LDK"], size: [45, 59], age: [2, 9], walk: [6, 11], floors: [2, 7], structures: ["鉄筋コンクリート造", "鉄骨鉄筋コンクリート造"], remote: [5, 5], appeal: "ワークスペースと無料光回線を備えた在宅ワーク向け設定", caution: "通信速度を保証するデータではありません" },
] as const;
