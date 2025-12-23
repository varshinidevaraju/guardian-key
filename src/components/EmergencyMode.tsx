import React, { useEffect, useState, useRef } from 'react';
import { UserSettings, LocationData } from '@/types/sos';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useMediaRecorder } from '@/hooks/useMediaRecorder';
import { AlertTriangle, MapPin, Video, Users, Shield, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface EmergencyModeProps {
  settings: UserSettings;
  onDeactivate: () => void;
  showFakeOff: boolean;
  onFakeOff: () => void;
}

export function EmergencyMode({ settings, onDeactivate, showFakeOff, onFakeOff }: EmergencyModeProps) {
  const [escalationLevel, setEscalationLevel] = useState(1);
  const [deactivateCode, setDeactivateCode] = useState('');
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [alertsSent, setAlertsSent] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { location, getLocation } = useGeolocation();
  const { isRecording, startRecording, stopRecording, stream } = useMediaRecorder();

  // Start recording and get location on mount
  useEffect(() => {
    const initEmergency = async () => {
      try {
        await getLocation();
        const mediaStream = await startRecording();
        
        // Connect stream to video preview
        if (videoRef.current && mediaStream) {
          videoRef.current.srcObject = mediaStream;
        }

        // Simulate sending alerts
        simulateAlerts();
      } catch (error) {
        console.error('Emergency init error:', error);
        toast.error('Could not access camera/location. Please grant permissions.');
      }
    };

    initEmergency();

    // Cleanup
    return () => {
      stopRecording();
    };
  }, []);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Escalation timer
  useEffect(() => {
    const escalationTimer = setInterval(() => {
      setEscalationLevel(prev => Math.min(prev + 1, 3));
    }, 30000); // Escalate every 30 seconds

    return () => clearInterval(escalationTimer);
  }, []);

  const simulateAlerts = () => {
    // Simulate sending alerts to contacts
    settings.emergencyContacts.forEach((contact, index) => {
      setTimeout(() => {
        setAlertsSent(prev => prev + 1);
        console.log(`Alert sent to ${contact.name} at ${contact.phone}`);
      }, index * 2000);
    });
  };

  const handleDeactivate = () => {
    if (deactivateCode === settings.deactivationCode) {
      stopRecording();
      onDeactivate();
      toast.success('Emergency mode deactivated');
    } else {
      toast.error('Incorrect code');
      // Escalate on wrong code
      setEscalationLevel(prev => Math.min(prev + 1, 3));
      setDeactivateCode('');
    }
  };

  const handleFakeOff = () => {
    // This ESCALATES the alert instead of stopping
    setEscalationLevel(3);
    toast.error('Power off detected - ESCALATING ALERT', {
      description: 'Notifying police and all contacts',
    });
    onFakeOff();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getEscalationColor = () => {
    switch (escalationLevel) {
      case 1: return 'bg-warning';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-destructive emergency-pulse';
      default: return 'bg-warning';
    }
  };

  // If showing fake off screen
  if (showFakeOff) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6 animate-fade-in">
          <Power className="w-20 h-20 text-muted-foreground mx-auto" />
          <p className="text-xl text-muted-foreground">Powering off...</p>
          <div className="w-48 h-1 bg-muted rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-foreground animate-[slideRight_3s_ease-in-out_forwards]" />
          </div>
        </div>
        
        {/* Hidden: Still recording and alerting in background */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Emergency Header */}
      <div className={`p-4 ${getEscalationColor()} transition-colors`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-foreground" />
            <span className="font-bold text-foreground">
              EMERGENCY ACTIVE - Level {escalationLevel}
            </span>
          </div>
          <span className="font-mono text-foreground">{formatTime(elapsedTime)}</span>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-auto">
        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Recording Status */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              {isRecording && <div className="w-3 h-3 bg-destructive rounded-full recording-indicator" />}
              <Video className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Recording</p>
            <p className="font-bold text-foreground">
              {isRecording ? 'Active' : 'Starting...'}
            </p>
          </div>

          {/* Alerts Sent */}
          <div className="bg-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Alerts Sent</p>
            <p className="font-bold text-foreground">
              {alertsSent} / {settings.emergencyContacts.length}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="font-medium">Location Shared</span>
          </div>
          {location ? (
            <div className="text-sm text-muted-foreground">
              <p>Lat: {location.latitude.toFixed(6)}</p>
              <p>Lng: {location.longitude.toFixed(6)}</p>
              {location.address && (
                <p className="mt-2 text-foreground">{location.address}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Getting location...</p>
          )}
        </div>

        {/* Video Preview (small) */}
        <div className="bg-card rounded-xl p-2 border border-border overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-32 object-cover rounded-lg"
          />
          <p className="text-xs text-center text-muted-foreground mt-2">
            Recording in progress
          </p>
        </div>

        {/* Escalation Info */}
        {escalationLevel >= 2 && (
          <div className="bg-destructive/20 rounded-xl p-4 border border-destructive/50">
            <p className="text-sm text-destructive font-medium">
              ⚠️ Escalation Level {escalationLevel}: 
              {escalationLevel === 2 && ' Additional contacts notified'}
              {escalationLevel === 3 && ' Emergency services alerted'}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 space-y-3 border-t border-border">
        {showDeactivate ? (
          <div className="space-y-3">
            <Input
              type="password"
              value={deactivateCode}
              onChange={(e) => setDeactivateCode(e.target.value)}
              placeholder="Enter deactivation code"
              className="bg-input border-border text-center"
              autoFocus
            />
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowDeactivate(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeactivate}
                className="flex-1 bg-success hover:bg-success/90"
              >
                <Shield className="w-4 h-4 mr-2" />
                Deactivate
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleFakeOff}
              className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
            >
              <Power className="w-4 h-4 mr-2" />
              Power Off
            </Button>
            <Button 
              onClick={() => setShowDeactivate(true)}
              className="flex-1 bg-muted hover:bg-muted/80"
            >
              <Shield className="w-4 h-4 mr-2" />
              I'm Safe
            </Button>
          </div>
        )}
        
        <p className="text-xs text-center text-muted-foreground">
          Only enter the deactivation code if you are truly safe
        </p>
      </div>
    </div>
  );
}
