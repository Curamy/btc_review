import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../hooks/useAuth";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase/config";

const ReviewForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [existingCafes, setExistingCafes] = useState([]);
  const [existingRegions, setExistingRegions] = useState([]);
  const [existingGenres, setExistingGenres] = useState([]);

  const [formData, setFormData] = useState({
    themeName: "",
    cafe: "",
    region: "",
    genres: [],
    visitDate: "",
    participants: 2,
    success: true,
    hintsUsed: 0,
    timeRemaining: 0,
    scores: {
      fun: 5,
      completion: 5,
      immersion: 5,
      price: 5,
      design: 5,
    },
    difficulty: 5,
    horror: 5,
    activity: 5,
    deviceRatio: 5,
    review: "",
  });

  const [showCafeDropdown, setShowCafeDropdown] = useState(false);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [genreInput, setGenreInput] = useState("");

  useEffect(() => {
    loadExistingData();
    if (id) {
      loadReview();
    }
  }, [id]);

  const loadExistingData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "reviews"));
      const reviews = querySnapshot.docs.map((doc) => doc.data());

      const cafes = [...new Set(reviews.map((r) => r.cafe))];
      const regions = [...new Set(reviews.map((r) => r.region))];
      const genres = [...new Set(reviews.flatMap((r) => r.genres || []))];

      setExistingCafes(cafes);
      setExistingRegions(regions);
      setExistingGenres(genres);
    } catch (error) {
      console.error("Error loading existing data:", error);
    }
  };

  const loadReview = async () => {
    try {
      const docRef = doc(db, "reviews", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData(data);
      }
    } catch (error) {
      console.error("Error loading review:", error);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login error:", error);
      alert("로그인에 실패했습니다.");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleScoreChange = (category, value) => {
    setFormData((prev) => ({
      ...prev,
      scores: {
        ...prev.scores,
        [category]: parseInt(value),
      },
    }));
  };

  const handleGenreAdd = (genre) => {
    if (genre && !formData.genres.includes(genre)) {
      setFormData((prev) => ({
        ...prev,
        genres: [...prev.genres, genre],
      }));
    }
    setGenreInput("");
    setShowGenreDropdown(false);
  };

  const handleGenreRemove = (genreToRemove) => {
    setFormData((prev) => ({
      ...prev,
      genres: prev.genres.filter((g) => g !== genreToRemove),
    }));
  };

  const calculateTotalScore = () => {
    const values = Object.values(formData.scores);
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    setLoading(true);

    try {
      const reviewData = {
        ...formData,
        totalScore: calculateTotalScore(),
        updatedAt: new Date().toISOString(),
      };

      if (id) {
        // 수정
        await updateDoc(doc(db, "reviews", id), reviewData);
        alert("리뷰가 수정되었습니다!");
      } else {
        // 새로 작성
        reviewData.createdAt = new Date().toISOString();
        await addDoc(collection(db, "reviews"), reviewData);
        alert("리뷰가 저장되었습니다!");
      }

      navigate("/");
    } catch (error) {
      console.error("Error saving review:", error);
      alert("저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">로그인이 필요합니다</h2>
          <p className="text-gray-600 mb-6">리뷰 작성을 위해 로그인해주세요</p>
          <button
            onClick={handleLogin}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-3 mx-auto"
          >
            <span>🔐</span>
            <span>구글로 로그인</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate("/")}
        className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2"
      >
        <span>←</span>
        <span>목록으로</span>
      </button>

      <h1 className="text-3xl font-bold mb-8">
        {id ? "리뷰 수정" : "리뷰 작성"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 테마 이름 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <label className="block mb-2 font-medium">
            테마 이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="themeName"
            value={formData.themeName}
            onChange={handleChange}
            placeholder="방탈출 테마 이름을 입력하세요"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 방탈출 카페 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <label className="block mb-2 font-medium">
            방탈출 카페 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="cafe"
              value={formData.cafe}
              onChange={(e) => {
                handleChange(e);
                setShowCafeDropdown(true);
              }}
              onFocus={() => setShowCafeDropdown(true)}
              placeholder="카페 이름을 입력하세요"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {showCafeDropdown && existingCafes.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {existingCafes
                  .filter((cafe) =>
                    formData.cafe
                      ? cafe.toLowerCase().includes(formData.cafe.toLowerCase())
                      : true
                  )
                  .map((cafe, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, cafe }));
                        setShowCafeDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      {cafe}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* 지역 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <label className="block mb-2 font-medium">
            지역 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={(e) => {
                handleChange(e);
                setShowRegionDropdown(true);
              }}
              onFocus={() => setShowRegionDropdown(true)}
              placeholder="지역을 입력하세요 (예: 강남, 홍대)"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {showRegionDropdown && existingRegions.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {existingRegions
                  .filter((region) =>
                    formData.region
                      ? region
                          .toLowerCase()
                          .includes(formData.region.toLowerCase())
                      : true
                  )
                  .map((region, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, region }));
                        setShowRegionDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      {region}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* 장르 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <label className="block mb-2 font-medium">장르</label>
          <div className="relative mb-3">
            <input
              type="text"
              value={genreInput}
              onChange={(e) => {
                setGenreInput(e.target.value);
                setShowGenreDropdown(true);
              }}
              onFocus={() => setShowGenreDropdown(true)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleGenreAdd(genreInput);
                }
              }}
              placeholder="장르를 입력하세요 (예: 스릴러, 추리, SF)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {showGenreDropdown && existingGenres.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {existingGenres
                  .filter((genre) =>
                    genreInput
                      ? genre.toLowerCase().includes(genreInput.toLowerCase())
                      : true
                  )
                  .map((genre, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleGenreAdd(genre)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    >
                      {genre}
                    </button>
                  ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.genres.map((genre, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
              >
                {genre}
                <button
                  type="button"
                  onClick={() => handleGenreRemove(genre)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* 플레이 정보 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium">
                플레이 날짜 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="visitDate"
                value={formData.visitDate}
                onChange={handleChange}
                min="1900-01-01"
                max="9999-12-31"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">
                플레이 인원 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="participants"
                value={formData.participants}
                onChange={handleChange}
                min="1"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 탈출 여부 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <label className="block mb-4 font-medium">
            탈출 여부 <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, success: true }))
              }
              className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                formData.success
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-300 hover:border-green-300"
              }`}
            >
              탈출 성공
            </button>
            <button
              type="button"
              onClick={() =>
                setFormData((prev) => ({ ...prev, success: false }))
              }
              className={`flex-1 py-3 rounded-lg border-2 transition-colors ${
                !formData.success
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-300 hover:border-red-300"
              }`}
            >
              탈출 실패
            </button>
          </div>
        </div>

        {/* 힌트와 시간 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium">사용한 힌트 수</label>
              <input
                type="number"
                name="hintsUsed"
                value={formData.hintsUsed}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium">남은 시간 (분)</label>
              <input
                type="number"
                name="timeRemaining"
                value={formData.timeRemaining}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6">추가 정보</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-medium">🔒 난이도</label>
                <span className="text-blue-500 font-bold">
                  {formData.difficulty}점
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    difficulty: parseInt(e.target.value),
                  }))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-medium">👻 공포도</label>
                <span className="text-blue-500 font-bold">
                  {formData.horror}점
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={formData.horror}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    horror: parseInt(e.target.value),
                  }))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-medium">🏃 활동성</label>
                <span className="text-blue-500 font-bold">
                  {formData.activity}점
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={formData.activity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    activity: parseInt(e.target.value),
                  }))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-medium">
                  ⚙️ 장치 비율 (장치 : 자물쇠)
                </label>
                <span className="text-blue-500 font-bold">
                  {formData.deviceRatio}:{10 - formData.deviceRatio}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={formData.deviceRatio}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deviceRatio: parseInt(e.target.value),
                  }))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 평가 점수 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-6">평가</h2>
          <div className="space-y-6">
            {[
              {
                key: "fun",
                label: "순수재미",
                description:
                  "방탈출의 플레이어로서 얼마나 즐겁고 흥미로웠는지, 신선하거나 독창적인 요소를 포함한 전체적인 만족감",
              },
              {
                key: "completion",
                label: "완성도",
                description:
                  "장치나 시스템의 오류, 적절한 문제 구성과 난이도, 진행의 매끄러움 등 방탈출의 퀄리티",
              },
              {
                key: "immersion",
                label: "몰입감",
                description:
                  "스토리의 개연성, 직원의 연기와 연출의 자연스러움 등 테마 속에 빠져들게 하는지 여부",
              },
              {
                key: "price",
                label: "가성비",
                description: "테마의 만족도와 볼륨이 가격 대비 적절한지 여부",
              },
              {
                key: "design",
                label: "디자인",
                description:
                  "인테리어, 소품, 공간 연출 등 시각적·감각적으로 만족을 주는지 여부",
              },
            ].map(({ key, label, description }) => (
              <div key={key}>
                <div className="flex justify-between mb-2">
                  <div>
                    <label className="font-medium">{label}</label>
                    <p className="text-xs text-gray-500 mt-1">{description}</p>
                  </div>
                  <span className="text-blue-500 font-bold">
                    {formData.scores[key]}점
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={formData.scores[key]}
                  onChange={(e) => handleScoreChange(key, e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 후기 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <label className="block mb-2 font-medium">후기</label>
          <textarea
            name="review"
            value={formData.review}
            onChange={handleChange}
            placeholder="방탈출 경험에 대한 후기를 자유롭게 작성하세요"
            rows="6"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* 제출 버튼 */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "저장 중..." : id ? "리뷰 저장" : "리뷰 작성"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
