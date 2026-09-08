interface LineChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

export function LineChart({ data, color = "#06b6d4", height = 160 }: LineChartProps) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const width = 100;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * width;
    const y = height - (d.value / maxVal) * (height - 20) - 10;
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id={`lineGrad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#lineGrad-${color})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="0.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="0.8" fill={color} className="opacity-0 hover:opacity-100 transition-opacity" />
      ))}
    </svg>
  );
}

interface BarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

export function BarChart({ data, color = "#06b6d4", height = 160 }: BarChartProps) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
          <div className="w-full flex-1 flex items-end relative">
            <div
              className="w-full rounded-t-md transition-all duration-500 group-hover:brightness-125 relative"
              style={{
                height: `${(d.value / maxVal) * 100}%`,
                minHeight: d.value > 0 ? "3px" : "0",
                background: `linear-gradient(to top, ${color}80, ${color})`,
              }}
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 whitespace-nowrap bg-slate-800 px-1.5 py-0.5 rounded">
                {d.value.toLocaleString()}
              </div>
            </div>
          </div>
          <span className="text-xs text-slate-500 truncate max-w-full">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

export function DonutChart({ data, size = 160 }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        {data.map((d, i) => {
          const dash = (d.value / total) * circumference;
          const segment = (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth="8"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              className="transition-all duration-500"
            />
          );
          offset += dash;
          return segment;
        })}
      </svg>
    </div>
  );
}
