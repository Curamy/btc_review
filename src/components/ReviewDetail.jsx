import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import ReviewRadarChart from './RadarChart';
import { useAuth } from '../hooks/useAuth';

const ReviewDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [review, setReview] = useState(null);
  const [averageScores, setAverageScores] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReview();
    calculateAverageScores();
  }, [id]);

  const fetchReview = async () => {
    try {
      const docRef = doc(db, 'reviews', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setReview({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.error('Review not found');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching review:', error);
      setLoading(false);
    }
  };

  const calculateAverageScores = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'reviews'));
      const allReviews = querySnapshot.docs.map(doc => doc.data());
      
      const totals = {
        fun: 0,
        completion: 0,
        immersion: 0,
        price: 0,
        design: 0,
      };

      allReviews.forEach(review => {
        if (review.scores) {
          totals.fun += review.scores.fun || 0;
          totals.completion += review.scores.completion || 0;
          totals.immersion += review.scores.immersion || 0;
          totals.price += review.scores.price || 0;
          totals.design += review.scores.design || 0;
        }
      });

      const count = allReviews.length;
      setAverageScores({
        fun: count > 0 ? totals.fun / count : 0,
        completion: count > 0 ? totals.completion / count : 0,
        immersion: count > 0 ? totals.immersion / count : 0,
        price: count > 0 ? totals.price / count : 0,
        design: count > 0 ? totals.design / count : 0,
      });
    } catch (error) {
      console.error('Error calculating averages:', error);
    }
  };

  const calculateTotalScore = (scores) => {
    const values = Object.values(scores);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return avg.toFixed(1);
  };

  const handleDelete = async () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, 'reviews', id));
        navigate('/');
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('리뷰 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">로딩 중...</div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">리뷰를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate('/')}
        className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2"
      >
        <span>←</span>
        <span>목록으로</span>
      </button>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">{review.themeName}</h1>
          <div className="flex gap-2 mb-4">
            <span className="text-lg text-gray-600">{review.cafe}</span>
            <span className="text-lg text-gray-400">|</span>
            <span className="text-lg text-blue-600">{review.region}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {review.genres && review.genres.map((genre, i) => (
              <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                {genre}
              </span>
            ))}
          </div>
        </div>
        <div className="text-5xl font-bold text-blue-500">
          {calculateTotalScore(review.scores)}
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">플레이 날짜</div>
            <div className="font-medium">{review.visitDate}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">플레이 인원</div>
            <div className="font-medium">{review.participants}명</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">탈출 여부</div>
            <div className={`font-medium ${review.success ? 'text-green-600' : 'text-red-600'}`}>
              {review.success ? '성공' : '실패'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">사용한 힌트 수</div>
            <div className="font-medium">{review.hintsUsed}개</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">남은 시간</div>
            <div className="font-medium">{review.timeRemaining}분</div>
          </div>
        </div>
      </div>

      <ReviewRadarChart currentTheme={review} averageScores={averageScores} />

      {review.review && (
        <div className="bg-white rounded-lg p-6 shadow-sm mt-6">
          <h2 className="text-xl font-bold mb-4">후기</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{review.review}</p>
        </div>
      )}

      {user && (
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => navigate(`/edit/${review.id}`)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <span>✏️</span>
            <span>수정</span>
          </button>
          <button
            onClick={handleDelete}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2"
          >
            <span>🗑️</span>
            <span>삭제</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewDetail;
