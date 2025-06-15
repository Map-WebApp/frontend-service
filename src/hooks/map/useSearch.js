import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { setSearchText as setSearchTextAction } from '../../store/slices/searchSlice';

const useSearch = () => {
    const dispatch = useDispatch();
    const [autocomplete, setAutocomplete] = useState(null);
    const [searchText, setSearchText] = useState('');

    const onAutocompleteLoad = useCallback((ac) => {
        setAutocomplete(ac);
    }, []);

    const handlePlaceChanged = useCallback(() => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            return place;
        }
        return null;
    }, [autocomplete]);

    const handleSearchTextChange = useCallback((text) => {
        setSearchText(text);
        dispatch(setSearchTextAction(text));
    }, [dispatch]);
    
    const clearSearch = useCallback(() => {
        setSearchText('');
        dispatch(setSearchTextAction(''));
    }, [dispatch]);

    return {
        searchText,
        autocomplete,
        onAutocompleteLoad,
        handlePlaceChanged,
        handleSearchTextChange,
        clearSearch
    };
};

export default useSearch; 