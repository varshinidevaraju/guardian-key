import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserSettings, EmergencyContact } from '@/types/sos';
import { Shield, Phone, Lock, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface SetupWizardProps {
  onComplete: (settings: UserSettings) => void;
  existingSettings?: UserSettings;
}

export function SetupWizard({ onComplete, existingSettings }: SetupWizardProps) {
  const [step, setStep] = useState(1);
  const [userName, setUserName] = useState(existingSettings?.userName || '');
  const [userPhone, setUserPhone] = useState(existingSettings?.userPhone || '');
  const [deactivationCode, setDeactivationCode] = useState(existingSettings?.deactivationCode || '');
  const [confirmCode, setConfirmCode] = useState('');
  const [triggerSequence, setTriggerSequence] = useState(existingSettings?.triggerSequence || '1234');
  const [contacts, setContacts] = useState<EmergencyContact[]>(
    existingSettings?.emergencyContacts || []
  );
  const [newContact, setNewContact] = useState<Partial<EmergencyContact>>({
    name: '',
    phone: '',
    email: '',
    isParent: false,
  });

  const addContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast.error('Please enter name and phone number');
      return;
    }
    
    const contact: EmergencyContact = {
      id: Date.now().toString(),
      name: newContact.name,
      phone: newContact.phone,
      email: newContact.email || '',
      isParent: newContact.isParent || false,
    };
    
    setContacts([...contacts, contact]);
    setNewContact({ name: '', phone: '', email: '', isParent: false });
    toast.success('Contact added');
  };

  const removeContact = (id: string) => {
    setContacts(contacts.filter(c => c.id !== id));
  };

  const handleComplete = () => {
    if (deactivationCode !== confirmCode) {
      toast.error('Deactivation codes do not match');
      return;
    }
    
    if (deactivationCode.length < 4) {
      toast.error('Deactivation code must be at least 4 characters');
      return;
    }

    if (contacts.length === 0) {
      toast.error('Please add at least one emergency contact');
      return;
    }

    const settings: UserSettings = {
      isSetupComplete: true,
      userName,
      userPhone,
      deactivationCode,
      triggerSequence,
      emergencyContacts: contacts,
    };

    onComplete(settings);
    toast.success('Setup complete! Your safety app is now active.');
  };

  const steps = [
    { icon: Shield, title: 'Welcome' },
    { icon: Users, title: 'Your Info' },
    { icon: Phone, title: 'Contacts' },
    { icon: Lock, title: 'Security' },
    { icon: CheckCircle2, title: 'Complete' },
  ];

  return (
    <div className="min-h-screen bg-background p-6 flex flex-col">
      {/* Progress */}
      <div className="flex justify-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-colors ${
              i + 1 <= step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 flex items-center justify-center">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <Card className="w-full max-w-md bg-card border-border animate-fade-in">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">SafeCalc Setup</CardTitle>
              <CardDescription className="text-muted-foreground">
                This app looks like a calculator but contains a hidden emergency SOS system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">How it works:</p>
                    <ul className="mt-2 space-y-1 text-muted-foreground">
                      <li>• Enter your secret trigger code on the calculator</li>
                      <li>• Recording & location sharing starts silently</li>
                      <li>• Alerts sent to your emergency contacts</li>
                      <li>• Only YOUR secret code can stop it</li>
                    </ul>
                  </div>
                </div>
              </div>
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => setStep(2)}
              >
                Begin Setup
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: User Info */}
        {step === 2 && (
          <Card className="w-full max-w-md bg-card border-border animate-fade-in">
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>This will be included in emergency alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Your Phone Number</Label>
                <Input
                  id="phone"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="bg-input border-border"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(3)} 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={!userName}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Contacts */}
        {step === 3 && (
          <Card className="w-full max-w-md bg-card border-border animate-fade-in">
            <CardHeader>
              <CardTitle>Emergency Contacts</CardTitle>
              <CardDescription>These people will be alerted during an emergency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Existing contacts */}
              {contacts.length > 0 && (
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {contact.name}
                          {contact.isParent && (
                            <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                              Parent
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">{contact.phone}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeContact(contact.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new contact */}
              <div className="space-y-3 border-t border-border pt-4">
                <Input
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Contact name"
                  className="bg-input border-border"
                />
                <Input
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="Phone number"
                  className="bg-input border-border"
                />
                <Input
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="Email (optional)"
                  className="bg-input border-border"
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newContact.isParent}
                    onChange={(e) => setNewContact({ ...newContact, isParent: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">This is a parent/guardian</span>
                </label>
                <Button 
                  onClick={addContact} 
                  variant="outline" 
                  className="w-full"
                >
                  Add Contact
                </Button>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(4)} 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={contacts.length === 0}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Security Codes */}
        {step === 4 && (
          <Card className="w-full max-w-md bg-card border-border animate-fade-in">
            <CardHeader>
              <CardTitle>Security Codes</CardTitle>
              <CardDescription>Set up your trigger and deactivation codes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trigger">Trigger Sequence (4 digits)</Label>
                <Input
                  id="trigger"
                  value={triggerSequence}
                  onChange={(e) => setTriggerSequence(e.target.value.slice(0, 4))}
                  placeholder="e.g., 1234"
                  maxLength={4}
                  className="bg-input border-border text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-muted-foreground">
                  Press these numbers on the calculator to activate SOS
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deactivate">Deactivation Code</Label>
                <Input
                  id="deactivate"
                  type="password"
                  value={deactivationCode}
                  onChange={(e) => setDeactivationCode(e.target.value)}
                  placeholder="Enter secret code"
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm Deactivation Code</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value)}
                  placeholder="Confirm secret code"
                  className="bg-input border-border"
                />
              </div>

              <div className="bg-destructive/10 rounded-lg p-3">
                <p className="text-sm text-destructive">
                  ⚠️ Remember this code! It's the ONLY way to stop the emergency alert.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={() => setStep(5)} 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={!deactivationCode || !triggerSequence}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Complete */}
        {step === 5 && (
          <Card className="w-full max-w-md bg-card border-border animate-fade-in">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <CardTitle className="text-2xl">Ready to Protect</CardTitle>
              <CardDescription>Review your settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your Name</span>
                  <span className="font-medium">{userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trigger Code</span>
                  <span className="font-mono font-medium">{triggerSequence}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contacts</span>
                  <span className="font-medium">{contacts.length} people</span>
                </div>
              </div>

              <div className="bg-primary/10 rounded-lg p-3">
                <p className="text-sm">
                  💡 <strong>Tip:</strong> Long-press the calculator display for 3 seconds to access settings.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(4)} className="flex-1">
                  Back
                </Button>
                <Button 
                  onClick={handleComplete}
                  className="flex-1 bg-success hover:bg-success/90"
                >
                  Activate Protection
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
