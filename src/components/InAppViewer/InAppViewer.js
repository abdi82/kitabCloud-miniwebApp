import React, { useState, useEffect } from 'react';
import { colors } from '../../constants/colors';
import { commonStyles } from '../../constants/commonStyles';

const InAppViewer = ({ fileUrl, fileName, fileType, onClose }) => {
    console.log('fileUrl', fileUrl); // this conatin the real url of the file
    const [loading, setLoading] = useState(true);
    const [iframeLoading, setIframeLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [isMpesa, setIsMpesa] = useState(false);

    useEffect(() => {
        // Detect if running inside M-PESA mini-app
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isMpesaEnv = /M-PESA|Mpesa|Daraja/i.test(userAgent);
        setIsMpesa(isMpesaEnv);

        if (fileUrl) {
            // For PDFs, we'll use an iframe with PDF.js or direct PDF viewing
            // For other file types, we'll show a download option
            setPdfUrl(fileUrl);
            setLoading(false);
            // If it's Mpesa, we don't need iframe loading since we show a button
            if (isMpesaEnv) {
                setIframeLoading(false);
            } else {
                // Simulate progress while iframe loads
                let interval = setInterval(() => {
                    setProgress(prev => {
                        if (prev >= 90) {
                            clearInterval(interval);
                            return 90;
                        }
                        return prev + 5;
                    });
                }, 500);
                return () => clearInterval(interval);
            }
        }
    }, [fileUrl]);

    const handleDownload = () => {
        try {
            // Create a temporary link to download the file
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = fileName || 'document';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download failed:', error);
            setError('Download failed. Please try again.');
        }
    };

    const isPdf = fileType?.toLowerCase() === 'pdf' || 
                  fileName?.toLowerCase().endsWith('.pdf') ||
                  fileUrl?.toLowerCase().includes('.pdf') ||
                  fileType?.toLowerCase().includes('pdf') ||
                  fileUrl?.toLowerCase().includes('magazine');

    const isEpub = fileType?.toLowerCase() === 'epub' || 
                   fileName?.toLowerCase().endsWith('.epub') ||
                   fileUrl?.toLowerCase().includes('.epub');

    const isImage = fileType?.toLowerCase().includes('image') ||
                   fileName?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/);

    if (loading) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: colors.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000
            }}>
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

    if (error) {
        return (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: colors.white,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2000,
                padding: 20
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                    <h3 style={{ ...commonStyles.textLightBold(18), marginBottom: 8 }}>Unable to Load Document</h3>
                    <p style={{ ...commonStyles.textLightNormal(14), color: colors.grey, marginBottom: 20 }}>
                        {error}
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                        <button
                            onClick={handleDownload}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: colors.appPrimary,
                                color: colors.white,
                                border: 'none',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontSize: 14
                            }}
                        >
                            Download Instead
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: colors.lightGrey,
                                color: colors.grey,
                                border: 'none',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontSize: 14
                            }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: colors.white,
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: `1px solid ${colors.lightGrey}`,
                background: colors.white
            }}>
                <h3 style={{
                    ...commonStyles.textLightBold(16),
                    margin: 0,
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {fileName || 'Document Viewer'}
                </h3>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                        onClick={handleDownload}
                        style={{
                            padding: '6px 12px',
                            backgroundColor: colors.appPrimary,
                            color: colors.white,
                            border: 'none',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 12
                        }}
                    >
                        Download
                    </button>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: 24,
                            cursor: 'pointer',
                            padding: 4
                        }}
                    >
                        ×
                    </button>
                </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                {isPdf && !isMpesa && (
                    <>
                        {iframeLoading && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 4,
                                background: colors.lightGrey,
                                zIndex: 10
                            }}>
                                <div style={{
                                    width: `${progress}%`,
                                    height: '100%',
                                    background: colors.appPrimary,
                                    transition: 'width 0.3s ease-out'
                                }}></div>
                            </div>
                        )}
                        {iframeLoading && (
                            <div style={{
                                position: 'absolute',
                                top: 4,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: '#f8f9fa',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 1
                            }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{
                                        width: 40,
                                        height: 40,
                                        border: `3px solid ${colors.lightGrey}`,
                                        borderTop: `3px solid ${colors.appPrimary}`,
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite',
                                        margin: '0 auto 16px'
                                    }}></div>
                                    <p style={{ ...commonStyles.textLightNormal(14), color: colors.grey }}>
                                        Loading magazine... {progress}%
                                    </p>
                                </div>
                            </div>
                        )}
                        <iframe
                            src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none'
                            }}
                            title={fileName || 'PDF Document'}
                            onLoad={() => {
                                setProgress(100);
                                setTimeout(() => setIframeLoading(false), 300);
                            }}
                            onError={() => {
                                setIframeLoading(false);
                                setError('Failed to load PDF. The file may be corrupted or not accessible.');
                            }}
                        />
                    </>
                )}
                
                {isPdf && isMpesa ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        padding: 24,
                        textAlign: 'center',
                        background: '#f8f9fa'
                    }}>
                        <div style={{ fontSize: 64, marginBottom: 24 }}>📄</div>
                        <h3 style={{ ...commonStyles.textLightBold(20), marginBottom: 12 }}>Open in Mini-App</h3>
                        <p style={{ ...commonStyles.textLightNormal(16), color: colors.grey, maxWidth: 320, marginBottom: 32, lineHeight: 1.6 }}>
                            The M-PESA mini-app doesn't support viewing PDFs directly inside the app. Please click the button below to view the book.
                        </p>
                        <button
                            onClick={handleDownload}
                            style={{
                                padding: '16px 32px',
                                backgroundColor: colors.appPrimary,
                                color: colors.white,
                                border: 'none',
                                borderRadius: 12,
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                fontSize: 16,
                                width: '100%',
                                maxWidth: 280,
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        >
                            Open Book
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                marginTop: 16,
                                padding: '12px 24px',
                                backgroundColor: 'transparent',
                                color: colors.grey,
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: 14
                            }}
                        >
                            Back to Details
                        </button>
                    </div>
                ) : isEpub ? (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        padding: 20,
                        textAlign: 'center',
                        background: '#f8f9fa'
                    }}>
                        <div style={{ fontSize: 64, marginBottom: 20 }}>📚</div>
                        <h3 style={{ ...commonStyles.textLightBold(20), marginBottom: 12 }}>ePub Reader Coming Soon</h3>
                        <p style={{ ...commonStyles.textLightNormal(16), color: colors.grey, maxWidth: 300, marginBottom: 24, lineHeight: 1.5 }}>
                            We are working on an integrated ePub reader. In the meantime, you can download the file to read it in your favorite ePub reader app.
                        </p>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                onClick={handleDownload}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: colors.appPrimary,
                                    color: colors.white,
                                    border: 'none',
                                    borderRadius: 10,
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: 15,
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                            >
                                Download ePub
                            </button>
                            <button
                                onClick={onClose}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: colors.white,
                                    color: colors.grey,
                                    border: `1px solid ${colors.lightGrey}`,
                                    borderRadius: 10,
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    fontSize: 15
                                }}
                            >
                                Not Now
                            </button>
                        </div>
                    </div>
                ) : isImage ? (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        padding: 20
                    }}>
                        <img
                            src={pdfUrl}
                            alt={fileName || 'Image'}
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain'
                            }}
                            onError={() => setError('Failed to load image. The file may be corrupted or not accessible.')}
                        />
                    </div>
                ) : (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        padding: 20,
                        textAlign: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                            <h3 style={{ ...commonStyles.textLightBold(18), marginBottom: 8 }}>
                                Document Preview Not Available
                            </h3>
                            <p style={{ ...commonStyles.textLightNormal(14), color: colors.grey, marginBottom: 20 }}>
                                This file type cannot be previewed in the app. You can download it to view on your device.
                            </p>
                            <button
                                onClick={handleDownload}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: colors.appPrimary,
                                    color: colors.white,
                                    border: 'none',
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    fontSize: 14
                                }}
                            >
                                Download Document
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InAppViewer;
