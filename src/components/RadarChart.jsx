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
    },
    {
      category: "완성도",
      current: currentTheme.scores.completion || 0,
      average: averageScores.completion || 0,
      fullMark: 10,
    },
    {
      category: "몰입감",
      current: currentTheme.scores.immersion || 0,
      average: averageScores.immersion || 0,
      fullMark: 10,
    },
    {
      category: "가격",
      current: currentTheme.scores.price || 0,
      average: averageScores.price || 0,
      fullMark: 10,
    },
    {
      category: "디자인",
      current: currentTheme.scores.design || 0,
      average: averageScores.design || 0,
      fullMark: 10,
    },
  ];

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">평가</h2>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="category" />
          <PolarRadiusAxis angle={90} domain={[0, 10]} />
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
