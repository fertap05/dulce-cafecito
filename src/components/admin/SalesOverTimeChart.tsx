type SalesPoint = {
  key: string;
  label: string;
  valueCents: number;
  orderCount: number;
};

type SalesOverTimeChartProps = {
  points: SalesPoint[];
  rangeLabel: string;

  title?: string;
  description?: string;

  singularLabel?: string;
  pluralLabel?: string;

  emptyTitle?: string;
  emptyDescription?: string;
};

function money(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function SalesOverTimeChart({
  points,
  rangeLabel,
  title = "Completed Sales Over Time",
  description,
  singularLabel = "completed order",
  pluralLabel = "completed orders",
  emptyTitle = "No completed sales yet.",
  emptyDescription = "Completed orders for this period will appear here.",
}: SalesOverTimeChartProps) {
  const maxValue = Math.max(
    ...points.map(
      (point) =>
        point.valueCents
    ),
    1
  );

  const totalValue =
    points.reduce(
      (total, point) =>
        total +
        point.valueCents,
      0
    );

  const totalCount =
    points.reduce(
      (total, point) =>
        total +
        point.orderCount,
      0
    );

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-[#ecd6d6] bg-white">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#ecd6d6] px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold">
            {title}
          </h2>

          <p className="mt-1 text-sm text-[#94716b]">
            {description ??
              `Completed order value for ${rangeLabel.toLowerCase()}.`}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.15em] text-[#94716b]">
            Total
          </p>

          <p className="mt-1 text-xl font-semibold">
            {money(totalValue)}
          </p>

          <p className="mt-1 text-xs text-[#94716b]">
            {totalCount}{" "}
            {totalCount === 1
              ? singularLabel
              : pluralLabel}
          </p>
        </div>
      </div>

      {points.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="font-medium">
            {emptyTitle}
          </p>

          <p className="mt-1 text-sm text-[#94716b]">
            {emptyDescription}
          </p>
        </div>
      ) : (
        <div className="space-y-5 p-6">
          {points.map(
            (point) => {
              const percentage =
                (point.valueCents /
                  maxValue) *
                100;

              return (
                <div
                  key={
                    point.key
                  }
                  className="grid items-center gap-4 sm:grid-cols-[110px_1fr_110px]"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {
                        point.label
                      }
                    </p>

                    <p className="mt-1 text-xs text-[#94716b]">
                      {
                        point.orderCount
                      }{" "}
                      {point.orderCount ===
                      1
                        ? singularLabel
                        : pluralLabel}
                    </p>
                  </div>

                  <div className="h-9 overflow-hidden rounded-full bg-[#fff3f1]">
                    <div
                      className="flex h-full min-w-[4px] items-center rounded-full bg-[#8e4d56] transition-all"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <p className="text-right font-semibold">
                    {money(
                      point.valueCents
                    )}
                  </p>
                </div>
              );
            }
          )}
        </div>
      )}
    </section>
  );
}