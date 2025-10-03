import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

export default function OAuthSuccess() {
  const { login } = useContext(AuthContext);

  useEffect(() => {
    // Get URL parameters without React Router
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const userData = params.get('user');

    if (accessToken && refreshToken && userData) {
      try {
        
        const user = JSON.parse(decodeURIComponent(userData));
        
         
        login(accessToken, refreshToken, user);
        
         
        window.history.replaceState({}, document.title, "/");
        
      } catch (err) {
        console.error("Failed to process OAuth login:", err);
        alert("Login failed. Please try again.");
      
        window.location.href = "/";
      }
    } else {
     // alert("Authentication failed. Missing tokens.");
      window.location.href = "/";
    }
  }, [login]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Processing login...</h2>
      <p>Please wait while we complete your authentication.</p>
    </div>
  );
}
 