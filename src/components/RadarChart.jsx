import React, { useState, useEffect } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const ReviewRadarChart = ({ currentTheme, averageScores }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
      adjustedY = isMobile ? y - 10 : y - 25; // 모바일: y-10, PC: y-25
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
          className="hidden md:block"
        >
          {data.find((d) => d.category === payload.value)?.description}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
      <h2 className="text-lg md:text-xl font-bold mb-4">평가</h2>
      <div className="w-full h-[350px] md:h-[450px] pt-4 md:pt-0">
        <ResponsiveContainer width="100%" height="100%">
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
      </div>
      <div className="flex justify-center gap-4 md:gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-full"></div>
          <span className="text-xs md:text-sm">현재 테마</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full"></div>
          <span className="text-xs md:text-sm">전체 평균</span>
        </div>
      </div>
    </div>
  );
};

export default ReviewRadarChart;
