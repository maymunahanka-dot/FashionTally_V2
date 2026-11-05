import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

const SalesChart = ({ data = [] }) => {
  console.log("📊 SalesChart rendered with data:", data);

  // Helper function to format currency with abbreviations
  const formatChartCurrency = (amount) => {
    const num = Number(amount);
    if (num >= 1000000000) {
      return `₦${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
      return `₦${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `₦${(num / 1000).toFixed(1)}K`;
    } else {
      return `₦${num.toLocaleString()}`;
    }
  };

  // Use provided data or fallback to default
  const chartData =
    data.length > 0
      ? data
      : [
          { name: "Jan", last: 0, current: 0 },
          { name: "Feb", last: 0, current: 0 },
          { name: "Mar", last: 0, current: 0 },
          { name: "Apr", last: 0, current: 0 },
          { name: "May", last: 0, current: 0 },
          { name: "Jun", last: 0, current: 0 },
          { name: "Jul", last: 0, current: 0 },
          { name: "Aug", last: 0, current: 0 },
          { name: "Sep", last: 0, current: 0 },
          { name: "Oct", last: 0, current: 0 },
          { name: "Nov", last: 0, current: 0 },
          { name: "Dec", last: 0, current: 0 },
        ];

  console.log("📊 SalesChart using chartData:", chartData);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        barGap={4}
        margin={{
          top: 5,
          right: 0,
          left: 0,
          bottom: 5,
        }}
      >
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "#94a3b8" }}
          dy={10}
        />
        <Tooltip
          cursor={{ fill: "transparent" }}
          contentStyle={{
            borderRadius: "8px",
            border: "none",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          }}
          formatter={(value) => [formatChartCurrency(value), ""]}
        />
        <Bar dataKey="last" fill="#ccfbf1" radius={[2, 2, 0, 0]} />
        <Bar dataKey="current" fill="#0d9488" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SalesChart;
