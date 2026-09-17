/**
 * A small, dependency-free, accessible bar chart.
 *
 * The brief asks for labeled axes, readable legends, and accessible summaries,
 * and to prefer a simple implementation over a large charting dependency.
 * This renders plain SVG, supports stacked series, and is decorative to
 * screen readers because every chart is accompanied by a visible text summary.
 */

export interface ChartSeries {
  key: string;
  color: string;
}

export interface ChartDatum {
  label: string;
  values: Record<string, number>;
}

export interface ReferenceLine {
  value: number;
  label: string;
  color?: string;
}

function niceMax(value: number): number {
  if (value <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const step =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 2.5 ? 2.5 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

export function BarChart({
  data,
  series,
  formatValue,
  yAxisLabel,
  referenceLine,
  height = 260,
}: {
  data: ChartDatum[];
  series: ChartSeries[];
  formatValue: (n: number) => string;
  yAxisLabel: string;
  referenceLine?: ReferenceLine;
  height?: number;
}) {
  const W = 620;
  const H = height;
  const padLeft = 62;
  const padBottom = 34;
  const padTop = 14;
  const padRight = 14;
  const plotW = W - padLeft - padRight;
  const plotH = H - padTop - padBottom;

  const totals = data.map((d) => series.reduce((sum, s) => sum + (d.values[s.key] ?? 0), 0));
  const rawMax = Math.max(...totals, referenceLine?.value ?? 0);
  const max = niceMax(rawMax);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);

  const slot = plotW / data.length;
  const barW = Math.min(64, slot * 0.58);

  const y = (v: number) => padTop + plotH - (v / max) * plotH;

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        role="presentation"
        aria-hidden="true"
        style={{ overflow: "visible" }}
      >
        {/* Y axis label */}
        <text
          x={-(padTop + plotH / 2)}
          y={14}
          transform="rotate(-90)"
          textAnchor="middle"
          fontSize="11"
          fill="#17324D"
          opacity="0.65"
        >
          {yAxisLabel}
        </text>

        {/* Gridlines + y ticks */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={padLeft}
              x2={W - padRight}
              y1={y(t)}
              y2={y(t)}
              stroke="#17324D"
              strokeOpacity={t === 0 ? 0.28 : 0.1}
              strokeDasharray={t === 0 ? undefined : "3 3"}
            />
            <text
              x={padLeft - 8}
              y={y(t) + 4}
              textAnchor="end"
              fontSize="11"
              fill="#17324D"
              opacity="0.7"
            >
              {formatValue(t)}
            </text>
          </g>
        ))}

        {/* Reference line */}
        {referenceLine && (
          <g>
            <line
              x1={padLeft}
              x2={W - padRight}
              y1={y(referenceLine.value)}
              y2={y(referenceLine.value)}
              stroke={referenceLine.color ?? "#2B6B5F"}
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <text
              x={W - padRight}
              y={y(referenceLine.value) - 6}
              textAnchor="end"
              fontSize="11"
              fill={referenceLine.color ?? "#2B6B5F"}
            >
              {referenceLine.label}
            </text>
          </g>
        )}

        {/* Bars */}
        {data.map((d, i) => {
          const x = padLeft + slot * i + (slot - barW) / 2;
          let cursor = 0;
          return (
            <g key={d.label}>
              {series.map((s, si) => {
                const v = d.values[s.key] ?? 0;
                if (v <= 0) return null;
                const barTop = y(cursor + v);
                const barH = Math.max(0, y(cursor) - y(cursor + v));
                cursor += v;
                const isTop = si === series.length - 1 || cursor === totals[i];
                return (
                  <rect
                    key={s.key}
                    x={x}
                    y={barTop}
                    width={barW}
                    height={barH}
                    fill={s.color}
                    rx={isTop ? 4 : 0}
                  />
                );
              })}
              <text
                x={x + barW / 2}
                y={padTop + plotH + 20}
                textAnchor="middle"
                fontSize="12"
                fill="#17324D"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      {series.length > 1 && (
        <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
          {series.map((s) => (
            <li key={s.key} className="flex items-center gap-2 text-xs text-navy/70">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: s.color }}
                aria-hidden="true"
              />
              {s.key}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
