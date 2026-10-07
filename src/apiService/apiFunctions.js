import axios from 'axios';

//Live URL
const BASE_URL = 'https://admin.kitabcloud.se/api/'

//Staging URL
// const BASE_URL = 'http://13.49.228.164/api/'

export const apiFunctions = {
    createFormData: (reqObj) => {
        let formData = new FormData()
        for (const property in reqObj) {
            formData.append(property, reqObj[property])
        }
        return formData;
    },
    getPrivacyPolicy: async () => {
        const res = await axios.get(BASE_URL + 'privacy_policy')
        return res.data.data.description
    },
    getTermsAndConditions: async () => {
        const res = await axios.get(BASE_URL + 'terms_conditions')
        return res.data.data.description
    },
    signUp: async (data) => {
        try {
            const response = await axios.post(BASE_URL + 'register', data)
            console.log('Response is', response.data)
            return response;
        } catch (error) {
            console.log('Error signup:', error);
            return { error: error.message };
        }
    },
    login: async (data) => {
        try {
            const response = await axios.post(BASE_URL + 'login', data)
            console.log('🚀 ~ login: ~ response:', response)
            return response;
        } catch (error) {
            console.error('Error: login', error);
            return { error: error.message };
        }
    },
    socialSignUp: async (data) => {
        try {
            const res = await axios.post(BASE_URL + 'socialSignup', data)
            return res;
        }
        catch (err) {
            console.log('Error is', err)
        }
    },
    socialLogin: async (data) => {
        try {
            const res = await axios.post(BASE_URL + 'socialSignup', data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            return res;
        }
        catch (err) {
            console.log('Error is', err)
        }
    },
    getCategories: async (token) => {
        try {
            const res = await axios.get(BASE_URL + 'category', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            console.log('Data is', res.data.data)
            return res.data.data
        }
        catch (err) {
            console.log('Error is', err)
        }
    },
    getUserData: async (token) => {
        console.log('Get user data called')
        try {
            const res = await axios.post(BASE_URL + 'get_user', { token: token }, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            return res.data.user;
        } catch (error) {
            console.log('getUserData error:',error);
        }
    },
    updateUserData: async (reqObj, token) => {
        try {
            const res = await axios.post(BASE_URL + 'update', reqObj, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return res.data
        }
        catch (error) {
            console.log('Error is', error)
        }
    },
    getAllAuthors: async (token) => {
        const res = await axios.get(BASE_URL + 'author', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        console.log('Response is', res.data)
        return res.data.data;
    },
    getAllReaders: async (token) => {
        const res = await axios.get(BASE_URL + 'reader', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        return res.data.data;
    },
    getAuthorDetails: async (token, id) => {
        const res = await axios.get(BASE_URL + 'author/' + id, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        return res.data.data.author;
    },
    getReaderDetails: async (token, id) => {
        const res = await axios.get(BASE_URL + 'reader/' + id, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        return res.data.data.reader;
    },
    followUnfollow: async (token, reqObj) => {
        try {
            const res = await axios.post(BASE_URL + 'follower', reqObj, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return res.data
        }
        catch (err) {
            console.log('Error is', err)
        }
    },
    getBooks: async (token, reqObj) => {
        try {
            console.log('Req obj is', reqObj)
            const res = await axios.post(BASE_URL + 'books', reqObj, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return res.data.data
        }
        catch (err) {
            console.log('Error is', err)
        }
    },
    searchItems: async (reqObj, token) => {
        try {
            let res = await axios.post(BASE_URL + 'search', reqObj, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log('Search response:', res.data);
            
            // Extract data from response
            const data = res.data.data || res.data || { books: [], authors: [], podcasts: [] };
            
            // Flatten books if they're nested in categories (like home page data)
            let books = data.books || [];
            if (data.categoryWithBooks && Array.isArray(data.categoryWithBooks)) {
                // Flatten books from categories
                books = data.categoryWithBooks.flatMap(category => category.books || []);
            }
            
            return {
                books: books,
                authors: data.authors || [],
                podcasts: data.podcasts || []
            };
        }
        catch (error) {
            console.log('Search error:', error);
            return { books: [], authors: [], podcasts: [] };
        }
    },
    likeUnlineBook: async (id, token) => {
        try {
            console.log('Id is', id)
            console.log('Token is', token)
            const res = await axios.get(BASE_URL + 'booklike/' + id, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return res.data
        }
        catch (err) {
            console.log('Error is', err)
        }
    },
    likeUnlineVideo: async (id, token) => {
        try {
            console.log('Id is', id)
            console.log('Token is', token)
            const res = await axios.get(BASE_URL + 'videoLike/' + id, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return res.data
        }
        catch (err) {
            console.log('Error is', err)
        }
    },
    likeUnlinePodcast: async (id, token) => {
        try {
            console.log('Id is', id)
            console.log('Token is', token)
            const res = await axios.get(BASE_URL + 'podcastLike/' + id, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return res.data
        }
        catch (err) {
            console.log('Error is', err)
        }
    },
    getBookDetailsById: async (id, token) => {
        try {
            const res = await axios.get(BASE_URL + 'books/' + id, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return res.data.data
        }
        catch (err) {
            console.log('Error is', err)
        }
    },
    getBookDetailsByCategoryLanguage: async (cat_id, lang_id, token) => {
        console.log('Cat id is', cat_id)
        console.log('Lang id is', lang_id)
        try {
            const res = await axios.get(BASE_URL + 'getBooksByLanguageCategory?category_id=' + cat_id + '&language_id=' + lang_id, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return res.data.data
        }
        catch (err) {
            console.log('Error is', err)
        }
    },
    getUserLikedBooks: async (token) => {
        try {
            const res = await axios.get(BASE_URL + 'getLikedBooks', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return res.data.data
        }
        catch (err) {
            console.log('Error is', err)
        }
    },
    bookMarkBook: async (bookId, token) => {
        try {
            const res = await axios.get(BASE_URL + 'bookmark/' + bookId, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return res.data
        }
        catch (err) {
            console.log('Error is', err)
        }
    },
    getUserBookMarkedBooks: async (token) => {
        try {
            const res = await axios.get(BASE_URL + 'getBookmarkBooks', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return res.data
        }
        catch (err) {
            console.log('Error is', err)
        }
    },
    postReview: async (token, reqObj) => {
        try {
            console.log('Submitting review with data:', reqObj);
            const res = await axios.post(BASE_URL + 'review', reqObj, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Review response:', res.data);
            return res.data;
        } catch (err) {
            console.error('Error submitting review:', err.response?.data || err.message);
            return { 
                error: err.response?.data?.message || err.message || 'Failed to submit review',
                success: false
            };
        }
    },
    storeBookPlayed: async (token, reqObj) => {
        try {
            const res = await axios.post(BASE_URL + 'book_played', reqObj, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log('Data is', res.data)
            return res.data
        }
        catch (err) {
            console.log('Error is', err)
        }
    },
    getPlayedBooks: async (token) => {
        try {
            const res = await axios.get(BASE_URL + 'book_played', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return res.data.data
        }
        catch (err) {
            console.log('Error is', err)
        }
    },
    getHomeData: async (token) => {
        console.log('Token is', token)
        try {
            const res = await axios.get(BASE_URL + 'home_data', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return res.data
        }
        catch (err) {
            console.log('Error is', err)
        }
    },
    getHomeDataWithLanguages: async (token, langID) => {
        try {
            console.log('Token is', token)
            console.log('Language id', langID)
            const res = await axios.get(BASE_URL + 'home_data_with_language?language_id=' + langID, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log('Data is', res.data)
            return res.data
        }
        catch (err) {
            console.log('Error is', err)
        }
    },
    getAudiobooksByLanguage: async (token, langID) => {
        try {
            console.log('Token is', token)
            console.log('Language id', langID)
            const res = await axios.get(BASE_URL + 'getAudiobooksByLanguage?language_id=' + langID, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log('Data is', res.data)
            return res.data
        }
        catch (err) {
            console.log('Error is', err)
        }
    },
    getEbooksWithLanguages: async (token, langID) => {
        try {
            console.log('Token is', token)
            console.log('Language id', langID)
            const res = await axios.get(BASE_URL + 'getEbooksByLanguage?language_id=' + langID, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log('Data is', res.data)
            return res.data
        }
        catch (err) {
            console.log('Error is', err)
        }
    },
    getMagazinesWithLanguages: async (token, langID) => {
        try {
            console.log('Token is', token)
            console.log('Language id', langID)
            const res = await axios.get(BASE_URL + 'getMagazinesByLanguage?language_id=' + langID, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log('Data is', res.data)
            return res.data
        }
        catch (err) {
            console.log('Error is', err)
        }
    },
    getPodcastsWithLanguages: async (token, langID) => {
        try {
            console.log('Token is', token)
            console.log('Language id', langID)
            const res = await axios.get(BASE_URL + 'getPodcastsByLanguage?language_id=' + langID, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log('Data is', res.data)
            return res.data
        }
        catch (err) {
            console.log('Error is', err)
        }
    },
    getFeaturedBooks: async (token) => {
        try {
            const res = await axios.get(BASE_URL + 'get_featured_books', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return res.data.book
        }
        catch (err) {
            console.log('Error is', err)
        }
    },
    buySubscription: async (token, reqObj) => {
        try {
            const res = await axios.post(BASE_URL + 'subscribe', reqObj, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return res.data
        }
        catch (error) {
            console.log('Error is', error)
        }
    },
    saveAdClick: async (reqObj, token) => {
        try {
            const res = await axios.post(BASE_URL + 'clickads', reqObj, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            console.log('Ads click is', res.data)
        }
        catch (err) {
            console.log('Error is', err)
        }
    },
    getTopPlayedBooksByTimeframe: async (token, type) => {
        try {
            const res = await axios.get(BASE_URL + 'getPlayedBookByTimeFrame/' + type, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return res.data.book
        }
        catch (err) {
            console.log('Error is', err)
        }
    },
    getAllLanguages: async (token) => {
        const res = await axios.get(BASE_URL + 'language', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        return res.data.data;
    },
    getBackgroundImages: async () => {
        try {
            const res = await fetch(BASE_URL + 'backgroundImages');
            if (!res.ok) {
                throw new Error('Network response was not ok.');
            }
            const data = await res.json();
            return data.data;
        } catch (error) {
            console.error('Error:', error);
            return [];
        }
    },
    forgotPassword: async (reqObj) => {
        const res = await axios.post(BASE_URL + 'forgot', reqObj);
        return res.data;
    },
    resetPassword: async (reqObj) => {
        const res = await axios.post(BASE_URL + 'reset-password', reqObj);
        return res.data;
    },
    getAudiobooks: async (token) => {
        try {
            const res = await axios.get(BASE_URL + 'audio', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Flatten the nested structure - books array contains audiobooks in each category
            const allAudiobooks = (res.data.categoryWithAudioBooks || []).flatMap(
                category => category.books || []
            );
            return allAudiobooks;
        } catch (error) {
            console.error('Error fetching audiobooks:', error);
            return [];
        }
    },
    getEbooks: async (token) => {
        try {
            const res = await axios.get(BASE_URL + 'ebooks', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Flatten the nested structure - books array contains ebooks in each category
            const allEbooks = (res.data.categoryWithEBooks || []).flatMap(
                category => category.books || []
            );
            return allEbooks;
        } catch (error) {
            console.error('Error fetching ebooks:', error);
            return [];
        }
    },
    getMagazines: async (token) => {
        try {
            const res = await axios.get(BASE_URL + 'magazines', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Flatten the nested structure - magazines are in categoryWithMagazines array
            const allMagazines = (res.data.categoryWithMagazines || []).flatMap(
                category => category.books || []
            );
            return allMagazines;
        } catch (error) {
            console.error('Error fetching magazines:', error);
            return [];
        }
    },
    getVideos: async (token) => {
        try {
            const res = await axios.get(BASE_URL + 'videos', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            // Flatten the nested structure - videos are in categoryWithVideos array
            const allVideos = (res.data.categoryWithVideos || []).flatMap(
                category => category.videos || []
            );
            return allVideos;
        } catch (error) {
            console.error('Error fetching videos:', error);
            return [];
        }
    },
    getPodcasts: async (token) => {
        try {
            const res = await axios.get(BASE_URL + 'podcast', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Podcasts are', res.data);
            // Flatten the nested structure - podcasts are in categoryWithPodcast array
            const allPodcasts = (res.data.categoryWithPodcast || []).flatMap(
                category => category.podcasts || []
            );
            return allPodcasts;
        } catch (error) {
            console.error('Error fetching podcasts:', error);
            return [];
        }
    },
    logoutUser: async (token) => {
        const res = await axios.get(BASE_URL + 'logout?token=' + token, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    },
    deleteUser: async (token) => {
        const res = await axios.get(BASE_URL + 'destroy?token=' + token, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        return res.data
    },
    getUserCountry: async (reqObj) => {
        try {
            console.log(BASE_URL + 'country/lat-lng?lat='+reqObj.lat+'&lng='+reqObj.lng)
            let res = await axios.get(BASE_URL + 'country/lat-lng?lat='+reqObj.lat+'&lng='+reqObj.lng)
            console.log('responseeeeee is ',res.data)
            return res.data
        }
        catch (error) {
            console.log('Called', error)
        }
    },
    getUsersSavedLanguages: async (token) => {
        try {
            const res = await axios.get(BASE_URL + 'user_languages', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            return res.data.data;
        } catch (error) {
            console.log('Error getting user languages:', error);
            return [];
        }
    },
    AddUserlangauge: async (body, token) => {
        try {
            const res = await axios.post(BASE_URL + 'save/language', body, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            console.log('Response is>>save language', res)
            return res.data;
        } catch (error) {
            console.log('Error adding user language:', error);
            return null;
        }
    },
    AddUserCategory: async (body, token) => {
        try {
            const res = await axios.post(BASE_URL + 'update/category', body, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            return res.data;
        } catch (error) {
            console.log('Error adding user category:', error);
            return null;
        }
    },
    submitFeedback: async (token, feedbackData) => {
        try {
            const res = await axios.post(BASE_URL + 'feedback', feedbackData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
            console.log('Feedback submitted:', res.data);
            return res.data;
        } catch (error) {
            console.log('Error submitting feedback:', error);
            return { error: error.message };
        }
    },
    getAllBooks: async (token) => {
        try {
            const res = await axios.get(BASE_URL + 'books', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('All books fetched:', res.data);
            return res.data;
        } catch (error) {
            console.error('Error fetching all books:', error);
            return { error: error.message };
        }
    },
    getAudiobooksByCategory: async (token, categoryId) => {
        try {
            const res = await axios.get(BASE_URL + `audio?category_id=${categoryId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Audiobooks by category fetched:', res.data);
            // Flatten the nested structure - books array contains audiobooks in each category
            const allAudiobooks = (res.data.categoryWithAudioBooks || []).flatMap(
                category => category.books || []
            );
            return allAudiobooks;
        } catch (error) {
            console.error('Error fetching audiobooks by category:', error);
            return [];
        }
    },
    searchAudiobooks: async (token, query) => {
        try {
            const res = await axios.get(BASE_URL + `audio?search=${encodeURIComponent(query)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Search audiobooks results:', res.data);
            // Flatten the nested structure - books array contains audiobooks in each category
            const allAudiobooks = (res.data.categoryWithAudioBooks || []).flatMap(
                category => category.books || []
            );
            return allAudiobooks;
        } catch (error) {
            console.error('Error searching audiobooks:', error);
            return [];
        }
    }
} 