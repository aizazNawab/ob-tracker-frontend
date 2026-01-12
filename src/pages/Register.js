import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../services/api';

const Register = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Password & Name
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const { register } = useContext(AuthContext);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // Validate password strength
  const validatePasswordStrength = (password) => {
    const minLength = password.length >= 8;
    const hasNumber = /\d/.test(password);
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    return {
      minLength,
      hasNumber,
      hasLetter,
      hasSpecialChar,
      isValid: minLength && hasNumber && hasLetter && hasSpecialChar
    };
  };

  // Validate email format
  const validateEmailFormat = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmailFormat(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.sendOTP(formData.email);
      if (response.data.success) {
        setOtpSent(true);
        setStep(2);
        showToast('Verification code sent to your email', 'success');
        
        // In development, if OTP is returned, show it
        if (response.data.otp) {
          console.log('Development OTP:', response.data.otp);
          showToast(`Development OTP: ${response.data.otp}`, 'info');
        }
      }
    } catch (err) {
      let errorMsg = 'Failed to send verification code';
      
      if (err.code === 'ECONNABORTED' || err.message === 'timeout of 30000ms exceeded') {
        errorMsg = 'Request timed out. Please check your connection and try again.';
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.verifyOTP(formData.email, formData.otp);
      if (response.data.success) {
        setOtpVerified(true);
        setStep(3);
        showToast('Email verified successfully!', 'success');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid verification code';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Register
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    // Validate password
    const passwordValidation = validatePasswordStrength(formData.password);
    if (!passwordValidation.isValid) {
      if (!passwordValidation.minLength) {
        setError('Password must be at least 8 characters long');
        return;
      }
      if (!passwordValidation.hasNumber) {
        setError('Password must contain at least one number');
        return;
      }
      if (!passwordValidation.hasLetter) {
        setError('Password must contain at least one letter');
        return;
      }
      if (!passwordValidation.hasSpecialChar) {
        setError('Password must contain at least one special character (!@#$%^&*...)');
        return;
      }
    }

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        otp: formData.otp
      });
      showToast('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const passwordValidation = validatePasswordStrength(formData.password);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900">Create Account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Step {step} of 3: {step === 1 ? 'Enter Email' : step === 2 ? 'Verify Email' : 'Create Password'}
          </p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Step 1: Email */}
          {step === 1 && (
            <form className="space-y-6" onSubmit={handleSendOTP}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="you@example.com"
                />
                <p className="mt-2 text-xs text-gray-500">
                  We'll send a verification code to this email
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Sending...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form className="space-y-6" onSubmit={handleVerifyOTP}>
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength="6"
                  required
                  value={formData.otp}
                  onChange={handleChange}
                  className="input-field text-center text-2xl tracking-widest"
                  placeholder="000000"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Enter the 6-digit code sent to {formData.email}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setFormData({ ...formData, otp: '' });
                    setOtpSent(false);
                  }}
                  className="mt-2 text-sm text-purple-600 hover:text-purple-500"
                >
                  Change email
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </button>
            </form>
          )}

          {/* Step 3: Password & Name */}
          {step === 3 && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Create a strong password"
                />
                
                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <span className={passwordValidation.minLength ? 'text-green-600' : 'text-gray-400'}>
                        {passwordValidation.minLength ? '✓' : '○'} At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-400'}>
                        {passwordValidation.hasNumber ? '✓' : '○'} Contains a number
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={passwordValidation.hasLetter ? 'text-green-600' : 'text-gray-400'}>
                        {passwordValidation.hasLetter ? '✓' : '○'} Contains a letter
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-400'}>
                        {passwordValidation.hasSpecialChar ? '✓' : '○'} Contains a special character
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Re-enter your password"
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !passwordValidation.isValid || formData.password !== formData.confirmPassword}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-purple-600 hover:bg-purple-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-purple-600 hover:text-purple-500 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
