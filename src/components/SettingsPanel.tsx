import React, { useState } from 'react';
import { UserSettings, EmergencyContact } from '@/types/sos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, Users, Lock, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsPanelProps {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
  onClose: () => void;
}

export function SettingsPanel({ settings, onSave, onClose }: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [verifyCode, setVerifyCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [newContact, setNewContact] = useState<Partial<EmergencyContact>>({
    name: '',
    phone: '',
    email: '',
    isParent: false,
  });

  const handleVerify = () => {
    if (verifyCode === settings.deactivationCode) {
      setIsVerified(true);
      toast.success('Access granted');
    } else {
      toast.error('Incorrect code');
      setVerifyCode('');
    }
  };

  const addContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast.error('Name and phone are required');
      return;
    }
    
    const contact: EmergencyContact = {
      id: Date.now().toString(),
      name: newContact.name,
      phone: newContact.phone,
      email: newContact.email || '',
      isParent: newContact.isParent || false,
    };
    
    setLocalSettings({
      ...localSettings,
      emergencyContacts: [...localSettings.emergencyContacts, contact],
    });
    setNewContact({ name: '', phone: '', email: '', isParent: false });
  };

  const removeContact = (id: string) => {
    setLocalSettings({
      ...localSettings,
      emergencyContacts: localSettings.emergencyContacts.filter(c => c.id !== id),
    });
  };

  const handleSave = () => {
    onSave(localSettings);
    toast.success('Settings saved');
    onClose();
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="text-center">
            <div className="mx-auto w-14 h-14 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-7 h-7 text-primary" />
            </div>
            <CardTitle>Enter Deactivation Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value)}
              placeholder="Enter your secret code"
              className="bg-input border-border text-center"
              autoFocus
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleVerify} className="flex-1 bg-primary hover:bg-primary/90">
                Verify
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur border-b border-border p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">Settings</h1>
          <Button onClick={handleSave} size="sm" className="bg-primary hover:bg-primary/90">
            Save
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* User Info */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={localSettings.userName}
                onChange={(e) => setLocalSettings({ ...localSettings, userName: e.target.value })}
                className="bg-input border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={localSettings.userPhone}
                onChange={(e) => setLocalSettings({ ...localSettings, userPhone: e.target.value })}
                className="bg-input border-border"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Security Codes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Trigger Sequence</Label>
              <Input
                value={localSettings.triggerSequence}
                onChange={(e) => setLocalSettings({ ...localSettings, triggerSequence: e.target.value.slice(0, 4) })}
                maxLength={4}
                className="bg-input border-border text-center font-mono text-xl tracking-widest"
              />
              <p className="text-xs text-muted-foreground">
                Enter these digits on the calculator to activate SOS
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contacts */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Emergency Contacts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {localSettings.emergencyContacts.map((contact) => (
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
                  size="icon"
                  onClick={() => removeContact(contact.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}

            {/* Add new */}
            <div className="pt-4 border-t border-border space-y-3">
              <p className="text-sm font-medium">Add Contact</p>
              <Input
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="Name"
                className="bg-input border-border"
              />
              <Input
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                placeholder="Phone"
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
                <span className="text-sm">Parent/Guardian</span>
              </label>
              <Button onClick={addContact} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
