export function Footer() {
  return (
    <footer className="mt-20 border-t border-[var(--color-line)] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="text-[13px] font-semibold text-navy-800">
          AI Real Estate Matcher
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-ink-subtle)]">
          自主制作のAI物件選定支援Webアプリです。掲載している物件情報はすべて架空のもので、実在の物件・価格・募集状況とは関係ありません。
        </p>
      </div>
    </footer>
  );
}
