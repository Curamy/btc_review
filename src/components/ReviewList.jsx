import React, { useState, useEffect } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import FilterBar from "./FilterBar";

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cafes, setCafes] = useState([]);
  const [regions, setRegions] = useState([]);
  const [genres, setGenres] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const q = query(collection(db, "reviews"), orderBy("totalScore", "desc"));
      const querySnapshot = await getDocs(q);
      const reviewsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setReviews(reviewsData);
      setFilteredReviews(reviewsData);

      // 고유한 카페, 지역, 장르 추출
      const uniqueCafes = [...new Set(reviewsData.map((r) => r.cafe))];
      const uniqueRegions = [...new Set(reviewsData.map((r) => r.region))];
      const uniqueGenres = [
        ...new Set(reviewsData.flatMap((r) => r.genres || [])),
      ];

      setCafes(uniqueCafes);
      setRegions(uniqueRegions);
      setGenres(uniqueGenres);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setLoading(false);
    }
  };

  const handleFilterChange = ({ region, cafe, genre }) => {
    let filtered = reviews;

    if (region) {
      filtered = filtered.filter((r) => r.region === region);
    }
    if (cafe) {
      filtered = filtered.filter((r) => r.cafe === cafe);
    }
    if (genre) {
      filtered = filtered.filter((r) => r.genres && r.genres.includes(genre));
    }

    setFilteredReviews(filtered);
  };

  const calculateTotalScore = (scores) => {
    const values = Object.values(scores);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return avg.toFixed(1);
  };

  const renderSlider = (score) => {
    // 0-10 점수를 0-100% 너비로 변환
    const percentage = (score / 10) * 100;

    // 점수에 따라 색상 그라데이션 계산
    // 0점: 흰색 (255, 255, 255)
    // 3점: 노랑 (255, 255, 0)
    // 7점: 주황 (255, 165, 0)
    // 10점: 빨강 (255, 0, 0)
    let r, g, b;

    if (score <= 3) {
      // 0-3점: 흰색 → 노랑
      const ratio = score / 3;
      r = 255;
      g = 255;
      b = Math.round(255 * (1 - ratio));
    } else if (score <= 7) {
      // 3-7점: 노랑 → 주황
      const ratio = (score - 3) / 4;
      r = 255;
      g = Math.round(255 - (90 * ratio)); // 255 → 165
      b = 0;
    } else {
      // 7-10점: 주황 → 빨강
      const ratio = (score - 7) / 3;
      r = 255;
      g = Math.round(165 * (1 - ratio)); // 165 → 0
      b = 0;
    }

    const color = `rgb(${r}, ${g}, ${b})`;

    return (
      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">쿠람이의 탈출 기록</h1>
          <p className="text-sm md:text-base text-gray-600">
            총 {filteredReviews.length}개의 방을 탈출했습니다
          </p>
        </div>
        <button
          onClick={() => navigate("/create")}
          className="w-full md:w-auto px-4 md:px-6 py-2 md:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 text-sm md:text-base"
        >
          <span>+</span>
          <span>리뷰 작성</span>
        </button>
      </div>

      <FilterBar
        onFilterChange={handleFilterChange}
        cafes={cafes}
        regions={regions}
        genres={genres}
      />

      <div className="space-y-4">
        {filteredReviews.map((review, index) => (
          <div
            key={review.id}
            onClick={() => navigate(`/review/${review.id}`)}
            className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex gap-3 md:gap-4 flex-1 min-w-0">
                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full text-blue-600 font-bold flex-shrink-0 text-sm md:text-base">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-bold mb-1 truncate">{review.themeName}</h3>
                  <div className="flex gap-2 mb-2 md:mb-3 text-xs md:text-sm">
                    <span className="text-gray-600 truncate">{review.cafe}</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-blue-600 truncate">
                      {review.region}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 md:gap-2 mb-2 md:mb-3">
                    {review.genres &&
                      review.genres.map((genre, i) => (
                        <span
                          key={i}
                          className="px-2 md:px-3 py-0.5 md:py-1 bg-gray-100 rounded-full text-xs md:text-sm"
                        >
                          {genre}
                        </span>
                      ))}
                  </div>
                  {/* 모바일: 2줄로 표시 */}
                  <div className="md:hidden space-y-1 mb-2 text-xs text-gray-600">
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1">
                        <span>📅</span>
                        <span>{review.visitDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>👥</span>
                        <span>{review.participants}명</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className={
                            review.success ? "text-green-600" : "text-red-600"
                          }
                        >
                          {review.success ? "✓" : "✗"}
                        </span>
                        <span>{review.success ? "탈출 성공" : "탈출 실패"}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex items-center gap-1">
                        <span>💡</span>
                        <span>힌트 {review.hintsUsed}개</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>⏱️</span>
                        <span>{review.timeRemaining}분 남음</span>
                      </div>
                    </div>
                  </div>
                  {/* PC: 한 줄로 표시 */}
                  <div className="hidden md:flex gap-6 mb-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span>📅</span>
                      <span>{review.visitDate}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>👥</span>
                      <span>{review.participants}명</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span
                        className={
                          review.success ? "text-green-600" : "text-red-600"
                        }
                      >
                        {review.success ? "✓" : "✗"}
                      </span>
                      <span>{review.success ? "탈출 성공" : "탈출 실패"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>💡</span>
                      <span>힌트 {review.hintsUsed}개</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>⏱️</span>
                      <span>{review.timeRemaining}분 남음</span>
                    </div>
                  </div>
                  {/* 모바일: width 33%로 균등 배치 */}
                  <div className="flex md:hidden gap-2 text-xs">
                    {review.difficulty !== undefined && (
                      <div className="flex items-center gap-1" style={{ width: "33%" }}>
                        <span>🔒</span>
                        {renderSlider(review.difficulty)}
                      </div>
                    )}
                    {review.horror !== undefined && (
                      <div className="flex items-center gap-1" style={{ width: "33%" }}>
                        <span>👻</span>
                        {renderSlider(review.horror)}
                      </div>
                    )}
                    {review.activity !== undefined && (
                      <div className="flex items-center gap-1" style={{ width: "33%" }}>
                        <span>🏃</span>
                        {renderSlider(review.activity)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 flex flex-col items-end gap-3">
                <div className="text-2xl md:text-3xl font-bold text-blue-500 whitespace-nowrap">
                  {calculateTotalScore(review.scores)}
                </div>
                {/* PC: 점수 아래 세로 배치 */}
                <div className="hidden md:flex flex-col gap-2 text-sm">
                  {review.difficulty !== undefined && (
                    <div className="flex items-center gap-2">
                      <span>🔒</span>
                      {renderSlider(review.difficulty)}
                    </div>
                  )}
                  {review.horror !== undefined && (
                    <div className="flex items-center gap-2">
                      <span>👻</span>
                      {renderSlider(review.horror)}
                    </div>
                  )}
                  {review.activity !== undefined && (
                    <div className="flex items-center gap-2">
                      <span>🏃</span>
                      {renderSlider(review.activity)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;