# 架空物件画像の運用

`prompts.json` は全国47都道府県×4タイプの188物件に対応する生成用データセットです。
`pilot.json` は全件展開前に確認する代表8件です。生成元の固定データ、seed、
Mulberry32を利用し、物件IDごとにタイプ・築年数・所在階・構造・地域の雰囲気・
外壁・植栽・構図を反映します。実在住所や実在建物の写真は入力しません。

## 再生成

```sh
node --import tsx scripts/export-property-image-dataset.ts
```

各 `imageGenerationPrompt` を組み込みの画像生成ツールへ個別に渡します。
画像そのものは確率的に生成されるため、再現性を保証するのはプロンプトとIDの対応です。
採用画像はGit内のWebPとSHA-256検証記録で固定します。
生成時に保存された原画像はプロジェクトへ大量コピーせず、次の処理で圧縮します。

```sh
node scripts/optimize-property-image.mjs demo-jp-01-a /path/to/generated-image.png
node scripts/verify-property-images.mjs --pilot
# 生成済み分を検証してmanifestへ公開する（部分的な進捗でも実行可）
node scripts/verify-property-images.mjs --publish-manifest
```

出力は `public/images/properties/{propertyId}.webp`、1024×768、4:3。
WebP品質78を基本に、200KBを超えた場合のみ品質66まで段階的に下げます。
200KB以下にならない画像は処理を失敗させ、再生成または個別レビューを必要とします。
容量・寸法・形式・重複ハッシュを検証し、`*-verification.json` に記録します。
未生成の物件IDは失敗ではなく `full-verification.json` の `missing` に残作業として記録されます。

## 進捗と再開地点

`full-verification.json` が唯一の進捗表です。`count` が生成済み枚数、
`missing` が未生成の物件IDそのままの再開リストです。再開時は `missing` の各IDについて
`prompts.json` の `imageGenerationPrompt` を画像生成へ渡し、`optimize-property-image.mjs`
で圧縮したうえで `--publish-manifest` を再実行します。既存の画像は再生成しません。

## 配信・紐付け

既存の `Property.imageUrl` とseedは保持し、リポジトリ層のDTO変換時に
`src/lib/property-image-manifest.json` に登録済みのIDを新画像へ紐付けます。
データセット全体やプロンプトはブラウザへ送信しません。
DB schema変更、migration、seed再投入、Storageバケット作成は不要です。

専用画像が未生成の物件には、`resolvePropertyImage` が同じ建物タイプ
(a:駅近・築浅 / b:コスト重視 / c:ファミリー / d:設備重視) の生成済み画像を
決定論的に割り当てます。タイプごとのpoolは互いに素なので、種別が違えば必ず別画像です。
`TYPE_SALTS` は都道府県コードを撹拌する定数で、一覧の実表示順とID順の双方で
距離3以内に同じ画像が現れないよう探索して選びました。一覧は1/2/3カラムなので、
左右にも真上にも同じ写真が並びません。同一県内の4件も必ず異なる画像です。

実表示順はPostgreSQLの照合順序に依存しJSの`localeCompare`では再現できないため、
`list-display-order.json` に実DBから取得した並びをfixtureとして保存し、
`tests/property-images.test.ts` がこの並びで重複を検査します。

専用画像を生成してmanifestへ公開した時点で、その物件は自動的に専用画像へ切り替わり、
流用は減っていきます。188枚すべてが揃えば流用は0件になります。
`TYPE_SALTS` はpoolの中身が変わると最適値も変わるため、画像を追加したら
テストが落ちていないか確認し、必要なら再探索してください。
`demo-jp-NN-x` 形式以外のIDは既存URLを保持し、空なら `property-01.svg` へ退避します。

`next/image` が画面サイズに応じた画像を遅延ロードします。詳細ページの主画像だけを
preloadし、一覧188枚はpreloadしません。固定表示高とobject-coverで既存UIを維持します。
全画像コンポーネントで読み込みエラー時に既存SVGへ一度だけ切り替えます。
エラー状態は元のsrcに紐付け、新しい物件の画像を妨げません。

外部ストレージの新設・有料サービスの導入はありません。Vercelの既存の静的配信と
Next.js Image Optimizationを使うため、画像転送・最適化は既存プランの使用量に含まれます。
生成処理はビルド時・リクエスト時には実行しません。更新は画像ファイルとmanifestを
同じデプロイに含めます。画像更新後はNext.jsの最適化キャッシュの反映も確認してください。

画像はすべて創作です。物件名の【架空】表記とフッターの「掲載画像は架空物件のイメージです」を維持してください。

## 検証

```sh
npm run typecheck
npm run lint
npm test
npm run build
# 起動済みの検証対象へ読み取り中心のHTTPチェック（マッチングAPIのPOSTも含む）
node --import tsx scripts/verify-http.ts http://127.0.0.1:3000
```

HTTP検証は7地域の検索と全国検索、一覧、188件の詳細、画像・最適化画像を検査します。
ブラウザでDesktop/Mobile、TOP3、その他候補、一覧、詳細モーダル、詳細ページ、比較、
画像失敗時のfallback、Console/Network、横はみ出しを別途確認してください。
