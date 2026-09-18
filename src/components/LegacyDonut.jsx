import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
const LegacyDonut = ({ motherPctSum, fatherPctSum }) => {
  const data = [
    { name: "Mother", value: motherPctSum },
    { name: "Father", value: fatherPctSum },
  ];
  const COLORS = ["#B94E64", "#2F6F6B"];

  return (
    <div className="donut-wrap">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius="60%"
            outerRadius="85%"
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => v.toFixed(3)} />
          <Legend verticalAlign="bottom" height={30} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default LegacyDonut

