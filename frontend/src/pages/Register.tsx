import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the unified auth page (Login.tsx) in register mode
    navigate('/login', { replace: true });
  }, [navigate]);

  return null;
};

export default Register;
