import React, { useState, useEffect } from 'react';
import { Calculator } from '@/components/Calculator';
import { SetupWizard } from '@/components/SetupWizard';
import { EmergencyMode } from '@/components/EmergencyMode';
import { SettingsPanel } from '@/components/SettingsPanel';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { UserSettings, AppMode } from '@/types/sos';
import { Helmet } from 'react-helmet';

const defaultSettings: UserSettings = {
  isSetupComplete: false,
  deactivationCode: '',
  triggerSequence: '1234',
  emergencyContacts: [],
  userName: '',
  userPhone: '',
};

const Index = () => {
  const [settings, setSettings] = useLocalStorage<UserSettings>('safecalc-settings', defaultSettings);
  const [mode, setMode] = useState<AppMode>('calculator');
  const [showFakeOff, setShowFakeOff] = useState(false);

  // Determine initial mode based on setup status
  useEffect(() => {
    if (!settings.isSetupComplete) {
      setMode('setup');
    }
  }, [settings.isSetupComplete]);

  const handleSetupComplete = (newSettings: UserSettings) => {
    setSettings(newSettings);
    setMode('calculator');
  };

  const handleTriggerActivated = () => {
    setMode('emergency');
    setShowFakeOff(false);
  };

  const handleDeactivate = () => {
    setMode('calculator');
    setShowFakeOff(false);
  };

  const handleFakeOff = () => {
    setShowFakeOff(true);
  };

  const handleSettingsAccess = () => {
    setMode('setup');
  };

  const handleSettingsSave = (newSettings: UserSettings) => {
    setSettings(newSettings);
  };

  return (
    <>
      <Helmet>
        <title>Calculator</title>
        <meta name="description" content="Simple calculator app" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {mode === 'setup' && !settings.isSetupComplete && (
          <SetupWizard onComplete={handleSetupComplete} />
        )}

        {mode === 'setup' && settings.isSetupComplete && (
          <SettingsPanel
            settings={settings}
            onSave={handleSettingsSave}
            onClose={() => setMode('calculator')}
          />
        )}

        {mode === 'calculator' && (
          <Calculator
            onTriggerActivated={handleTriggerActivated}
            triggerSequence={settings.triggerSequence}
            onSettingsAccess={handleSettingsAccess}
          />
        )}

        {mode === 'emergency' && (
          <EmergencyMode
            settings={settings}
            onDeactivate={handleDeactivate}
            showFakeOff={showFakeOff}
            onFakeOff={handleFakeOff}
          />
        )}
      </div>
    </>
  );
};

export default Index;
