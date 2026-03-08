import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { apiFunctions } from '../../../apiService/apiFunctions';
import { colors } from '../../../constants/colors';
import { commonStyles } from '../../../constants/commonStyles';
import AudioPlayer from '../../../components/AudioPlayer/AudioPlayer';
import { useAudioPlayer } from '../../../context/AudioPlayerContext';
import InAppViewer from '../../../components/InAppViewer/InAppViewer';

const FILE_BASE_URL = 'https://api.kitabcloud.se/storage/';
const FALLBACK_IMAGE = '/favicon.ico';

const BookDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showFullDesc, setShowFullDesc] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [userRating, setUserRating] = useState(0);
    const [userReview, setUserReview] = useState('');
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [showInAppViewer, setShowInAppViewer] = useState(false);
    const [viewerFile, setViewerFile] = useState(null);
    const { playTrack } = useAudioPlayer();

    const fetchBookDetails = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiFunctions.getBookDetailsById(id, token);
            console.log('Book Details API Response:', data); // Debugging API response
            if (data) {
                setBook(data);
            } else {
                setError('Book not found');
            }
        } catch (error) {
            console.error('Error fetching book details:', error);
            setError('Failed to load book details');
        } finally {
            setLoading(false);
        }
    }, [id, token]);

    useEffect(() => {
        if (token && id) {
            fetchBookDetails();
            fetchReviews();
        }
    }, [token, id, fetchBookDetails]);

    const fetchReviews = async () => {
        try {
            // TODO: Replace with actual API call when review endpoint is available
            // const data = await apiFunctions.getBookReviews(id, token);
            // setReviews(data || []);
            setReviews([]);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setReviews([]);
        }
    };

    const handlePlaySample = () => {
        if (book?.bookaudio) {
            playTrack({
                id: book.id,
                title: book.title,
                author: book.author,
                cover_image: book.coverimage || book.image,
                audio_url: (book.bookaudio.startsWith('http') ? book.bookaudio : FILE_BASE_URL + book.bookaudio),
            });
        }
    };

    const handleOpenBook = () => {
        // Log the book object to see all properties
        console.log('Book data for reading:', book);
        
        // Try to find the file URL in common properties
        // The API log shows 'bookfile' exists in the keys
        let fileUrl = book.bookfile || book.file || book.url || book.ebook || book.magazine_file || book.book_file;
        
        // Check for any nested file objects if it's not a string
        if (!fileUrl && book.file_details) {
            fileUrl = book.file_details.url || book.file_details.file;
        }

        // If the key exists but is empty/null, try to find ANY value that ends with .pdf or .epub
        if (!fileUrl) {
            // Find all string properties
            const entries = Object.entries(book);
            const fileEntry = entries.find(([key, value]) => 
                typeof value === 'string' && 
                (value.toLowerCase().includes('.pdf') || value.toLowerCase().includes('.epub'))
            );
            
            if (fileEntry) {
                console.log(`Found possible file in key: ${fileEntry[0]} = ${fileEntry[1]}`);
                fileUrl = fileEntry[1];
            }
        }

        if (fileUrl) {
            const fullUrl = fileUrl.startsWith('http') ? fileUrl : (FILE_BASE_URL + fileUrl);
            const fileName = book.title || 'Book';
            // Determine type from file_type, type property, or extension
            const fileType = book.file_type || book.type || (fullUrl.toLowerCase().includes('.epub') ? 'epub' : 'pdf');
            
            console.log('Opening book with:', { fullUrl, fileName, fileType });
            
            setViewerFile({
                url: fullUrl,
                name: fileName,
                type: fileType
            });
            setShowInAppViewer(true);
        } else {
            console.error('Available keys in book object:', Object.keys(book));
            // Show details about what was checked to help debugging
            alert(`No reading file found for "${book.title}".\n\nChecked fields: bookfile, file, url, ebook, magazine_file.\n\nPlease ensure a PDF or ePub is uploaded for this book in the admin panel.`);
        }
    };

    const handleCloseViewer = () => {
        setShowInAppViewer(false);
        setViewerFile(null);
    };

    const handleLike = async () => {
        try {
            const response = await apiFunctions.likeUnlineBook(book.id, token);
            if (response && response.success !== false) {
                setBook(prev => ({ ...prev, is_liked: !prev.is_liked }));
            }
        } catch (error) {
            console.error('Error liking book:', error);
        }
    };

    const handleUserRating = (rating) => {
        setUserRating(rating);
    };

    const handleWriteReview = () => {
        if (userRating === 0) {
            alert('Please select a rating before writing a review');
            return;
        }
        setShowReviewModal(true);
    };

    const handleSubmitReview = async () => {
        if (!userReview.trim()) {
            alert('Please write a review before submitting');
            return;
        }

        if (userRating === 0) {
            alert('Please select a rating');
            return;
        }

        setIsSubmittingReview(true);
        try {
            const reviewData = {
                book_id: book.id,
                rating: userRating,
                review: userReview
            };

            console.log('Submitting review data:', reviewData);
            const response = await apiFunctions.postReview(token, reviewData);
            console.log('Review API response:', response);
            
            // Check if the review was successfully saved
            if (response && (response.success === true || response.success === undefined)) {
                // Add review to local state
                const newReview = {
                    user: 'You',
                    rating: userRating,
                    text: userReview,
                    date: new Date().toISOString()
                };
                setReviews(prev => [newReview, ...prev]);
                
                // Reset form
                setUserRating(0);
                setUserReview('');
                setShowReviewModal(false);
                alert('Thank you for your review!');
            } else {
                const errorMessage = response?.error || response?.message || 'Failed to submit review';
                console.error('Review submission failed:', errorMessage);
                alert(`Failed to submit review: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. Please check your connection and try again.');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date)) return dateString;
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div style={{ ...commonStyles.fullScreenContainer, ...commonStyles.centerContent }}>
                <div style={{
                    width: 40,
                    height: 40,
                    border: `3px solid ${colors.lightGrey}`,
                    borderTop: `3px solid ${colors.appPrimary}`,
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
            </div>
        );
    }

    if (error || !book) {
        return (
            <div style={{ ...commonStyles.fullScreenContainer, ...commonStyles.centerContent }}>
                <div style={{ textAlign: 'center', padding: 20 }}>
                    <p style={{ fontSize: 18, color: colors.grey, marginBottom: 16 }}>{error || 'Book not found'}</p>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: colors.appPrimary,
                            color: colors.white,
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        ← Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Book info helpers
    const getImage = () => {
        const img = book.coverimage || book.image;
        if (!img) return FALLBACK_IMAGE;
        if ((book.cover_image && book.cover_image.startsWith('http')) || (book.image && book.image.startsWith('http'))) {
            return img;
        }
        return FILE_BASE_URL + img;
    };
    
    const authorName = book.author?.name || book.author_name || 'Unknown Author';
    // Safely get publisher name
    const publisher = typeof book.publisher === 'string' 
        ? book.publisher 
        : (book.publisher?.name || 'Kitab Cloud originals');
    const releaseDate = formatDate(book.created_at) || formatDate(new Date());
    
    // Get book length from API - can be from book_length or length field
    // If not available, don't show "N/A" - just hide the field if not applicable
    const lengthInSeconds = book.book_length || book.length || null;
    
    // Function to format length from seconds to hours and minutes
    const formatLength = (seconds) => {
        if (!seconds || isNaN(seconds)) return null;
        
        const totalSeconds = parseInt(seconds);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const remainingSeconds = totalSeconds % 60;
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        } else if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        } else {
            return `${remainingSeconds}s`;
        }
    };
    
    const length = formatLength(lengthInSeconds);
    
    const rating = parseFloat(book.average_rating) || book.rating || 0;

    // Description logic
    const descLimit = 120;
    const desc = book.description || '';
    const showSeeMore = desc.length > descLimit;
    const descToShow = showFullDesc ? desc : desc.slice(0, descLimit) + (showSeeMore ? '...' : '');

    // Reviews to show (only real reviews, no hardcoded data)
    const reviewsToShow = reviews.slice(0, 2);

    return (
        <div style={{ ...commonStyles.fullScreenContainer, background: colors.white, minHeight: '100vh', paddingBottom: 80 }}>
            <div style={{ maxWidth: 420, margin: '0 auto', padding: 20 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', marginRight: 8 }}
                    >
                        ←
                    </button>
                    <h2 style={{ ...commonStyles.textLightBold(20), flex: 1, margin: 0 }}>{book.title}</h2>
                    <button 
                        onClick={handleLike} 
                        style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}
                    >
                        {book.is_liked ? '❤️' : '🤍'}
                    </button>
                </div>

                {/* Book Card */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                    <img
                        src={getImage()}
                        alt={book.title}
                        style={{ width: 120, height: 160, objectFit: 'cover', borderRadius: 8 }}
                        onError={(e) => {
                            e.target.src = FALLBACK_IMAGE;
                        }}
                    />
                    <div style={{ flex: 1 }}>
                        <h3 style={{ ...commonStyles.textLightBold(18), marginBottom: 8 }}>{book.title}</h3>
                        <p style={{ ...commonStyles.textLightNormal(14), color: colors.grey, marginBottom: 8 }}>by {authorName}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                            <span style={{ color: colors.appPrimary }}>★</span>
                            <span style={{ fontSize: 14, color: colors.grey }}>{rating}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {book.bookaudio && (
                                <button
                                    onClick={handlePlaySample}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: colors.appPrimary,
                                        color: colors.white,
                                        border: 'none',
                                        borderRadius: 6,
                                        fontSize: 14,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Listen
                                </button>
                            )}
                            {(book.bookfile || book.file_type === 'epub' || book.file_type === 'pdf' || book.file || book.url || book.ebook || book.magazine_file) && (
                                <button
                                    onClick={handleOpenBook}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: colors.white,
                                        color: colors.appPrimary,
                                        border: `1px solid ${colors.appPrimary}`,
                                        borderRadius: 6,
                                        fontSize: 14,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Read Book
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Book Details */}
                <div style={{ marginBottom: 24 }}>
                    <h4 style={{ ...commonStyles.textLightBold(16), marginBottom: 12 }}>Book Details</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                        <div>
                            <span style={{ fontSize: 12, color: colors.grey }}>Publisher</span>
                            <p style={{ fontSize: 14, margin: 0 }}>{publisher}</p>
                        </div>
                        <div>
                            <span style={{ fontSize: 12, color: colors.grey }}>Release Date</span>
                            <p style={{ fontSize: 14, margin: 0 }}>{releaseDate}</p>
                        </div>
                        <div>
                            <span style={{ fontSize: 12, color: colors.grey }}>Category</span>
                            <p style={{ fontSize: 14, margin: 0 }}>{book.category?.category_name || 'N/A'}</p>
                        </div>
                        {length && (
                            <div>
                                <span style={{ fontSize: 12, color: colors.grey }}>Length</span>
                                <p style={{ fontSize: 14, margin: 0 }}>{length}</p>
                            </div>
                        )}
                        {!length && (
                            <div>
                                <span style={{ fontSize: 12, color: colors.grey }}>Type</span>
                                <p style={{ fontSize: 14, margin: 0 }}>{book.type || book.file_type || 'N/A'}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div style={{ marginBottom: 24 }}>
                    <h4 style={{ ...commonStyles.textLightBold(16), marginBottom: 12 }}>Description</h4>
                    <p style={{ ...commonStyles.textLightNormal(14), lineHeight: 1.6, marginBottom: 8 }}>
                        {descToShow}
                    </p>
                    {showSeeMore && (
                        <button
                            onClick={() => setShowFullDesc(!showFullDesc)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: colors.appPrimary,
                                fontSize: 14,
                                cursor: 'pointer'
                            }}
                        >
                            {showFullDesc ? 'Show Less' : 'Show More'}
                        </button>
                    )}
                </div>

                {/* Reviews */}
                <div style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ ...commonStyles.textLightBold(16), flex: 1 }}>Reviews ({reviews.length})</div>
                    </div>
                    {reviewsToShow.length > 0 ? (
                        reviewsToShow.map((review, index) => (
                            <div key={index} style={{ background: colors.lightGrey, borderRadius: 8, padding: 12, marginBottom: 8 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                    <div style={{ ...commonStyles.textLightBold(14) }}>{review.user || 'Anonymous'}</div>
                                    <div style={{ color: colors.appPrimary, fontSize: 13 }}>★ {review.rating}</div>
                                </div>
                                <div style={{ ...commonStyles.textLightNormal(13), color: colors.grey, marginBottom: 4 }}>{review.text}</div>
                                {review.date && (
                                    <div style={{ fontSize: 11, color: colors.grey }}>
                                        {formatDate(review.date)}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div style={{ background: colors.lightGrey, borderRadius: 8, padding: 20, textAlign: 'center' }}>
                            <p style={{ ...commonStyles.textLightNormal(14), color: colors.grey, margin: 0 }}>
                                No reviews yet. Be the first to review this book!
                            </p>
                        </div>
                    )}
                </div>

                {/* User Rating */}
                <div style={{ marginBottom: 18 }}>
                    <div style={{ ...commonStyles.textLightBold(16), marginBottom: 6 }}>Rating</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                        {[1,2,3,4,5].map(star => (
                            <span
                                key={star}
                                style={{ fontSize: 22, color: userRating >= star ? colors.appPrimary : colors.lightGrey, cursor: 'pointer' }}
                                onClick={() => handleUserRating(star)}
                            >★</span>
                        ))}
                    </div>
                    <button
                        onClick={handleWriteReview}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: colors.appPrimary,
                            fontSize: 14,
                            cursor: 'pointer',
                            padding: 0,
                            textAlign: 'left'
                        }}
                    >
                        Write a Review
                    </button>
                </div>
            </div>

            {/* Review Modal */}
            {showReviewModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000,
                        padding: 20
                    }}
                    onClick={() => setShowReviewModal(false)}
                >
                    <div
                        style={{
                            background: colors.white,
                            borderRadius: 12,
                            padding: 24,
                            maxWidth: 500,
                            width: '100%',
                            maxHeight: '80vh',
                            overflow: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 style={{ ...commonStyles.textLightBold(20), marginBottom: 16 }}>Write a Review</h3>
                        
                        {/* Rating Stars */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ ...commonStyles.textLightBold(14), display: 'block', marginBottom: 8 }}>Your Rating</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                {[1,2,3,4,5].map(star => (
                                    <span
                                        key={star}
                                        style={{ fontSize: 32, color: userRating >= star ? colors.appPrimary : colors.lightGrey, cursor: 'pointer' }}
                                        onClick={() => handleUserRating(star)}
                                    >★</span>
                                ))}
                            </div>
                        </div>

                        {/* Review Text */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ ...commonStyles.textLightBold(14), display: 'block', marginBottom: 8 }}>Your Review</label>
                            <textarea
                                value={userReview}
                                onChange={(e) => setUserReview(e.target.value)}
                                placeholder="Share your thoughts about this book..."
                                style={{
                                    width: '100%',
                                    minHeight: 120,
                                    padding: 12,
                                    border: `1px solid ${colors.lightGrey}`,
                                    borderRadius: 8,
                                    fontSize: 14,
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={() => {
                                    setShowReviewModal(false);
                                    setUserReview('');
                                }}
                                style={{
                                    flex: 1,
                                    padding: '12px 24px',
                                    backgroundColor: colors.lightGrey,
                                    color: colors.grey,
                                    border: 'none',
                                    borderRadius: 8,
                                    fontSize: 14,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmitReview}
                                disabled={isSubmittingReview || userRating === 0 || !userReview.trim()}
                                style={{
                                    flex: 1,
                                    padding: '12px 24px',
                                    backgroundColor: isSubmittingReview || userRating === 0 || !userReview.trim() ? colors.lightGrey : colors.appPrimary,
                                    color: colors.white,
                                    border: 'none',
                                    borderRadius: 8,
                                    fontSize: 14,
                                    cursor: isSubmittingReview || userRating === 0 || !userReview.trim() ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Render AudioPlayer only if audio is playing */}
            <AudioPlayer />

            {/* In-App Viewer */}
            {showInAppViewer && viewerFile && (
                <InAppViewer
                    fileUrl={viewerFile.url}
                    fileName={viewerFile.name}
                    fileType={viewerFile.type}
                    onClose={handleCloseViewer}
                />
            )}
        </div>
    );
};

export default BookDetails; 