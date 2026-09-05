# AI Real Estate Matcher（AI不動産物件マッチング）

> 希望条件を入力すると、登録物件の中から条件との相性を分析し、最適な物件をランキング形式で提案する **AI物件選定支援ツール** です。

不動産会社の営業担当・賃貸仲介スタッフが、顧客の希望条件をヒアリングしながらその場で物件を絞り込み、
「なぜこの物件をおすすめするのか」を根拠つきで提示できるよう設計・実装した Web アプリケーションです。

全国47都道府県・架空188物件を対象とし、固定seedで再現可能なデモデータを利用します。

---

## 背景と解決する課題

賃貸仲介の現場では、次のような負荷が発生しています。

| 課題 | 内容 |
| --- | --- |
| 条件の突き合わせが属人的 | 「家賃・エリア・駅距離・広さ・築年数・駐車場…」を担当者が頭の中で比較しており、経験差が出る |
| 完全一致検索の取りこぼし | 一般的な検索は AND 条件のため、家賃が 2,000 円超えただけの優良物件が候補から消える |
| 提案理由の説明が難しい | 「なんとなくおすすめ」になりやすく、顧客が納得しづらい |
| 比較検討に時間がかかる | 複数物件の条件を並べて比較する作業を手作業で行っている |

本アプリはこれらに対して、

1. **9 つの評価軸を数値化**して属人性を排除し、
2. **条件から少し外れた物件も減点して残す**ソフトマッチングで取りこぼしを防ぎ、
3. **スコア内訳と推薦理由を自動生成**して説明可能性を確保し、
4. **最大 3 件の比較表**で検討を高速化する

というアプローチを取っています。

---

## 主な機能

- **希望条件入力フォーム** — エリア / 家賃上限 / 間取り / 駅徒歩 / 築年数 / 最低面積 / 駐車場 / ペット / 在宅ワーク適性 / 重視条件
- **ソフトマッチング検索** — 完全一致でなくても、条件から大きく外れていなければ減点したうえで候補に残す
- **マッチ度スコアリング（0〜100%）** — 入力条件から実際に計算。ランダム値は使用していません
- **重視条件による重み付け変更** — コスパ / 通勤 / 広さ / 新しさ / 生活環境 で配点そのものが変化
- **ランキング表示** — TOP3 を強調表示し、それ以降も一覧で確認可能
- **推薦理由の自動生成** — 「条件に合っている点」と「妥協が必要な点」を分けて提示
- **スコア内訳の開示** — 「家賃 18.7/21.2」のように評価軸ごとの獲得点を表示し、スコアの根拠を可視化（判定ロジックのブラックボックス感を抑制）
- **物件比較（2〜3件）** — 表形式で比較し、各項目の最優秀値をハイライト
- **物件一覧 / 物件詳細ページ** — DB に登録された全物件の閲覧
- **デモ条件の自動入力** — 7地域のプリセットから選択して条件を投入し、そのまま検索まで実行

---

## 使用技術

| 分類 | 技術 |
| --- | --- |
| フレームワーク | Next.js 16 (App Router) / React 19 |
| 言語 | TypeScript（strict） |
| スタイリング | Tailwind CSS v4（`@theme` によるデザイントークン） |
| データベース | PostgreSQL (Supabase) + Prisma ORM 6 |
| バリデーション | Zod |
| アイコン | lucide-react |
| AI 連携（任意） | Anthropic Claude API（`@anthropic-ai/sdk`） |
| ホスティング | Vercel |

### 設計上のポイント

- **ロジックと UI の分離** — スコア計算は `src/lib/matching/` に集約し、UI コンポーネントには計算処理を書いていません
- **DB 差し替えを想定した DTO 層** — Prisma のモデル型を UI に直接流さず、`src/lib/repositories/` で DTO へ変換
- **ビルドと DB 操作の分離** — `npm run build` は Prisma Client 生成 + Next.js ビルドのみ。migration / seed はビルドから切り離した独立コマンド
- **AI プロバイダの抽象化** — `RecommendationProvider` インターフェースにより、ルールベース / LLM を差し替え可能
- **APIキー不要で完全動作** — 既定はルールベース生成。キーが無くてもエラーにならず、LLM 呼び出しが失敗した場合も自動でフォールバック

---

## ディレクトリ構成

```
prisma/
  schema.prisma              # DBスキーマ（PostgreSQL / Supabase）
  seed.ts                    # 架空188物件を生成するseed入口
  seed-data/                 # 地理マスタ・4タイプ・固定PRNG・置換前の照合
  migrations/                # マイグレーション履歴（PostgreSQL）
scripts/
  generate-property-images.mjs  # 物件プレースホルダー画像(SVG)の生成
src/
  app/
    page.tsx                 # トップ（Hero + 条件入力 + 検索結果）
    properties/page.tsx      # 物件一覧（Server Component から Prisma を直接参照）
    properties/[id]/page.tsx # 物件詳細ページ
    api/match/route.ts       # マッチング API（POST）
  components/
    layout/                  # Header / Footer
    ui/                      # Button, Card, Badge, Modal, ScoreRing, RankBadge ...
    match/                   # SearchForm, ResultsSection, PropertyCard,
                             # ScoreBreakdown, CompareModal, CompareTray ...
    property/                # 物件一覧用カード
  lib/
    matching/
      constants.ts           # 間取りの序列・基礎配点・重み倍率
      weights.ts             # 重視条件に応じた重み再正規化
      criteria.ts            # 評価軸ごとの判定ロジック（9軸）
      filter.ts              # 事前フィルタ（明らかに不成立な物件の除外）
      score.ts               # スコア算出・ランキング
      index.ts               # マッチング処理の入口
    ai/
      types.ts               # RecommendationProvider インターフェース
      rule-based.ts          # ルールベース生成（既定 / フォールバック）
      claude.ts              # Claude API 実装（任意）
      index.ts               # 環境変数によるプロバイダ解決
    repositories/            # Prisma アクセス + DTO 変換
    db.ts                    # PrismaClient シングルトン
    validation.ts            # Zod スキーマ・初期値・デモ条件
    format.ts                # 表示用フォーマッタ
  types/index.ts             # ドメイン型（Property / MatchCriteria / MatchResult ...）
```

---

## マッチングロジック概要

### 1. 事前フィルタ（`lib/matching/filter.ts`）

「完全一致しないものを落とす」のではなく、**提案として成立しない物件だけ**を除外します。

- 都道府県が異なる（エリア指定時）。指定なしでは全国188件が検索母集団になります（他条件による絞り込みと上位12件の表示制限は維持）
- **市区町村違いは即除外せず、同一都道府県内でエリア評価を減点するソフトマッチ**
- 月額総額が予算の **125% を超える**
- 駅徒歩が希望より **15分以上**遠い
- 専有面積が最低面積の **70% 未満**
- 間取りが希望より **3ランク以上**小さい
- 「必須」と指定した駐車場 / ペット / 在宅ワークを満たさない

### 2. 評価軸ごとの達成率（`lib/matching/criteria.ts`）

9 つの軸それぞれについて **0〜1 の達成率**を連続値で算出します。
条件内なら「余裕があるほど高得点」、条件外なら「超過幅に応じて減衰」します。

例）家賃（予算 80,000 円の場合）

| 月額総額 | 達成率 | 扱い |
| --- | --- | --- |
| 60,000 円 | 1.000 | 予算に十分な余裕がある |
| 65,000 円 | 0.930 | 予算内 |
| 72,000 円 | 0.832 | 予算内 |
| 80,000 円 | 0.720 | 予算ちょうど |
| 84,000 円 | 0.525 | 超過するが候補には残る |
| 95,000 円 | 0.044 | 大幅に減点（他条件が優秀なら候補に残る） |
| 100,001 円 | — | 事前フィルタで除外（予算の125%超） |

### 3. 重み付け（`lib/matching/weights.ts`）

基礎配点は合計 100 点です。

| 評価軸 | 家賃 | エリア | 駅距離 | 間取り | 面積 | 築年数 | 駐車場 | ペット | 在宅ワーク |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 基礎配点 | 25 | 20 | 15 | 10 | 10 | 5 | 5 | 5 | 5 |

「重視したい条件」に応じて倍率を掛け、**合計が 100 点になるよう再正規化**します。
重視した軸の比重が上がり、その分ほかの軸の比重が相対的に下がります。

| 重視条件 | 倍率 |
| --- | --- |
| コスパ重視 | 家賃 ×2.0 |
| 通勤重視 | 駅距離 ×2.2 / エリア ×1.2 |
| 広さ重視 | 面積 ×2.2 / 間取り ×1.6 |
| 新しさ重視 | 築年数 ×4.0 |
| 生活環境重視 | 在宅ワーク ×2.0 / 駐車場 ×1.8 / ペット ×1.6 / エリア ×1.3 |

例）コスパ重視の場合、家賃は 25 点 × 2.0 = 50 点 → 再正規化して **40 点**が満点になります。

### 4. スコア算出とランキング（`lib/matching/score.ts`）

```
マッチ度 = Σ(評価軸の達成率 × 重み付け後の満点)
```

マッチ度 **45% 未満**は「条件から離れすぎ」と判断して候補から除外し、
残りをマッチ度の降順に並べて上位 12 件を返します。

### 5. 推薦理由の生成（`lib/ai/`）

スコア内訳をそのまま根拠として文章化するため、**表示されるマッチ度と説明が常に一致**します。

```
「管理費込 84,000円。希望より 4,000円 高くなりますが、エリア・駅距離・間取りを
  高い水準で満たしているため、マッチ度86%で候補に残りました。」
```

---

## セットアップ

### 必要環境

- Node.js 20 以上（開発は v24 で確認）
- npm
- PostgreSQL データベース（Supabase を推奨。ローカル PostgreSQL でも可）

ローカル開発でも本番と同じ PostgreSQL に接続する構成です。SQLite は使用しません。

### 手順

```bash
# 1. 依存関係のインストール（postinstall で prisma generate も実行されます）
npm install

# 2. 環境変数の用意（.env は Git 追跡対象外）
cp .env.example .env
#    → .env に POSTGRES_PRISMA_URL / POSTGRES_URL_NON_POOLING を設定する
#      値は Vercel（Supabase 連携）または Supabase ダッシュボードから取得
#      Vercel CLI を使う場合: vercel env pull .env

# 3. マイグレーション適用（ローカル開発用）
npm run db:migrate

# 4. seed データの投入（架空188物件）
# 専用DB・架空データを確認済みの場合のみ
MATCHER_SEED_TARGET=verified-fictional-demo npm run db:seed

# 5. 開発サーバーの起動
npm run dev
```

→ http://localhost:3000 を開き、「デモ地域を選ぶ」ボタンから7地域のプリセットを選ぶと、すぐに動作を確認できます。

> **注意**: Prisma CLI が読み込む環境変数ファイルは `.env` です（`.env.local` は読みません）。

### npm scripts

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | Prisma Client 生成 + Next.js 本番ビルド（**DB へは書き込まない**） |
| `npm start` | 本番サーバー起動 |
| `npm run typecheck` | TypeScript の型チェック |
| `npm run lint` | ESLint |
| `npm test` | 全国データ・マッチング・API入力・比較/詳細の回帰テスト（DB接続なし） |
| `npm run db:generate` | Prisma Client の生成のみ |
| `npm run db:migrate` | **ローカル開発用**。スキーマ差分から migration を作成して適用（`prisma migrate dev`） |
| `npm run db:migrate:deploy` | **本番用**。既存の migration ファイルを適用するだけ（`prisma migrate deploy`） |
| `npm run db:migrate:status` | 適用済み migration の確認 |
| `npm run db:seed` | 確認済みの架空データのみ、トランザクション内で全国188件へ同期 |
| `npm run db:reset` | DB をリセットして再マイグレーション + seed（**本番では実行禁止**） |
| `npm run db:studio` | Prisma Studio で DB を GUI 確認 |

#### `db:migrate` と `db:migrate:deploy` の違い

| | `db:migrate`（`prisma migrate dev`） | `db:migrate:deploy`（`prisma migrate deploy`） |
| --- | --- | --- |
| 用途 | ローカル開発 | 本番 / Preview 環境 |
| 動作 | schema の差分から migration ファイルを**新規生成**して適用 | `prisma/migrations/` にある migration を**適用するだけ** |
| DB リセット | 差分が解決できない場合、DB を drop して作り直すことがある | 一切行わない |
| 本番 DB への実行 | **禁止**（データ消失の恐れ） | これを使う |

---

## DB seed について

全国47都道府県 × 4タイプ = **架空188物件**を生成します。実際の相場 / 募集状況を示すものではありません。

- `prisma/seed-data/geography.ts`: 都道府県コード、代表都市・駅・路線・デモ座標を一組で管理。価格係数は地方・拠点都市・大都市・東京の4区分の創作値です。
- `templates.ts`: A 駅近・築浅 / B コスト重視 / C 広さ・ファミリー / D 設備・在宅ワークの範囲と紹介文。
- `generate.ts`: 固定seed `20260905` のMulberry32で生成。日時や `Math.random()`、外部APIに依存しません。同じコード・seedで同一の物件内容・識別子を再生成します（DBの作成・更新日時は監査用）。
- IDは `demo-jp-都道府県コード-タイプ`。同一県の物件名も重複しません。
- 家賃38,000〜215,000円、管理費込み最大218,000円。家賃UIとZodの範囲は共通定数で30,000〜300,000円。
- 北海道・東京・愛知・大阪・福岡・鹿児島・沖縄の7地域をデモ選択画面から検索できます。

### seedの安全条件

実行前に、接続先が本アプリ専用DBであり、置換可能な架空デモデータだけで構成されることを確認してください。
確認できなければ実行を中止します。**本番DBのresetは禁止**です。

確認後に限り、そのシェルで `MATCHER_SEED_TARGET=verified-fictional-demo` を設定し、`npm run db:seed` を実行します。
seedはpublicスキーマに想定外のテーブルがある場合や、既存データが旧データの全フィールドのSHA-256照合または全国データと一致しない場合に中止します。
旧データのfingerprintは移行元を認識するためのものです。未知のレコードを名前だけで架空とみなしません。

照合・旧IDの置換・固定IDでのupsert・47都道府県各4件の検証を一つのトランザクションで行います。
再実行時はIDと作成日時を保持し、途中失敗時は全体をロールバックします。
DB schema・migrationの変更はありません。DB seedとVercelコードDeployは別操作です。
DBだけ更新しても、新しい文言やデモUIは本番に反映されません。

物件画像は外部 CDN に依存せず、`scripts/generate-property-images.mjs` で生成した
リポジトリ内の SVG（`public/images/properties/`）を使用しています。

```bash
node scripts/generate-property-images.mjs   # 画像を再生成する場合
```

---

## 環境変数

`.env.example` を参照してください。**AI 関連の環境変数はすべて任意**です。

| 変数 | 必須 | 説明 |
| --- | --- | --- |
| `POSTGRES_PRISMA_URL` | ✅ | アプリ実行時（Prisma Client）の接続。Supabase の Connection Pooler 経由 |
| `POSTGRES_URL_NON_POOLING` | ✅ | migration / introspect 用の直接接続。プーラーを経由しない |
| `AI_PROVIDER` | – | `claude` を指定すると LLM 生成を試みる。未設定ならルールベース |
| `ANTHROPIC_API_KEY` | – | Claude API キー。未設定ならルールベースのまま動作 |
| `ANTHROPIC_MODEL` | – | 既定は `claude-opus-5` |

DB 接続用の 2 変数は、Vercel Marketplace の Supabase 連携を有効にすると
Vercel プロジェクトへ自動登録されます（Supabase が発行するその他の変数は本アプリでは使用しません）。

**接続文字列・パスワード・API キーは、コード・README・`.env.example` に一切書きません。**
`.env` は `.gitignore` 済みで、Git 追跡対象外です。
また、Prisma の接続情報は Server Component / Route Handler 内でのみ使用し、
`NEXT_PUBLIC_` 系の変数やクライアントコンポーネントへは渡していません。

`AI_PROVIDER=claude` かつ API キーがある場合のみ LLM を呼び出し、
**呼び出しに失敗した場合は自動でルールベースの推薦理由にフォールバック**します。
API キーが無い状態でもアプリ全体が問題なく動作します。

---

## Supabase 接続の構成

`prisma/schema.prisma` の datasource は次の構成です。

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL")       // アプリ実行時（Pooler 経由）
  directUrl = env("POSTGRES_URL_NON_POOLING")  // migration 用の直接接続
}
```

- **`url`（`POSTGRES_PRISMA_URL`）** — Supabase の Connection Pooler（PgBouncer）宛。
  サーバーレス環境ではリクエストごとに接続が増えるため、プーラー経由が前提です。
- **`directUrl`（`POSTGRES_URL_NON_POOLING`）** — `prisma migrate` / `prisma db push` など、
  プリペアドステートメントや DDL を扱う処理で使われます。プーラー経由では正しく動作しないため分離しています。

Prisma Client は `src/lib/db.ts` でシングルトン化しており、開発時のホットリロードや
サーバーレス環境でコネクションが増え続けるのを防いでいます。

配列データ（おすすめポイント・注意点・タグ）は DB 依存を避けるため JSON 文字列で保持し、
`src/lib/repositories/property-repository.ts` の `toPropertyDTO()` で `string[]` に変換しています。
将来 `String[]` へ変更する場合も、**修正はこの 1 ファイルのみ**で済みます。

---

## Vercel へのデプロイ

### ビルドと DB 操作は分離しています

`npm run build` は **Prisma Client の生成と Next.js のビルドのみ**を行い、
migration や seed は実行しません。
Preview Deploy や再 Deploy のたびに DB が変更される事故を避けるためです。

| | 実行内容 | いつ実行するか |
| --- | --- | --- |
| ビルド | `prisma generate` + `next build` | Vercel が Deploy ごとに自動実行 |
| DB 準備 | `db:migrate:deploy` + `db:seed` | スキーマを変更したときに**手動で 1 回** |

### 手順

1. Vercel Marketplace から Supabase Database を作成し、Vercel プロジェクトと連携する
   （`POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING` が自動登録されます）
2. ローカルへ接続情報を取り込む

   ```bash
   vercel env pull .env
   ```

3. 本番 DB へスキーマと seed を投入する（ローカルから 1 回だけ実行）

   ```bash
   npm run db:migrate:deploy   # migration の適用（prisma/migrations を流すだけ）
   MATCHER_SEED_TARGET=verified-fictional-demo npm run db:seed  # 対象確認後に投入
   npm run db:migrate:status   # 適用状況の確認
   ```

4. Vercel へデプロイする（Git 連携または `vercel --prod`）

Vercel 側の Build Command / Install Command は既定のままで動作します
（`npm install` の `postinstall`、および `npm run build` の双方で `prisma generate` が走ります）。

### ビルド時の DB アクセスについて

DB を参照するルートには `export const dynamic = "force-dynamic"` を指定し、
リクエスト時レンダリングにしています。
ビルド時に DB へ接続してビルドが失敗すること、および
seed 済みデータを前提に静的生成されてしまうことを防ぐためです。

| ルート | 指定 | 理由 |
| --- | --- | --- |
| `src/app/page.tsx` | `force-dynamic` | エリア一覧・登録件数を DB から取得 |
| `src/app/properties/page.tsx` | `force-dynamic` | 物件一覧を DB から取得 |
| `src/app/properties/[id]/page.tsx` | `force-dynamic` | 物件詳細を DB から取得 |
| `src/app/api/match/route.ts` | `force-dynamic` + `runtime = "nodejs"` | マッチング時に DB を参照 |

DB を参照しないコンポーネント・ページには指定していません。

---

## 今後の拡張案

- **DB**: 全文検索、物件の CRUD 管理画面、Supabase Row Level Security の活用
- **地図**: Google Maps API による地図表示・通勤時間ベースのスコアリング（緯度経度は seed 済み）
- **外部連携**: 不動産物件 API との連携によるリアルタイム物件取得
- **AI**: LLM による推薦理由の高度化、条件のヒアリング（自然言語入力からの条件抽出）
- **顧客機能**: お気に入り保存、検索条件の保存・共有、提案書 PDF 出力
- **営業支援**: 顧客管理（CRM）、担当者用管理画面、提案履歴と成約率の分析
- **認証**: NextAuth 等による認証・ロール別権限（営業担当 / 管理者）
- **品質**: ブラウザE2EテストのCI連携

---

## 注意事項

本リポジトリは自主制作の AI 物件選定支援 Web アプリです。
掲載物件はすべて架空であり、実在の物件・価格・募集状況とは関係ありません。
一般的な都道府県・市区町村・駅・路線名を使用していますが、座標は代表エリア付近のデモ座標で、実際の物件所在地を示しません。
