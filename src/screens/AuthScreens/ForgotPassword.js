import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { commonStyles } from '../../constants/commonStyles';
import { colors } from '../../constants/colors';
import { apiFunctions } from '../../apiService/apiFunctions';

// Inline components
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

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    // Step 1: email → a 6-digit code is emailed. Step 2: code + new password.
    const [step, setStep] = useState('email');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showError, setShowError] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const navigate = useNavigate();

    const fail = (message) => {
        setIsLoading(false);
        setErrorMessage(message || 'Something went wrong. Please try again.');
        setShowError(true);
    };

    const onSendCode = async () => {
        if (!email.trim()) return fail('Please enter your email address');
        try {
            setIsLoading(true);
            const res = await apiFunctions.forgotPassword({ email: email.trim() });
            setIsLoading(false);
            if (!res || !res.status) return fail(res && res.message);
            setShowError(false);
            setSuccessMessage('We sent a 6-digit code to your email (check Spam too).');
            setShowSuccess(true);
            setStep('code');
        } catch (err) {
            fail(err && err.response && err.response.data && err.response.data.message);
        }
    };

    const onResetPassword = async () => {
        if (code.replace(/\D/g, '').length !== 6) return fail('Enter the 6-digit code from the email');
        if (newPassword.length < 6) return fail('The new password must be at least 6 characters');
        try {
            setIsLoading(true);
            const res = await apiFunctions.resetPassword({
                email: email.trim(), otp: code.trim(), password: newPassword, password_confirmation: newPassword,
            });
            setIsLoading(false);
            if (!res || !res.status) return fail(res && res.message);
            setShowError(false);
            setSuccessMessage('Your password has been changed. You can now log in.');
            setShowSuccess(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            fail(err && err.response && err.response.data && err.response.data.message);
        }
    };

    const onBackToLogin = () => {
        navigate('/login');
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
                    {/* KitabCloud Logo */}
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
                            Forgot Password
                        </h1>
                        
                        <p style={commonStyles.textLightNormal(18, { 
                            color: colors.grey, 
                            marginBottom: 30, 
                            textAlign: 'center',
                            maxWidth: 400
                        })}>
                            {step === 'email'
                                ? 'Enter your email address. We will send you a 6-digit code.'
                                : 'Enter the code from the email and choose a new password.'}
                        </p>

                        <div style={{ width: '100%', maxWidth: 400 }}>
                            {step === 'email' ? (
                                <PrimaryTextInput 
                                    placeholder='Email' 
                                    value={email} 
                                    onChangeText={setEmail}
                                    autoComplete='email'
                                />
                            ) : (
                                <>
                                    <PrimaryTextInput 
                                        placeholder='6-digit code' 
                                        value={code} 
                                        onChangeText={(v) => setCode(v.replace(/\D/g, '').slice(0, 6))}
                                        inputMode='numeric'
                                        autoComplete='one-time-code'
                                    />
                                    <PrimaryTextInput 
                                        placeholder='New password (at least 6)' 
                                        value={newPassword} 
                                        onChangeText={setNewPassword}
                                        secureEntry={true}
                                        autoComplete='new-password'
                                    />
                                </>
                            )}
                            
                            <CommonButton 
                                isLoading={isLoading} 
                                buttonTitle={step === 'email' ? 'Send code' : 'Save new password'} 
                                onPress={step === 'email' ? onSendCode : onResetPassword} 
                                customStyles={{ 
                                    width: '100%', 
                                    marginBottom: 20 
                                }} 
                            />
                            
                            <button
                                onClick={onBackToLogin}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: colors.appPrimary,
                                    fontSize: 16,
                                    cursor: 'pointer',
                                    width: '100%',
                                    textAlign: 'center'
                                }}
                            >
                                Back to Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <ErrorToast 
                message={errorMessage} 
                isVisible={showError} 
                onClose={() => setShowError(false)} 
            />
            
            {showSuccess && (
                <div style={{
                    position: 'fixed',
                    top: 20,
                    right: 20,
                    backgroundColor: colors.green,
                    color: colors.white,
                    padding: '15px 20px',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    maxWidth: 300,
                    animation: 'slideIn 0.3s ease'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{successMessage}</span>
                        <button
                            onClick={() => setShowSuccess(false)}
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
            )}
        </div>
    );
};

export default ForgotPassword;

