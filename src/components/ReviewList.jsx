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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">쿠람이의 탈출 기록</h1>
          <p className="text-gray-600">
            총 {filteredReviews.length}개의 방을 탈출했습니다
          </p>
        </div>
        <button
          onClick={() => navigate("/create")}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
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
            className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-4 flex-1">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full text-blue-600 font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{review.themeName}</h3>
                  <div className="flex gap-2 mb-3">
                    <span className="text-sm text-gray-600">{review.cafe}</span>
                    <span className="text-sm text-gray-400">|</span>
                    <span className="text-sm text-blue-600">
                      {review.region}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {review.genres &&
                      review.genres.map((genre, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                        >
                          {genre}
                        </span>
                      ))}
                  </div>
                  <div className="flex gap-6 text-sm text-gray-600">
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
                  {review.review && (
                    <p className="mt-3 text-gray-700 line-clamp-2">
                      {review.review}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-3xl font-bold text-blue-500">
                {calculateTotalScore(review.scores)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
