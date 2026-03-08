import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { apiFunctions } from '../apiService/apiFunctions';
import { colors } from '../constants/colors';
import { commonStyles } from '../constants/commonStyles';

const BookCard = ({ book }) => {
    const { token } = useAuth();
    const { currentTrack } = useAudioPlayer();
    const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(book.is_liked || false);
    const [isLikeLoading, setIsLikeLoading] = useState(false);

    // Update like state when book prop changes
    useEffect(() => {
        setIsLiked(book.is_liked || false);
    }, [book.is_liked]);

    const handleLike = async (e) => {
        e.stopPropagation();
        if (isLikeLoading) return; // Prevent multiple clicks
        
        try {
            setIsLikeLoading(true);
            const response = await apiFunctions.likeUnlineBook(book.id, token);
            
            if (response && response.success !== false) {
                setIsLiked(!isLiked);
            } else {
                console.error('Like/unlike failed:', response);
            }
        } catch (error) {
            console.error('Error liking book:', error);
            // Don't change state on error
        } finally {
            setIsLikeLoading(false);
        }
    };

    const handleCardClick = () => {
        navigate(`/book/${book.id}`);
    };

    const isCurrentTrack = currentTrack?.id === book.id;

    // Helper function to safely get string values
    const getSafeString = (value) => {
        if (typeof value === 'string') return value;
        if (typeof value === 'object' && value !== null) {
            // If it's an object, try to get a meaningful string representation
            if (value.name) return value.name;
            if (value.title) return value.title;
            if (value.id) return `ID: ${value.id}`;
            return 'Unknown';
        }
        return value?.toString() || 'Unknown';
    };

    // Safely get book properties
    const bookTitle = getSafeString(book.title);
    const bookAuthor = getSafeString(book.author?.name || book.author_name || book.author);
    
    // Handle image URL properly
    let bookImage = '/logo192.png'; // Default fallback
    if (book.coverimage) {
        bookImage = book.coverimage.startsWith('http') ? book.coverimage : book.coverimage;
    } else if (book.image) {
        bookImage = book.image.startsWith('http') ? book.image : book.image;
    }
    
    console.log('BookCard - Image handling:', {
        title: bookTitle,
        coverimage: book.coverimage,
        image: book.image,
        finalImage: bookImage
    });
    
    const bookRating = typeof book.rating === 'number' ? book.rating : 0;

    // Prepare track data for context
    const trackData = useMemo(() => {
        // Safely get author name
        let authorName = 'Unknown Author';
        if (typeof book.author === 'string') {
            authorName = book.author;
        } else if (book.author && typeof book.author === 'object' && book.author.name) {
            authorName = book.author.name;
        } else if (book.author_name) {
            authorName = book.author_name;
        }
        
        return {
            id: book.id,
            title: book.title,
            author: authorName,
            author_name: book.author_name || authorName,
            cover_image: book.coverimage || book.image,
            audio_url: book.audio_url || book.bookaudio
        };
    }, [book]);

    return (
        <div 
            data-track-container
            onClick={handleCardClick}
            style={{
                backgroundColor: colors.white,
                borderRadius: 12,
                padding: 15,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer',
                border: isCurrentTrack ? `2px solid ${colors.appPrimary}` : 'none',
                minHeight: '280px',
                display: 'flex',
                flexDirection: 'column'
            }}
            onMouseEnter={(e) => {
                if (window.matchMedia('(hover: hover)').matches) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                }
            }}
            onMouseLeave={(e) => {
                if (window.matchMedia('(hover: hover)').matches) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }
            }}
        >
            <div style={{ position: 'relative' }}>
                <img 
                    src={bookImage} 
                    alt={bookTitle}
                    style={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 8,
                        marginBottom: 10,
                        aspectRatio: '3/4'
                    }}
                                                onError={(e) => {
                        e.target.src = '/logo192.png';
                    }}
                />
                
                {/* Headphone icon to indicate audio availability */}
                {(book.audio_url || book.bookaudio) && (
                    <div style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <span style={{ 
                            fontSize: 18,
                            color: 'white',
                            lineHeight: 1
                        }}>🎧</span>
                    </div>
                )}

                {/* Book icon to indicate reading availability */}
                {(book.bookfile || book.file_type === 'epub' || book.file_type === 'pdf') && (
                    <div style={{
                        position: 'absolute',
                        top: 52,
                        left: 10,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(4px)'
                    }}>
                        <span style={{ 
                            fontSize: 18,
                            color: 'white',
                            lineHeight: 1
                        }}>📖</span>
                    </div>
                )}
                
                {/* Hidden data for playlist context */}
                {book.audio_url || book.bookaudio ? (
                    <div data-track={JSON.stringify(trackData)} style={{ display: 'none' }} />
                ) : null}
                
                <button
                    onClick={handleLike}
                    disabled={isLikeLoading}
                    style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        background: 'none',
                        border: 'none',
                        cursor: isLikeLoading ? 'not-allowed' : 'pointer',
                        padding: 5,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        borderRadius: '50%',
                        width: 30,
                        height: 30,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: isLikeLoading ? 0.6 : 1
                    }}
                >
                    {isLikeLoading ? (
                        <div style={{
                            width: 16,
                            height: 16,
                            border: '2px solid #e7440d',
                            borderTop: '2px solid transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                    ) : (
                        <span style={{ 
                            fontSize: 16,
                            color: isLiked ? colors.appPrimary : colors.grey
                        }}>
                            {isLiked ? '❤️' : '🤍'}
                        </span>
                    )}
                </button>
                
                {/* Play button removed - headphone icon indicates audio availability */}
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                    <h3 style={{
                        ...commonStyles.textLightBold(16),
                        marginBottom: 4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: '1.2'
                    }}>
                        {bookTitle}
                    </h3>
                    <p style={{
                        ...commonStyles.textLightNormal(14),
                        color: colors.grey,
                        marginBottom: 8,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: '1.2'
                    }}>
                        {bookAuthor}
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 'auto' }}>
                    <span style={{ color: colors.appPrimary }}>★</span>
                    <span style={{ fontSize: 14, color: colors.grey }}>
                        {bookRating}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BookCard;

