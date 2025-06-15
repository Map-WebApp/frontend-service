import { useState, useCallback, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import debounce from 'lodash.debounce';
import { 
  setSearchText, 
  setSearchSuggestions,
  setIsSearching,
  setSearchResults 
} from '../../store/slices/searchSlice';
import { addToast } from '../../store/slices/uiSlice';

const useSearch = () => {
  const dispatch = useDispatch();
  const { searchText, recentSearches } = useSelector(state => state.search);
  const [autocomplete, setAutocomplete] = useState(null);

  const onAutocompleteLoad = useCallback((autoC) => {
    setAutocomplete(autoC);
    if (autoC) {
      // Ưu tiên kết quả từ Việt Nam
      autoC.setComponentRestrictions({ country: 'vn' });
    }
  }, []);

  const handleSearchTextChange = useCallback((value) => {
    dispatch(setSearchText(value));
  }, [dispatch]);

  // Sử dụng debounce để tránh gọi API liên tục khi người dùng gõ
  const debouncedFetchSuggestions = useCallback(
    debounce((text) => {
      if (!text) {
        dispatch(setSearchSuggestions([]));
        return;
      }
      
      // Trong môi trường thực tế, sẽ gọi Search Service ở đây
      dispatch(setIsSearching(true));
      
      // Mô phỏng gọi API (thực tế sẽ gọi từ Search Service)
      setTimeout(() => {
        // Kết hợp từ lịch sử tìm kiếm gần đây
        const relevantHistory = recentSearches.filter(item => 
          item.name.toLowerCase().includes(text.toLowerCase())
        );
        
        dispatch(setSearchSuggestions(relevantHistory));
        dispatch(setIsSearching(false));
      }, 300);
    }, 300),
    [dispatch, recentSearches]
  );
  
  useEffect(() => {
    debouncedFetchSuggestions(searchText);
    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, [searchText, debouncedFetchSuggestions]);

  const handlePlaceChanged = useCallback(() => {
    dispatch(setIsSearching(true));
    
    if (autocomplete !== null) {
      try {
        const place = autocomplete.getPlace();
        
        if (!place.geometry) {
          dispatch(addToast({
            type: 'error',
            message: 'Không tìm thấy địa điểm này. Vui lòng chọn từ gợi ý.'
          }));
          dispatch(setIsSearching(false));
          return null;
        }
        
        dispatch(setIsSearching(false));
        return place;
      } catch (error) {
        console.error("Error selecting place:", error);
        dispatch(addToast({
          type: 'error',
          message: 'Lỗi khi tìm kiếm địa điểm. Vui lòng thử lại.'
        }));
        dispatch(setIsSearching(false));
        return null;
      }
    } else {
      dispatch(addToast({
        type: 'warning',
        message: 'Dịch vụ tìm kiếm chưa sẵn sàng. Vui lòng thử lại.'
      }));
      dispatch(setIsSearching(false));
      return null;
    }
  }, [autocomplete, dispatch]);

  const clearSearch = useCallback(() => {
    dispatch(setSearchText(''));
    dispatch(setSearchSuggestions([]));
  }, [dispatch]);

  return {
    searchText,
    autocomplete,
    onAutocompleteLoad,
    handleSearchTextChange,
    handlePlaceChanged,
    clearSearch
  };
};

export default useSearch; 