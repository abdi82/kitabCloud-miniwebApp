import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookCard from '../BookCard';

const AllTabComponent = ({ homeData }) => {
  const navigate = useNavigate();
  const [comingSoonIndex, setComingSoonIndex] = useState(0);

  if (!homeData) {
    return <div style={{ padding: 24, textAlign: 'center', color: '#888' }}>No data available.</div>;
  }

  // File base URL for images and audio
  const FILE_BASE_URL = 'https://api.kitabcloud.se/storage/';

  // Helper function to safely get author name
  const getAuthorName = (author, authorName) => {
    if (typeof author === 'string') return author;
    if (author && typeof author === 'object' && author.name) return author.name;
    if (authorName) return authorName;
    return 'Unknown Author';
  };

  // Helper function to safely get cover image URL
  const getImageUrl = (coverimage, image) => {
    if (coverimage) return `${FILE_BASE_URL}${coverimage}`;
    if (image) return `${FILE_BASE_URL}${image}`;
    return '/favicon.ico';
  };

  // Helper function to sort books by Swahili first
  const sortBySwahiliFirst = (books) => {
    if (!books || !Array.isArray(books)) return [];
    
    return [...books].sort((a, b) => {
      const bookA = a.book || a;
      const bookB = b.book || b;

      // Swahili priority checks:
      const SWAHILI_ID = 7;
      
      const getCategoryName = (item) => {
        if (item.category_name) return item.category_name;
        if (item.category && typeof item.category === 'object') return item.category.name || item.category.category_name || '';
        return '';
      };

      const catA = getCategoryName(bookA);
      const catB = getCategoryName(bookB);

      const isASwahili = (bookA.language_id === SWAHILI_ID || bookA.language_id === SWAHILI_ID.toString() || bookA.language_id === 7 || bookA.language_id === '7') ||
                         (catA === 'Kiswahili Books') ||
                         (catA.toLowerCase().includes('swahili')) ||
                         (catA.toLowerCase().includes('kiswahili')) ||
                         (bookA.language?.name || bookA.language || '').toLowerCase().includes('swahili') ||
                         (bookA.language?.name || bookA.language || '').toLowerCase().includes('kiswahili');
                         
      const isBSwahili = (bookB.language_id === SWAHILI_ID || bookB.language_id === SWAHILI_ID.toString() || bookB.language_id === 7 || bookB.language_id === '7') ||
                         (catB === 'Kiswahili Books') ||
                         (catB.toLowerCase().includes('swahili')) ||
                         (catB.toLowerCase().includes('kiswahili')) ||
                         (bookB.language?.name || bookB.language || '').toLowerCase().includes('swahili') ||
                         (bookB.language?.name || bookB.language || '').toLowerCase().includes('kiswahili');
      
      if (isASwahili && !isBSwahili) return -1;
      if (!isASwahili && isBSwahili) return 1;
      return 0;
    });
  };

  // Ads Section
  const AdsSection = () => {
    const ad = (homeData.ads || [])[0];
    if (!ad) return null;
    const isVideo = ad.type === 'Video';
    const fileUrl = ad.file ? `${FILE_BASE_URL}${ad.file}` : '';
    const handleClick = () => {
      if (ad.redirect_url) {
        try {
          const url = ad.redirect_url.startsWith('http') ? ad.redirect_url : `https://${ad.redirect_url}`;
          const link = window.open(url, '_blank');
          
          // If popup blocked, redirect current window
          if (!link || link.closed || typeof link.closed === 'undefined') {
            window.location.href = url;
          }
        } catch (error) {
          // Fallback: redirect current window
          const url = ad.redirect_url.startsWith('http') ? ad.redirect_url : `https://${ad.redirect_url}`;
          window.location.href = url;
        }
      }
    };
    return (
      <div style={{ margin: '18px 0', cursor: ad.redirect_url ? 'pointer' : 'default' }} onClick={handleClick}>
        {isVideo ? (
          <video 
            width="100%" 
            height="180" 
            controls 
            style={{ borderRadius: 12, background: '#000' }}
            onError={(e) => {
              console.error('Video loading error:', e);
              e.target.style.display = 'none';
            }}
          >
            <source src={fileUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img 
            src={fileUrl} 
            alt={ad.title} 
            style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12 }}
            onError={(e) => {
              e.target.src = '/favicon.ico';
            }}
          />
        )}
        <div style={{ fontWeight: 600, fontSize: 16, marginTop: 8 }}>{ad.title}</div>
        {ad.description && <div style={{ color: '#555', fontSize: 14 }}>{ad.description}</div>}
      </div>
    );
  };

  // New Books Section - Get books from categoryWithBooks
  const NewBooksSection = () => {
    const categories = homeData?.categoryWithBooks || [];
    const allBooks = categories.flatMap(cat => cat.books || []);
    const validBooks = allBooks.filter(book => book && book.id);
    
    // Sort Swahili books first
    const sortedBooks = sortBySwahiliFirst(validBooks);
    
    if (!sortedBooks.length) {
      return (
        <div style={{ margin: '28px 0 0 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontWeight: 600, fontSize: 18 }}>New Books</div>
            <button
              style={{ background: 'none', border: 'none', color: '#e7440d', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}
              onClick={() => navigate('/all-books')}
            >
              See All
            </button>
          </div>
          <div style={{ textAlign: 'center', padding: 20, color: '#888' }}>
            No books available
          </div>
        </div>
      );
    }

    return (
      <div style={{ margin: '28px 0 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 18 }}>New Books</div>
          <button
            style={{ background: 'none', border: 'none', color: '#e7440d', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}
            onClick={() => navigate('/all-books')}
          >
            See All
          </button>
        </div>
        <div style={{ 
          display: 'flex', 
          gap: 16, 
          overflowX: 'auto', 
          paddingBottom: 8,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {sortedBooks.map((book) => {
            const authorName = getAuthorName(book.author, book.author_name);
            const safeBook = {
              id: book.id,
              title: book.title || 'Untitled',
              author: authorName,
              author_name: authorName,
              coverimage: getImageUrl(book.coverimage, book.image),
              image: book.image ? `${FILE_BASE_URL}${book.image}` : book.image,
              rating: book.rating || 0,
              is_liked: book.is_liked || false,
              audio_url: book.audio_url,
              bookaudio: book.bookaudio ? `${FILE_BASE_URL}${book.bookaudio}` : book.bookaudio,
              bookfile: book.bookfile ? `${FILE_BASE_URL}${book.bookfile}` : book.bookfile
            };
            
            return (
              <div key={book.id} style={{ minWidth: 160, maxWidth: 180 }}>
                <BookCard book={safeBook} />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Kiswahili Books Section - Filter books from Kiswahili category
  const KiswahiliBooksSection = () => {
    // Safety check for homeData
    if (!homeData) {
      console.log('KiswahiliBooksSection: homeData is not available');
      return null;
    }
    
    if (!homeData.categoryWithBooks || !Array.isArray(homeData.categoryWithBooks)) {
      console.log('KiswahiliBooksSection: categoryWithBooks is not available or not an array', homeData);
      return null;
    }
    
    const categories = homeData.categoryWithBooks || [];
    
    // Find Kiswahili category (case-insensitive match with multiple variations)
    let kiswahiliCategory = categories.find(cat => {
      const categoryName = (cat.name || cat.category_name || '').toLowerCase();
      // Check for various Kiswahili/Swahili variations
      return categoryName.includes('kiswahili') || 
             categoryName.includes('swahili') ||
             categoryName === 'kiswahili books' ||
             categoryName === 'swahili books';
    });
    
    // If category not found, try to find by checking all categories
    if (!kiswahiliCategory && categories.length > 0) {
      // Log available categories for debugging
      console.log('Available categories:', categories.map(cat => ({
        name: cat.name || cat.category_name,
        id: cat.id
      })));
      
      // Try alternative matching - look for any category with "kiswahili" or "swahili" in any form
      kiswahiliCategory = categories.find(cat => {
        const categoryName = (cat.name || cat.category_name || '').toLowerCase();
        const searchTerms = ['kiswahili', 'swahili', 'kiswahili books', 'swahili books'];
        return searchTerms.some(term => categoryName.includes(term));
      });
    }
    
    // Get books from the found category
    let kiswahiliBooks = kiswahiliCategory?.books || [];
    
    // If still no books, try filtering all books by language field (if available)
    if (!kiswahiliBooks.length && categories.length > 0) {
      const allBooks = categories.flatMap(cat => cat.books || []);
      kiswahiliBooks = allBooks.filter(book => {
        if (!book || !book.id) return false;
        const language = (book.language?.name || book.language || '').toLowerCase();
        return language.includes('kiswahili') || language.includes('swahili');
      });
    }
    
    const validBooks = kiswahiliBooks.filter(book => book && book.id);
    
    // Don't render if no books found
    if (!validBooks.length) {
      return null;
    }

    // Get category name for navigation
    const categoryNameForNav = kiswahiliCategory?.name || 
                                kiswahiliCategory?.category_name || 
                                'Kiswahili Books';

    // Handle navigation - if we have a category, navigate to it, otherwise navigate to all books
    const handleSeeAll = () => {
      if (kiswahiliCategory) {
        navigate(`/category/${categoryNameForNav}`);
      } else {
        navigate('/all-books');
      }
    };

    return (
      <div style={{ margin: '28px 0 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 18 }}>Kiswahili Books</div>
          <button
            style={{ background: 'none', border: 'none', color: '#e7440d', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}
            onClick={handleSeeAll}
          >
            See All
          </button>
        </div>
        <div style={{ 
          display: 'flex', 
          gap: 16, 
          overflowX: 'auto', 
          paddingBottom: 8,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {validBooks.map((book) => {
            const authorName = getAuthorName(book.author, book.author_name);
            const safeBook = {
              id: book.id,
              title: book.title || 'Untitled',
              author: authorName,
              author_name: authorName,
              coverimage: getImageUrl(book.coverimage, book.image),
              image: book.image ? `${FILE_BASE_URL}${book.image}` : book.image,
              rating: book.rating || 0,
              is_liked: book.is_liked || false,
              audio_url: book.audio_url,
              bookaudio: book.bookaudio ? `${FILE_BASE_URL}${book.bookaudio}` : book.bookaudio,
              bookfile: book.bookfile ? `${FILE_BASE_URL}${book.bookfile}` : book.bookfile
            };
            
            return (
              <div key={book.id} style={{ minWidth: 160, maxWidth: 180 }}>
                <BookCard book={safeBook} />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Audiobooks Section
  const AudiobooksSection = () => {
    const categories = homeData?.categoryWithBooks || [];
    const audiobookCategories = categories.filter(cat => 
        cat.books && cat.books.length > 0 && 
        cat.books.some(book => book.type === 'audio' || book.file_type === 'audio')
    );

    if (!audiobookCategories.length) return null;

    // Flatten all audiobooks from all categories
    const allAudiobooks = audiobookCategories.flatMap(cat => cat.books || []);

    return (
      <div style={{ margin: '32px 0 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 18 }}>Audiobooks</div>
          <button
            style={{ background: 'none', border: 'none', color: '#e7440d', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}
            onClick={() => navigate('/all-audiobooks')}
          >
            See All
          </button>
        </div>
        <div style={{ 
          display: 'flex', 
          gap: 16, 
          overflowX: 'auto', 
          paddingBottom: 8,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {allAudiobooks.map((book) => {
            const authorName = getAuthorName(book.author, book.author_name);
            const safeBook = {
              id: book.id,
              title: book.title || 'Untitled',
              author: authorName,
              author_name: authorName,
              coverimage: getImageUrl(book.coverimage, book.image),
              image: book.image ? `${FILE_BASE_URL}${book.image}` : book.image,
              rating: book.rating || 0,
              is_liked: book.is_liked || false,
              audio_url: book.audio_url,
              bookaudio: book.bookaudio ? `${FILE_BASE_URL}${book.bookaudio}` : book.bookaudio
            };
            
            return (
              <div key={book.id} style={{ minWidth: 160, maxWidth: 180 }}>
                <BookCard book={safeBook} />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Ebooks Section
  const EbooksSection = () => {
    const categories = homeData?.categoryWithBooks || [];
    const ebookCategories = categories.filter(cat => 
        cat.books && cat.books.length > 0 && 
        cat.books.some(book => book.type === 'epub' || book.file_type === 'epub' || book.type === 'pdf' || book.file_type === 'pdf')
    );

    if (!ebookCategories.length) return null;

    // Flatten all ebooks from all categories
    const allEbooks = ebookCategories.flatMap(cat => cat.books || []);

    return (
      <div style={{ margin: '32px 0 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 18 }}>Ebooks</div>
          <button
            style={{ background: 'none', border: 'none', color: '#e7440d', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}
            onClick={() => navigate('/all-ebooks')}
          >
            See All
          </button>
        </div>
        <div style={{ 
          display: 'flex', 
          gap: 16, 
          overflowX: 'auto', 
          paddingBottom: 8,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {allEbooks.map((book) => {
            const authorName = getAuthorName(book.author, book.author_name);
            const safeBook = {
              id: book.id,
              title: book.title || 'Untitled',
              author: authorName,
              author_name: authorName,
              coverimage: getImageUrl(book.coverimage, book.image),
              image: book.image ? `${FILE_BASE_URL}${book.image}` : book.image,
              rating: book.rating || 0,
              is_liked: book.is_liked || false,
              audio_url: book.audio_url,
              bookaudio: book.bookaudio,
              bookfile: book.bookfile ? `${FILE_BASE_URL}${book.bookfile}` : book.bookfile
            };
            
            return (
              <div key={book.id} style={{ minWidth: 160, maxWidth: 180 }}>
                <BookCard book={safeBook} />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Magazines Section
  const MagazinesSection = () => {
    const magazines = homeData?.categoryWithBooks?.flatMap(cat => 
        cat.books?.filter(book => book.is_magazine === 1) || []
    ) || [];

    if (!magazines.length) return null;

    return (
      <div style={{ margin: '32px 0 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 18 }}>Magazines</div>
          <button
            style={{ background: 'none', border: 'none', color: '#e7440d', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}
            onClick={() => navigate('/all-magazines')}
          >
            See All
          </button>
        </div>
        <div style={{ 
          display: 'flex', 
          gap: 16, 
          overflowX: 'auto', 
          paddingBottom: 8,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {magazines.map((magazine) => {
            const authorName = getAuthorName(magazine.author, magazine.author_name);
            const safeBook = {
              id: magazine.id,
              title: magazine.title || 'Untitled',
              author: authorName,
              author_name: authorName,
              coverimage: getImageUrl(magazine.coverimage, magazine.image),
              image: magazine.image ? `${FILE_BASE_URL}${magazine.image}` : magazine.image,
              rating: magazine.rating || 0,
              is_liked: magazine.is_liked || false,
              audio_url: magazine.audio_url,
              bookaudio: magazine.bookaudio
            };
            
            return (
              <div key={magazine.id} style={{ minWidth: 160, maxWidth: 180 }}>
                <BookCard book={safeBook} />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Podcasts Section
  const PodcastsSection = () => {
    const podcasts = homeData?.categoryWithPodcast?.flatMap(cat => cat.podcasts || []) || [];

    if (!podcasts.length) return null;

    return (
      <div style={{ margin: '32px 0 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 18 }}>Podcasts</div>
          <button
            style={{ background: 'none', border: 'none', color: '#e7440d', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}
            onClick={() => navigate('/all-podcasts')}
          >
            See All
          </button>
        </div>
        <div style={{ 
          display: 'flex', 
          gap: 16, 
          overflowX: 'auto', 
          paddingBottom: 8,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {podcasts.map((podcast) => {
            const authorName = getAuthorName(podcast.author, podcast.author_name);
            const safeBook = {
              id: podcast.id,
              title: podcast.title || 'Untitled',
              author: authorName,
              author_name: authorName,
              coverimage: getImageUrl(podcast.coverimage, podcast.image),
              image: podcast.image ? `${FILE_BASE_URL}${podcast.image}` : podcast.image,
              rating: podcast.rating || 0,
              is_liked: podcast.is_liked || false,
              audio_url: podcast.audio_url,
              bookaudio: podcast.bookaudio
            };
            
            return (
              <div key={podcast.id} style={{ minWidth: 160, maxWidth: 180 }}>
                <BookCard book={safeBook} />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Videos Section
  const VideosSection = () => {
    const videos = []

    if (!videos.length) return null;

    return (
      <div style={{ margin: '32px 0 0 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 18 }}>Videos</div>
          <button
            style={{ background: 'none', border: 'none', color: '#e7440d', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}
            onClick={() => navigate('/all-videos')}
          >
            See All
          </button>
        </div>
        <div style={{ 
          display: 'flex', 
          gap: 16, 
          overflowX: 'auto', 
          paddingBottom: 8,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {videos.map((video) => {
            const authorName = getAuthorName(video.author, video.author_name);
            const safeBook = {
              id: video.id,
              title: video.title || 'Untitled',
              author: authorName,
              author_name: authorName,
              coverimage: getImageUrl(video.coverimage, video.image),
              image: video.image ? `${FILE_BASE_URL}${video.image}` : video.image,
              rating: video.rating || 0,
              is_liked: video.is_liked || false,
              audio_url: video.audio_url,
              bookaudio: video.bookaudio
            };
            
            return (
              <div key={video.id} style={{ minWidth: 160, maxWidth: 180 }}>
                <BookCard book={safeBook} />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Categories with Books Section
  const CategoriesWithBooksSection = () => {
    const categories = homeData?.categoryWithBooks || [];
    
    if (!categories.length) return null;

    return (
      <div style={{ margin: '32px 0 0 0' }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 16 }}>Categories</div>
        {categories.map((category, categoryIndex) => {
          const books = category.books || [];
          if (!books.length) return null;

          return (
            <div key={category.id || categoryIndex} style={{ marginBottom: 32 }}>
              {/* Category Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: 12 
              }}>
                <div style={{ 
                  fontWeight: 600, 
                  fontSize: 16,
                  color: '#333'
                }}>
                  {category.name || category.category_name || 'Unnamed Category'}
                </div>
                <button
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#e7440d', 
                    fontWeight: 500, 
                    fontSize: 14, 
                    cursor: 'pointer' 
                  }}
                  onClick={() => navigate(`/category/${category.name || category.category_name || 'unknown'}`)}
                >
                  See All
                </button>
              </div>
              
              {/* Books Grid */}
              <div style={{ 
                display: 'flex', 
                gap: 16, 
                overflowX: 'auto', 
                paddingBottom: 8,
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}>
                {books.map((book) => {
                  const authorName = getAuthorName(book.author, book.author_name);
                  const safeBook = {
                    id: book.id,
                    title: book.title || 'Untitled',
                    author: authorName,
                    author_name: authorName,
                    coverimage: getImageUrl(book.coverimage, book.image),
                    image: book.image ? `${FILE_BASE_URL}${book.image}` : book.image,
                    rating: book.rating || 0,
                    is_liked: book.is_liked || false,
                    audio_url: book.audio_url,
                    bookaudio: book.bookaudio ? `${FILE_BASE_URL}${book.bookaudio}` : book.bookaudio,
                    bookfile: book.bookfile ? `${FILE_BASE_URL}${book.bookfile}` : book.bookfile
                  };
                  
                  return (
                    <div key={book.id} style={{ minWidth: 160, maxWidth: 180 }}>
                      <BookCard book={safeBook} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Coming Soon Section
  const ComingSoonSection = () => {
    const comingSoonItems = homeData.coming_soon || [];
    if (!comingSoonItems.length) return null;
    
    const currentItem = comingSoonItems[comingSoonIndex];
    
    const goToNext = () => {
      setComingSoonIndex((prev) => (prev + 1) % comingSoonItems.length);
    };
    
    const goToPrev = () => {
      setComingSoonIndex((prev) => (prev - 1 + comingSoonItems.length) % comingSoonItems.length);
    };
    
    const handleCardClick = () => {
      if (currentItem && currentItem.id) {
        navigate(`/book/${currentItem.id}`);
      }
    };
    
    return (
      <div style={{ margin: '32px 0 0 0' }}>
        {/* Section Header with "Coming Soon" badge */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A52 100%)',
            padding: '6px 18px',
            borderRadius: 20,
            boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)'
          }}>
            <span style={{
              color: 'white',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              Coming Soon
            </span>
          </div>
          
          {/* Carousel Indicators */}
          {comingSoonItems.length > 1 && (
            <div style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center'
            }}>
              {comingSoonItems.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setComingSoonIndex(index);
                  }}
                  style={{
                    width: index === comingSoonIndex ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    border: 'none',
                    background: index === comingSoonIndex ? '#FF6B6B' : '#D0D0D0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: 0
                  }}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Image Card with Carousel */}
        <div 
          onClick={handleCardClick}
          style={{ 
            position: 'relative',
            width: '100%',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.15)';
          }}
        >
          {/* Image Container */}
          <div style={{ 
            position: 'relative',
            width: '100%',
            paddingBottom: '140%', // 5:7 aspect ratio
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}>
            <img
              src={currentItem.coverimage ? `${FILE_BASE_URL}${currentItem.coverimage}` : '/logo192.png'}
              alt={currentItem.title}
              style={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center'
              }}
              onError={(e) => {
                e.target.src = '/logo192.png';
              }}
            />
            
            {/* Gradient Overlay */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '60%',
              background: 'linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.3) 50%, transparent 100%)',
              pointerEvents: 'none'
            }}></div>
            
            {/* Navigation Arrows (if multiple items) */}
            {comingSoonItems.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrev();
                  }}
                  style={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.3)'; }}
                  onMouseLeave={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.2)'; }}
                >
                  <span style={{ fontSize: 20, color: 'white' }}>‹</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.3)'; }}
                  onMouseLeave={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.2)'; }}
                >
                  <span style={{ fontSize: 20, color: 'white' }}>›</span>
                </button>
              </>
            )}
            
            {/* Book Info at Bottom */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '24px 20px',
              color: 'white'
            }}>
              <h2 style={{
                fontSize: 28,
                fontWeight: 800,
                margin: '0 0 8px 0',
                textShadow: '0 2px 12px rgba(0, 0, 0, 0.5)',
                lineHeight: '1.2',
                letterSpacing: '-0.5px'
              }}>
                {currentItem.title}
              </h2>
              
              {/* Author or Additional Info */}
              {currentItem.author && (
                <div style={{
                  fontSize: 14,
                  fontWeight: 500,
                  opacity: 0.95,
                  textShadow: '0 1px 6px rgba(0, 0, 0, 0.4)'
                }}>
                  {typeof currentItem.author === 'object' ? currentItem.author.name : currentItem.author}
                </div>
              )}
              
              {/* Sparkle Decoration */}
              <div style={{
                marginTop: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <span style={{ fontSize: 18, filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))' }}>✨</span>
                <span style={{ 
                  fontSize: 13, 
                  fontWeight: 600,
                  opacity: 0.9,
                  textShadow: '0 1px 4px rgba(0, 0, 0, 0.4)'
                }}>
                  Anticipated Release
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Top Authors Section - from top_played_author
  const TopAuthorsSection = () => {
    const topAuthors = homeData.top_played_author || [];
    if (!topAuthors.length) return null;
    
    return (
      <div style={{ margin: '32px 0 0 0' }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 10 }}>Top Authors</div>
        <div style={{ 
          display: 'flex', 
          gap: 16, 
          overflowX: 'auto', 
          paddingBottom: 8,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {topAuthors.map((item, index) => {
            const author = item.author || item;
            const authorId = author.id || index;
            const authorName = author.name || 'Unknown Author';
            const youtubeUrl = author.youtube || author.youtube_url || author.youtube_channel || null;
            const profileImage = author.image ? `${FILE_BASE_URL}${author.image}` : 
                                 author.profile_image ? `${FILE_BASE_URL}${author.profile_image}` : 
                                 '/logo192.png';
            
            const handleClick = () => {
              if (youtubeUrl) {
                try {
                  const url = youtubeUrl.startsWith('http') ? youtubeUrl : `https://${youtubeUrl}`;
                  const link = window.open(url, '_blank');
                  
                  // If popup blocked, redirect current window
                  if (!link || link.closed || typeof link.closed === 'undefined') {
                    window.location.href = url;
                  }
                } catch (error) {
                  // Fallback: redirect current window
                  const url = youtubeUrl.startsWith('http') ? youtubeUrl : `https://${youtubeUrl}`;
                  window.location.href = url;
                }
              }
            };
            
            return (
              <div 
                key={authorId} 
                onClick={handleClick}
                style={{ 
                  minWidth: 120, 
                  minHeight: youtubeUrl ? 155 : 130,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: youtubeUrl ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  padding: '12px 8px',
                  borderRadius: '12px',
                  backgroundColor: 'transparent',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={(e) => {
                  if (youtubeUrl) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.backgroundColor = '#fff5f3';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <img
                  src={profileImage}
                  alt={authorName}
                  style={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%', 
                    objectFit: 'cover', 
                    marginBottom: 10,
                    border: youtubeUrl ? '2px solid #e7440d' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onError={(e) => {
                    e.target.src = '/logo192.png';
                  }}
                />
                <div style={{ 
                  fontSize: 14, 
                  fontWeight: 500, 
                  marginBottom: youtubeUrl ? 6 : 0, 
                  lineHeight: 1.3,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  width: '100%'
                }}>
                  {authorName}
                </div>
                {youtubeUrl && (
                  <div style={{ fontSize: 10, color: '#e7440d', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <span>▶️</span> View YouTube
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Top Books Section - from top_played_book
  const TopBooksSection = () => {
    const topBooksRaw = homeData.top_played_book || [];
    if (!topBooksRaw.length) return null;
    
    // Debug: Log top books before sorting
    console.log('--- TOP BOOKS BEFORE SORTING ---');
    topBooksRaw.forEach((item, index) => {
      const b = item.book || item;
      console.log(`TopBook Raw [${index}]: "${b.title}" | Category: "${b.category_name}" | LangID: ${b.language_id}`);
    });

    // Sort Swahili books first
    const topBooks = sortBySwahiliFirst(topBooksRaw);
    
    // Debug: Log top books after sorting
    console.log('--- TOP BOOKS AFTER SORTING ---');
    topBooks.forEach((item, index) => {
      const b = item.book || item;
      console.log(`TopBook Sorted [${index}]: "${b.title}" | Category: "${b.category_name}" | LangID: ${b.language_id}`);
    });
    
    return (
      <div style={{ margin: '32px 0 0 0' }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 10 }}>Top Books</div>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
          gap: 16 
        }}>
          {topBooks.map((item, index) => {
            const book = item.book || item;
            const bookId = book.id || index;
            
            // Get author name safely
            const authorName = getAuthorName(book.author, book.author_name);
            
            // Prepare book data for BookCard component
            const coverImageUrl = book.coverimage ? `${FILE_BASE_URL}${book.coverimage}` : (book.image ? `${FILE_BASE_URL}${book.image}` : '/logo192.png');
            const imageUrl = book.image ? `${FILE_BASE_URL}${book.image}` : book.image;
            
            const bookData = {
              id: bookId,
              title: book.title || 'Untitled',
              author: authorName,
              author_name: book.author_name || authorName,
              coverimage: coverImageUrl,
              image: imageUrl,
              rating: book.rating || 0,
              is_liked: book.is_liked || false,
              audio_url: book.audio_url,
              bookaudio: book.bookaudio ? `${FILE_BASE_URL}${book.bookaudio}` : book.bookaudio
            };
            
            return (
              <BookCard 
                key={bookId} 
                book={bookData}
              />
            );
          })}
        </div>
      </div>
    );
  };

  // Top Readers Section - from top_played_reader
  const TopReadersSection = () => {
    const topReaders = homeData.top_played_reader || [];
    if (!topReaders.length) return null;
    
    return (
      <div style={{ margin: '32px 0 0 0' }}>
        <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 10 }}>Top Readers</div>
        <div style={{ 
          display: 'flex', 
          gap: 16, 
          overflowX: 'auto', 
          paddingBottom: 8,
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {topReaders.map((item, index) => {
            const reader = item.reader || item;
            const readerId = reader.id || index;
            const readerName = reader.name || 'Unknown Reader';
            const youtubeUrl = reader.youtube || reader.youtube_url || reader.youtube_channel || null;
            const profileImage = reader.image ? `${FILE_BASE_URL}${reader.image}` : 
                                 reader.profile_image ? `${FILE_BASE_URL}${reader.profile_image}` : 
                                 '/logo192.png';
            
            const handleClick = () => {
              if (youtubeUrl) {
                try {
                  const url = youtubeUrl.startsWith('http') ? youtubeUrl : `https://${youtubeUrl}`;
                  const link = window.open(url, '_blank');
                  
                  // If popup blocked, redirect current window
                  if (!link || link.closed || typeof link.closed === 'undefined') {
                    window.location.href = url;
                  }
                } catch (error) {
                  // Fallback: redirect current window
                  const url = youtubeUrl.startsWith('http') ? youtubeUrl : `https://${youtubeUrl}`;
                  window.location.href = url;
                }
              }
            };
            
            return (
              <div 
                key={readerId} 
                onClick={handleClick}
                style={{ 
                  minWidth: 120, 
                  minHeight: youtubeUrl ? 155 : 130,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: youtubeUrl ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  padding: '12px 8px',
                  borderRadius: '12px',
                  backgroundColor: 'transparent',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={(e) => {
                  if (youtubeUrl) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.backgroundColor = '#fff5f3';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <img
                  src={profileImage}
                  alt={readerName}
                  style={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%', 
                    objectFit: 'cover', 
                    marginBottom: 10,
                    border: youtubeUrl ? '2px solid #e7440d' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onError={(e) => {
                    e.target.src = '/logo192.png';
                  }}
                />
                <div style={{ 
                  fontSize: 14, 
                  fontWeight: 500, 
                  marginBottom: youtubeUrl ? 6 : 0, 
                  lineHeight: 1.3,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  width: '100%'
                }}>
                  {readerName}
                </div>
                {youtubeUrl && (
                  <div style={{ fontSize: 10, color: '#e7440d', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    <span>▶️</span> View YouTube
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      padding: '0 16px 20px 16px', 
      maxWidth: 420, 
      margin: '0 auto',
      WebkitOverflowScrolling: 'touch'
    }}>
      <AdsSection />
      <TopAuthorsSection />
      <NewBooksSection />
      <KiswahiliBooksSection />
      <TopBooksSection />
      <TopReadersSection />
      <AudiobooksSection />
      <EbooksSection />
      <MagazinesSection />
      <PodcastsSection />
      <VideosSection />
      <ComingSoonSection />
      <CategoriesWithBooksSection />
    </div>
  );
};

export default AllTabComponent; 