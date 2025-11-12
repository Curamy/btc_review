import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const ReviewRadarChart = ({ currentTheme, averageScores }) => {
  const data = [
    {
      category: "순수재미",
      current: currentTheme.scores.fun || 0,
      average: averageScores.fun || 0,
      fullMark: 10,
      description: "플레이어로서 얼마나 즐겁고 흥미로웠는지",
    },
    {
      category: "완성도",
      current: currentTheme.scores.completion || 0,
      average: averageScores.completion || 0,
      fullMark: 10,
      description: "장치나 시스템 오류, 적절한 문제 구성과 난이도",
    },
    {
      category: "몰입감",
      current: currentTheme.scores.immersion || 0,
      average: averageScores.immersion || 0,
      fullMark: 10,
      description: "스토리의 개연성, 연기와 연출의 자연스러움",
    },
    {
      category: "가성비",
      current: currentTheme.scores.price || 0,
      average: averageScores.price || 0,
      fullMark: 10,
      description: "만족도와 볼륨이 가격 대비 적절한지",
    },
    {
      category: "디자인",
      current: currentTheme.scores.design || 0,
      average: averageScores.design || 0,
      fullMark: 10,
      description: "인테리어, 소품, 공간 연출 등 시각적 만족도",
    },
  ];

  const CustomTick = ({ payload, x, y, cx, cy }) => {
    // 각 항목별로 위치 조정
    let adjustedY = y;
    if (payload.value === "순수재미") {
      adjustedY = y - 25;
    } else if (payload.value === "가성비" || payload.value === "몰입감") {
      adjustedY = y + 10;
    }

    return (
      <g>
        <text
          x={x}
          y={adjustedY}
          textAnchor={x > cx ? "start" : x < cx ? "end" : "middle"}
          fill="#374151"
          className="font-medium"
          fontSize="14"
        >
          {payload.value}
        </text>
        <text
          x={x}
          y={adjustedY + 15}
          textAnchor={x > cx ? "start" : x < cx ? "end" : "middle"}
          fill="#9ca3af"
          fontSize="10"
        >
          {data.find((d) => d.category === payload.value)?.description}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">평가</h2>
      <ResponsiveContainer width="100%" height={450}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="category" tick={<CustomTick />} />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
          />
          <Radar
            name="현재 테마"
            dataKey="current"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
          <Radar
            name="전체 평균"
            dataKey="average"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.3}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span className="text-sm">현재 테마</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span className="text-sm">전체 평균</span>
        </div>
      </div>
    </div>
  );
};

export default ReviewRadarChart;
