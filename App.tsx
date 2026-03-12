
import React, { useEffect, useState } from 'react';
import { AppScreen } from './types';
import { Welcome } from './screens/Welcome';
import { Login } from './screens/Login';
import { Register } from './screens/Register';
import { Home } from './screens/Home';
import { BottomNav } from './components/BottomNav';
import { Ranking } from './screens/Ranking';
import { Likes } from './screens/Likes';
import { Chat } from './screens/Chat';
import { Terms } from './screens/Terms';
import { Privacy } from './screens/Privacy';
import { EditProfile } from './screens/EditProfile';
import { Settings } from './screens/Settings';
import { Premium } from './screens/Premium';
import { Security } from './screens/Security';
import { Help } from './screens/Help';
import { PaymentHistory } from './screens/PaymentHistory';
import { ChangePassword } from './screens/ChangePassword';
import { ForgotPassword } from './screens/ForgotPassword';
import { ResetPassword } from './screens/ResetPassword';
import { Report } from './screens/Report';
import { ReportList } from './screens/ReportList';
import { ReportDetail } from './screens/ReportDetail';
import { About } from './screens/About';
import { Rules } from './screens/Rules';
import { Notifications } from './screens/Notifications';
import { getAccessToken, refreshSession } from './authClient';
import { apiFetch } from './apiClient';
import { useAppState } from './AppStateContext';

const PROTECTED_SCREENS = new Set<AppScreen>([
  AppScreen.HOME,
  AppScreen.RANKING,
  AppScreen.LIKES,
  AppScreen.CHAT,
  AppScreen.PROFILE,
  AppScreen.EDIT_PROFILE,
  AppScreen.PREMIUM,
  AppScreen.SETTINGS,
  AppScreen.PAYMENT_HISTORY,
  AppScreen.SECURITY,
  AppScreen.HELP,
  AppScreen.CHANGE_PASSWORD,
  AppScreen.NOTIFICATIONS,
  AppScreen.REPORT,
  AppScreen.REPORT_LIST,
  AppScreen.REPORT_DETAIL
]);

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.WELCOME);
  const [resetPasswordToken, setResetPasswordToken] = useState<string | null>(null);
  const {
    isAuthenticated,
    setIsAuthenticated,
    isPremium,
    setIsPremium,
    myProfile,
    setMyProfile,
    updateProfile
  } = useAppState();
  
  const [reportContext, setReportContext] = useState<{name: string, date: string, userId?: string} | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const calculateCompletion = () => {
    let score = 0;
    const totalFields = 5; // Images, Bio, Tags, Basic Info, Detailed Info
    
    // 1. Images (40%)
    if (myProfile.images.length > 0) score += 20;
    if (myProfile.images.length > 2) score += 20;

    // 2. Bio (15%)
    if (myProfile.bio.length > 20) score += 15;

    // 3. Basic Info (15%)
    if (myProfile.city && myProfile.state && myProfile.birthDate) score += 15;

    // 4. Detailed Info (30%) - Approximated by having a few extra fields
    // Assuming we would check more fields in a real app
    score += 30; 

    return Math.min(score, 100);
  };

  const navigate = (screen: AppScreen) => {
    if (PROTECTED_SCREENS.has(screen) && !isAuthenticated) {
      setCurrentScreen(AppScreen.LOGIN);
      window.scrollTo(0, 0);
      return;
    }

    if (screen === AppScreen.HOME && [AppScreen.LOGIN, AppScreen.REGISTER, AppScreen.FORGOT_PASSWORD].includes(currentScreen)) {
      setIsAuthenticated(true);
    }

    setCurrentScreen(screen);
    // Scroll to top when changing screens
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const loadProfile = async () => {
      const accessToken = await getAccessToken();
      if (accessToken) setIsAuthenticated(true);

      const ok = await refreshSession();
      if (!ok) {
        if (PROTECTED_SCREENS.has(currentScreen)) setCurrentScreen(AppScreen.LOGIN);
        setIsAuthenticated(false);
        return;
      }
      setIsAuthenticated(true);

      const [profileRes, settingsRes] = await Promise.all([
        apiFetch('/v1/profile'),
        apiFetch('/v1/settings')
      ]);

      const profileData = profileRes.ok ? (await profileRes.json()) as { profile: any } : null;
      const settingsData = settingsRes.ok ? (await settingsRes.json()) as { settings: any } : null;
      if (!profileData?.profile && !settingsData?.settings) return;

      setMyProfile((prev) => ({
        ...prev,
        name: profileData?.profile?.name ?? prev.name,
        birthDate: profileData?.profile?.birth_date ?? prev.birthDate,
        city: profileData?.profile?.city_name ?? prev.city,
        state: profileData?.profile?.state_code ?? prev.state,
        gender: profileData?.profile?.gender_label ?? prev.gender,
        lookingFor: profileData?.profile?.lookingFor ?? prev.lookingFor,
        images: profileData?.profile?.photos ?? prev.images,
        bio: profileData?.profile?.bio ?? prev.bio,
        rankingEnabled: profileData?.profile?.ranking_enabled ?? prev.rankingEnabled,
        height: profileData?.profile?.height_cm ? `${profileData.profile.height_cm} cm` : prev.height,
        relationship: profileData?.profile?.relationship ?? prev.relationship,
        education: profileData?.profile?.education ?? prev.education,
        family: profileData?.profile?.family ?? prev.family,
        sign: profileData?.profile?.sign ?? prev.sign,
        pets: profileData?.profile?.pets ?? prev.pets,
        drink: profileData?.profile?.drink ?? prev.drink,
        smoke: profileData?.profile?.smoke ?? prev.smoke,
        exercise: profileData?.profile?.exercise ?? prev.exercise,
        food: profileData?.profile?.food ?? prev.food,
        sleep: profileData?.profile?.sleep ?? prev.sleep,
        personality: profileData?.profile?.personality ?? prev.personality,
        currentTag: profileData?.profile?.current_tag ?? prev.currentTag,
        classification: profileData?.profile?.classification ?? prev.classification,
        billSplit: profileData?.profile?.bill_split ?? prev.billSplit,
        availableToday: profileData?.profile?.available_today ?? prev.availableToday,
        minAge: settingsData?.settings?.minAge ?? prev.minAge,
        maxAge: settingsData?.settings?.maxAge ?? prev.maxAge,
        maxDistanceKm: settingsData?.settings?.maxDistanceKm ?? prev.maxDistanceKm,
        expandDistance: settingsData?.settings?.expandDistance ?? prev.expandDistance,
        expandAge: settingsData?.settings?.expandAge ?? prev.expandAge,
        internationalMode: settingsData?.settings?.internationalMode ?? prev.internationalMode,
        discoveryState: settingsData?.settings?.discoveryState ?? prev.discoveryState,
        discoveryCity: settingsData?.settings?.discoveryCity ?? prev.discoveryCity,
        profileVisible: settingsData?.settings?.profileVisible ?? prev.profileVisible,
        hideAge: settingsData?.settings?.hideAge ?? prev.hideAge,
        readReceiptsEnabled: settingsData?.settings?.readReceiptsEnabled ?? prev.readReceiptsEnabled,
        allowMarketingEmails: settingsData?.settings?.allowMarketingEmails ?? prev.allowMarketingEmails
      }));
    };

    loadProfile();
  }, []);

  useEffect(() => {
    if (!isAuthenticated && PROTECTED_SCREENS.has(currentScreen)) {
      setCurrentScreen(AppScreen.LOGIN);
    }
  }, [currentScreen, isAuthenticated]);

  const handleSelectReport = (id: string) => {
      setSelectedReportId(id);
      navigate(AppScreen.REPORT_DETAIL);
  };

  useEffect(() => {
    const handleAuthQueryActions = async () => {
      const params = new URLSearchParams(window.location.search);
      const verifyEmailToken = params.get('verifyEmailToken');
      const resetToken = params.get('resetPasswordToken');

      if (!verifyEmailToken && !resetToken) return;

      window.history.replaceState({}, document.title, window.location.pathname);

      if (verifyEmailToken) {
        const res = await apiFetch('/v1/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: verifyEmailToken })
        });

        sessionStorage.setItem(
          'thegame_auth_notice',
          res.ok
            ? 'Email confirmado com sucesso.'
            : 'O link de confirmação é inválido ou expirou.'
        );
        setCurrentScreen(AppScreen.LOGIN);
        return;
      }

      if (resetToken) {
        setResetPasswordToken(resetToken);
        setCurrentScreen(AppScreen.RESET_PASSWORD);
      }
    };

    handleAuthQueryActions();
  }, []);

  // Helper to check if bottom nav should be visible
  const showBottomNav = isAuthenticated && [
    AppScreen.HOME, 
    AppScreen.RANKING, 
    AppScreen.LIKES, 
    AppScreen.CHAT, 
    AppScreen.EDIT_PROFILE
  ].includes(currentScreen);

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-md mx-auto bg-brand-dark shadow-2xl overflow-hidden relative">
      {currentScreen === AppScreen.WELCOME && <Welcome onNavigate={navigate} />}
      {currentScreen === AppScreen.RULES && <Rules onNavigate={navigate} />}
      {currentScreen === AppScreen.LOGIN && <Login onNavigate={navigate} />}
      {currentScreen === AppScreen.REGISTER && <Register onNavigate={navigate} />}
      {currentScreen === AppScreen.FORGOT_PASSWORD && <ForgotPassword onNavigate={navigate} />}
      {currentScreen === AppScreen.RESET_PASSWORD && <ResetPassword onNavigate={navigate} token={resetPasswordToken} />}
      
      {currentScreen === AppScreen.HOME && <Home onNavigate={navigate} />}
      {currentScreen === AppScreen.RANKING && <Ranking />}
      {currentScreen === AppScreen.LIKES && <Likes isPremium={isPremium} onNavigate={navigate} />}
      {currentScreen === AppScreen.CHAT && <Chat onNavigate={navigate} setReportContext={(name, userId) => setReportContext({name, userId, date: new Date().toLocaleDateString()})} />}
      {currentScreen === AppScreen.PROFILE && <EditProfile onNavigate={navigate} myProfile={myProfile} updateProfile={updateProfile} completion={calculateCompletion()} />}
      
      {currentScreen === AppScreen.TERMS && <Terms onNavigate={navigate} />}
      {currentScreen === AppScreen.PRIVACY && <Privacy onNavigate={navigate} />}
      
      {/* Security Context Terms/Privacy */}
      {currentScreen === AppScreen.TERMS_SECURITY && <Terms onNavigate={navigate} backScreen={AppScreen.SECURITY} />}
      {currentScreen === AppScreen.PRIVACY_SECURITY && <Privacy onNavigate={navigate} backScreen={AppScreen.SECURITY} />}

      {currentScreen === AppScreen.EDIT_PROFILE && <EditProfile onNavigate={navigate} myProfile={myProfile} updateProfile={updateProfile} completion={calculateCompletion()} />}
      {currentScreen === AppScreen.SETTINGS && <Settings onNavigate={navigate} myProfile={myProfile} updateProfile={updateProfile} />}
      {currentScreen === AppScreen.PREMIUM && <Premium onNavigate={navigate} isPremium={isPremium} setPremium={setIsPremium} />}
      {currentScreen === AppScreen.PAYMENT_HISTORY && <PaymentHistory onNavigate={navigate} />}
      
      {currentScreen === AppScreen.SECURITY && <Security onNavigate={navigate} />}
      {currentScreen === AppScreen.HELP && <Help onNavigate={navigate} />}
      {currentScreen === AppScreen.CHANGE_PASSWORD && <ChangePassword onNavigate={navigate} />}
      {currentScreen === AppScreen.ABOUT && <About onNavigate={navigate} />}
      {currentScreen === AppScreen.NOTIFICATIONS && <Notifications onNavigate={navigate} />}

      {/* Reporting System */}
      {currentScreen === AppScreen.REPORT && <Report onNavigate={navigate} initialContext={reportContext} />}
      {currentScreen === AppScreen.REPORT_LIST && <ReportList onNavigate={navigate} onSelectReport={handleSelectReport} />}
      {currentScreen === AppScreen.REPORT_DETAIL && <ReportDetail onNavigate={navigate} reportId={selectedReportId} />}

      {showBottomNav && <BottomNav currentScreen={currentScreen} onNavigate={navigate} />}
    </div>
  );
};

export default App;
