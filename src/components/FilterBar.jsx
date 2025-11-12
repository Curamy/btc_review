import React, { useState } from 'react';

const FilterBar = ({ onFilterChange, cafes, regions, genres }) => {
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCafe, setSelectedCafe] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showCafeDropdown, setShowCafeDropdown] = useState(false);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);

  const handleRegionChange = (region) => {
    setSelectedRegion(region);
    setShowRegionDropdown(false);
    onFilterChange({ region, cafe: selectedCafe, genre: selectedGenre });
  };

  const handleCafeChange = (cafe) => {
    setSelectedCafe(cafe);
    setShowCafeDropdown(false);
    onFilterChange({ region: selectedRegion, cafe, genre: selectedGenre });
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    setShowGenreDropdown(false);
    onFilterChange({ region: selectedRegion, cafe: selectedCafe, genre });
  };

  const clearFilters = () => {
    setSelectedRegion('');
    setSelectedCafe('');
    setSelectedGenre('');
    onFilterChange({ region: '', cafe: '', genre: '' });
  };

  return (
    <div className="flex gap-2 md:gap-4 mb-6 flex-wrap">
      {/* 지역별 필터 */}
      <div className="relative">
        <button
          onClick={() => {
            setShowRegionDropdown(!showRegionDropdown);
            setShowCafeDropdown(false);
            setShowGenreDropdown(false);
          }}
          className="px-3 md:px-4 py-1.5 md:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm md:text-base"
        >
          <span>{selectedRegion || '지역별'}</span>
          <span className="text-xs">▼</span>
        </button>
        {showRegionDropdown && (
          <div className="absolute top-full mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            <button
              onClick={() => handleRegionChange('')}
              className="w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              전체 보기
            </button>
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => handleRegionChange(region)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                {region}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 카페별 필터 */}
      <div className="relative">
        <button
          onClick={() => {
            setShowCafeDropdown(!showCafeDropdown);
            setShowRegionDropdown(false);
            setShowGenreDropdown(false);
          }}
          className="px-3 md:px-4 py-1.5 md:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm md:text-base"
        >
          <span>{selectedCafe || '카페별'}</span>
          <span className="text-xs">▼</span>
        </button>
        {showCafeDropdown && (
          <div className="absolute top-full mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            <button
              onClick={() => handleCafeChange('')}
              className="w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              전체 보기
            </button>
            {cafes.map((cafe) => (
              <button
                key={cafe}
                onClick={() => handleCafeChange(cafe)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                {cafe}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 장르별 필터 */}
      <div className="relative">
        <button
          onClick={() => {
            setShowGenreDropdown(!showGenreDropdown);
            setShowRegionDropdown(false);
            setShowCafeDropdown(false);
          }}
          className="px-3 md:px-4 py-1.5 md:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm md:text-base"
        >
          <span>{selectedGenre || '장르별'}</span>
          <span className="text-xs">▼</span>
        </button>
        {showGenreDropdown && (
          <div className="absolute top-full mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
            <button
              onClick={() => handleGenreChange('')}
              className="w-full px-4 py-2 text-left hover:bg-gray-100"
            >
              전체 보기
            </button>
            {genres.map((genre) => (
              <button
                key={genre}
                onClick={() => handleGenreChange(genre)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                {genre}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 필터 해제 버튼 */}
      {(selectedRegion || selectedCafe || selectedGenre) && (
        <button
          onClick={clearFilters}
          className="px-3 md:px-4 py-1.5 md:py-2 text-blue-600 hover:text-blue-800 flex items-center gap-1 md:gap-2 text-sm md:text-base"
        >
          <span>✕</span>
          <span>필터 해제</span>
        </button>
      )}
    </div>
  );
};

export default FilterBar;
