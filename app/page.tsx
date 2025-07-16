'use client';
import { useState, useEffect } from 'react';
import ProfileCard from './ProfileCard';
import SearchAndLeaderboard from './SearchAndLeaderboard';
import WalletConnection from './components/WalletConnection';

import { saveProfile } from './utils/profileStorage';
import { SecurityManager } from './utils/security';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "MONAD",
    title: "Currently Testnet",
    handle: "monad_xyz",
    status: "Online",
    avatarUrl: "/monad_logo.ico"
  });

  // Scroll behavior for header
  useEffect(() => {
    let lastScrollY = 0;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      
      if (direction !== (document.body.classList.contains('scrolling-down') ? 'down' : 'up')) {
        document.body.classList.toggle('scrolling-down', direction === 'down');
        document.body.classList.toggle('scrolling-up', direction === 'up');
      }
      
      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    const onScroll = () => requestTick();

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Clear all saved data on mount - run only once
  useEffect(() => {
    const hasCleared = sessionStorage.getItem('dataCleared');
    if (!hasCleared) {
      localStorage.removeItem('profileData');
      localStorage.removeItem('profileSearchCounts');
      localStorage.removeItem('userProfiles');
      localStorage.removeItem('savedAvatars');
      localStorage.removeItem('profileSettings');
      sessionStorage.setItem('dataCleared', 'true');
    }
  }, []);

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize security
    if (typeof window !== 'undefined') {
      SecurityManager.getInstance();

      // Load saved profile data
      try {
        const savedProfileData = localStorage.getItem('currentProfileData');
        if (savedProfileData) {
          const parsed = JSON.parse(savedProfileData);
          setProfileData(parsed);
        }
      } catch (error) {
        console.warn('Failed to load saved profile data:', error);
      }
    }
  }, []);

  const handleProfileSelect = (profile: any) => {
    setProfileData(profile);
    setShowSettings(false);

    // Save the selected profile to ensure it persists
    try {
      saveProfile(profile);
    } catch (error) {
      console.warn('Error saving selected profile:', error);
    }
  };

  const handleProfileUpdate = (updatedProfile: any) => {
    const newProfileData = {
      name: updatedProfile.name,
      title: updatedProfile.title,
      handle: updatedProfile.handle,
      status: updatedProfile.status || "Online",
      avatarUrl: updatedProfile.avatarUrl
    };

    setProfileData(newProfileData);

    try {
      // Get existing profiles to preserve search count
      const profiles = JSON.parse(localStorage.getItem('profiles') || '[]');
      const existingProfile = profiles.find((p: any) => p.handle === updatedProfile.handle);

      saveProfile({
        name: updatedProfile.name,
        title: updatedProfile.title,
        handle: updatedProfile.handle,
        avatarUrl: updatedProfile.avatarUrl,
        status: updatedProfile.status || "Online",
        searchCount: existingProfile ? existingProfile.searchCount : 0
      });

      // Also save the current profile data separately
      localStorage.setItem('currentProfileData', JSON.stringify(newProfileData));
    } catch (error) {
      console.warn('Failed to save profile:', error);
    }
  };



  if (!mounted) {
    return <div>Loading...</div>;
  }

  return (
    <main style={{ 
            background: '#000000',
            width: '100%',
            minHeight: '100vh',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '40px 20px',
            boxSizing: 'border-box'
          }}>

      {/* Large Background Monad Logo */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1,
        opacity: 0.1,
        pointerEvents: 'none'
      }}>
        <img 
          src="/monad_logo.ico" 
          alt="Background Monad Logo" 
          style={{
            width: '80vmin',
            height: '80vmin',
            objectFit: 'contain',
            filter: 'blur(2px)'
          }}
        />
      </div>

      {/* Header with Search and Wallet */}
      <div className="header-container" style={{ 
        position: 'fixed', 
        top: '20px', 
        left: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        pointerEvents: 'auto'
      }}>
        <SearchAndLeaderboard onProfileSelect={handleProfileSelect} />
        <WalletConnection />
      </div>





      {/* Floating Monad Logo - Centered above content */}
      <div style={{ 
        zIndex: 50,
        pointerEvents: 'none',
        animation: 'float 6s ease-in-out infinite, glow 4s ease-in-out infinite alternate',
        marginBottom: '20px'
      }}>
        <img 
          src="/monad_logo.ico" 
          alt="Monad Logo" 
          style={{
            width: '80px',
            height: '80px',
            objectFit: 'contain',
            transition: 'transform 0.3s ease'
          }}
        />
      </div>

      {/* Main Heading - Centered */}
      <div style={{
        textAlign: 'center',
        zIndex: 49,
        width: '100%',
        maxWidth: '900px',
        marginBottom: '20px'
      }}>
        <h1 style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: '200% 200%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'gradientShift 3s ease-in-out infinite',
          textShadow: '0 0 30px rgba(102, 126, 234, 0.5)',
          lineHeight: '1.2',
          margin: 0,
          padding: 0,
          fontSize: 'clamp(1.5rem, 5vw, 2.8rem)',
          fontWeight: 'bold',
          marginBottom: '0.8rem',
          letterSpacing: '0.1em'
        }}>
          MONAD PROFILE CARD
        </h1>
        <p style={{
          fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
          color: 'rgba(255, 255, 255, 0.7)',
          margin: 0,
          lineHeight: '1.4',
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Create and customize your unique Monad profile card with holographic effects
        </p>
      </div>

      {/* Footer - Centered below headings */}
      <div style={{
        textAlign: 'center',
        zIndex: 49,
        width: '100%',
        maxWidth: '900px',
        marginBottom: '40px'
      }}>
        <div style={{
          display: 'inline-block',
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '25px',
          padding: '8px 16px',
          backdropFilter: 'blur(10px)'
        }}>
          <p style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.6)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            Build by{' '}
            <a
              href="https://x.com/_fazalurrehman0"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#667eea',
                textDecoration: 'none',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.05)';
                e.target.style.textShadow = '0 0 10px rgba(102, 126, 234, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
                e.target.style.textShadow = 'none';
              }}
            >
              HUNTER
            </a>
          </p>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '500px',
        zIndex: 10
      }}>
        <ProfileCard
          avatarUrl={profileData.avatarUrl}
          name={profileData.name}
          title={profileData.title}
          handle={profileData.handle}
          status={profileData.status}
          onProfileUpdate={handleProfileUpdate}
          showSettings={showSettings}
          onToggleSettings={() => setShowSettings(!showSettings)}
          onContactClick={() => {
            window.open(`https://x.com/${profileData.handle}`, '_blank');
          }}
        />
      </div>

      
    </main>
  );
}