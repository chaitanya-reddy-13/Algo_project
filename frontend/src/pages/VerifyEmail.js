import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../utils/axiosInstance';

const VerifyEmail = () => {
  const { uidb64, token } = useParams();
  const [message, setMessage] = useState('Verifying your email...');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verifyUserEmail = async () => {
      try {
        const response = await axios.get(`/api/verify-email/${uidb64}/${token}/`);
        setMessage(response.data.detail);
        setIsSuccess(true);
      } catch (error) {
        setMessage(error.response?.data?.detail || 'Verification failed. Invalid or expired link.');
        setIsSuccess(false);
      }
    };

    verifyUserEmail();
  }, [uidb64, token]);

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "85vh" }}>
      <div className="card p-4 shadow" style={{ width: "100%", maxWidth: "400px" }}>
        <h2 className="text-center mb-3">Email Verification</h2>
        <p className={`text-center ${isSuccess ? 'text-success' : 'text-danger'}`}>
          {message}
        </p>
        {isSuccess && (
          <p className="text-center mt-3">
            You can now <a href="/login">login</a> to your account.
          </p>
        )}
        {!isSuccess && (
          <p className="text-center mt-3">
            Please check your email for the correct link or <a href="/register">register again</a>.
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
