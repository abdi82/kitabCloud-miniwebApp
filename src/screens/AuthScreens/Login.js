import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { commonStyles } from '../../constants/commonStyles';
import { colors } from '../../constants/colors';
import { apiFunctions } from '../../apiService/apiFunctions';
import { useAuth } from '../../context/AuthContext';

// Inline components to avoid import issues
const PrimaryTextInput = ({ 
    placeholder, 
    value, 
    onChangeText, 
    secureEntry = false, 
    imageSource,
    style = {},
    ...props 
}) => {
    // Passwords get an eye to show / hide what was typed.
    const [visible, setVisible] = useState(false);
    return (
        <div style={{
            position: 'relative',
            marginBottom: 15,
            ...style
        }}>
            {imageSource && (
                <img 
                    src={imageSource} 
                    alt="icon" 
                    style={{
                        position: 'absolute',
                        left: 15,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 20,
                        height: 20,
                        zIndex: 1
                    }}
                />
            )}
            <input
                type={secureEntry && !visible ? 'password' : 'text'}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChangeText(e.target.value)}
                style={{
                    width: '100%',
                    padding: '15px',
                    paddingLeft: imageSource ? '50px' : '15px',
                    paddingRight: secureEntry ? '48px' : '15px',
                    border: `1px solid ${colors.lightGrey}`,
                    borderRadius: 8,
                    fontSize: 16,
                    outline: 'none',
                    transition: 'border-color 0.3s ease',
                    backgroundColor: colors.white
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = colors.appPrimary;
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = colors.lightGrey;
                }}
                {...props}
            />
            {secureEntry && (
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={visible ? 'Hide password' : 'Show password'}
                    style={{
                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', padding: 6, cursor: 'pointer', lineHeight: 0
                    }}
                >
                    {visible ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                </button>
            )}
        </div>
    );
};

const CommonButton = ({ 
    buttonTitle, 
    onPress, 
    isLoading = false,
    customStyles = {}, 
    customTextStyles = {},
    disabled = false
}) => {
    return (
        <button
            onClick={onPress}
            disabled={disabled || isLoading}
            style={{
                backgroundColor: disabled ? colors.grey : colors.appPrimary,
                color: colors.white,
                padding: '12px 24px',
                border: 'none',
                borderRadius: 8,
                fontSize: 16,
                fontWeight: '600',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 48,
                ...customStyles
            }}
            onMouseEnter={(e) => {
                if (!disabled) {
                    e.target.style.backgroundColor = '#d13a0b';
                }
            }}
            onMouseLeave={(e) => {
                if (!disabled) {
                    e.target.style.backgroundColor = colors.appPrimary;
                }
            }}
        >
            {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                        width: 20,
                        height: 20,
                        border: `2px solid ${colors.white}`,
                        borderTop: `2px solid transparent`,
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginRight: 8
                    }}></div>
                    Loading...
                </div>
            ) : (
                <span style={customTextStyles}>{buttonTitle}</span>
            )}
        </button>
    );
};

const ErrorToast = ({ message, isVisible, onClose }) => {
    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 20,
            right: 20,
            backgroundColor: colors.red,
            color: colors.white,
            padding: '15px 20px',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            maxWidth: 300,
            animation: 'slideIn 0.3s ease'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{message}</span>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: colors.white,
                        fontSize: 18,
                        cursor: 'pointer',
                        marginLeft: 10
                    }}
                >
                    ×
                </button>
            </div>
        </div>
    );
};

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const validatePassword = (password) => {
        // Password must be at least 8 characters with at least one uppercase, one lowercase, one number, and one special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    const onLoginPress = async () => {
        if (!email.trim()) {
            setErrorMessage('Please enter a valid email address to continue');
            setShowError(true);
            return;
        }
        
        if (!password) {
            setErrorMessage('Password cannot be empty');
            setShowError(true);
            return;
        }

        // Validate password strength
        if (!validatePassword(password)) {
            setErrorMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
            setShowError(true);
            return;
        }

        try {
            setIsLoading(true);
            const loginData = {
                email: email.trim(),
                password: password,
                device_token: 'web',
                device_type: 'web',
                fcm_token: 'web-token'
            };

            const response = await apiFunctions.login(loginData);
            setIsLoading(false);

            // Check if the response has data and success property
            if (response && response.data) {
                if (response.data.success === true) {
                    const token = response.data.token;
                    const userData = response.data.user || response.data;
                    login(userData, token);
                    navigate('/home');
                } else {
                    // Handle unsuccessful login
                    setErrorMessage(response.data.message || 'Login failed. Please check your credentials.');
                    setShowError(true);
                }
            } else {
                // Handle case where response structure is different
                setErrorMessage('Invalid response from server');
                setShowError(true);
            }
        } catch (err) {
            setIsLoading(false);
            console.error('Login error:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setErrorMessage(err.response.data.message);
            } else if (err.message) {
                setErrorMessage(err.message);
            } else {
                setErrorMessage('Login failed. Please try again.');
            }
            setShowError(true);
        }
    };

    const onForgotPasswordPress = () => {
        navigate('/forgot-password');
    };

    const onSignUpPress = () => {
        navigate('/signup');
    };

    return (
        <div style={commonStyles.fullScreenContainer}>
            <div style={commonStyles.fullScreenInnerContainer}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minHeight: '100vh',
                    paddingTop: 40
                }}>
                    <div style={{
                        width: 200,
                        height: 150,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 20
                    }}>
                        <img
                            src="https://usercontent.one/wp/kitabcloud.se/wp-content/uploads/2022/04/kitab.jpg"
                            alt="KitabCloud Logo"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                borderRadius: 12
                            }}
                        />
                    </div>

                    <h1 style={commonStyles.textLightBold(32, {
                        color: colors.black,
                        marginBottom: 10,
                        textAlign: 'center'
                    })}>
                        Login
                    </h1>

                    <div style={{
                        width: '100%',
                        maxWidth: 380,
                        background: '#fff',
                        borderRadius: 12,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
                        padding: '32px 20px',
                        margin: '0 auto',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}>
                        <div style={{
                            width: '100%',
                            maxWidth: 400,
                            marginBottom: 20
                        }}>
                            <PrimaryTextInput 
                                placeholder='Email' 
                                value={email} 
                                onChangeText={setEmail}
                            />
                            
                            <PrimaryTextInput 
                                placeholder='Password' 
                                value={password} 
                                onChangeText={setPassword}
                                secureEntry={true}
                            />
                            
                            <button
                                onClick={onForgotPasswordPress}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: colors.appPrimary,
                                    fontSize: 16,
                                    cursor: 'pointer',
                                    alignSelf: 'flex-end',
                                    marginBottom: 20
                                }}
                            >
                                Forgot Password?
                            </button>
                            
                            <CommonButton
                                isLoading={isLoading} 
                                buttonTitle='Login' 
                                onPress={onLoginPress} 
                                customStyles={{ 
                                    width: '100%', 
                                    marginBottom: 20 
                                }} 
                            />
                            
                            <p style={commonStyles.textLightNormal(16, { 
                                color: colors.black, 
                                textAlign: 'center' 
                            })}>
                                New to KitabCloud?
                                <button
                                    onClick={onSignUpPress}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: colors.appPrimary,
                                        fontSize: 16,
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        marginLeft: 5
                                    }}
                                >
                                    Register Now
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            
            <ErrorToast 
                message={errorMessage} 
                isVisible={showError} 
                onClose={() => setShowError(false)} 
            />
        </div>
    );
};

export default Login; 