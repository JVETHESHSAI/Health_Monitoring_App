import React from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer
} from "recharts";

const CardioGraph = ({ heartRate }) => {

  const generateWave = () => {

    const data = [];

    for (let i = 0; i < 25; i++) {
      data.push({
        value:
          heartRate +
          Math.sin(i * 0.6) * 6 +
          Math.random() * 2
      });
    }

    return data;
  };

  const graphData = generateWave();

  return (
    <div style={{ height: 160 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={graphData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="#ff3b3b"
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CardioGraph;