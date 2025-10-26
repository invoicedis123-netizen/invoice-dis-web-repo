'use client';


import React, { useState } from 'react';
import {
 Card,
 CardContent,
 CardDescription,
 CardFooter,
 CardHeader,
 CardTitle
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Separator } from '../../../components/ui/separator';
import {
 Save,
 RefreshCw,
 AlertCircle,
 CheckCircle,
 Shield,
 Lock,
 Settings,
 Users,
 Percent,
 Wallet,
 FileText,
 Bell
} from 'lucide-react';


// Mock system settings
const mockSettings = {
 general: {
   platformName: 'TEVANI',
   supportEmail: 'support@tevani.com',
   supportPhone: '+91 9876543210',
   maintenanceMode: false
 },
 security: {
   passwordMinLength: 8,
   passwordRequireSpecialChar: true,
   passwordRequireNumber: true,
   passwordRequireUppercase: true,
   twoFactorAuthRequired: true,
   sessionTimeout: 30, // minutes
   maxLoginAttempts: 5
 },
 riskTier: {
   tierAThreshold: 90,
   tierBThreshold: 80,
   tierCThreshold: 70,
   tierDThreshold: 0,
   gstVerificationWeight: 30,
   buyerHistoryWeight: 25,
   sellerHistoryWeight: 25,
   documentQualityWeight: 20
 },
 trrf: {
   defaultCoveragePercent: 20,
   maxCoveragePercent: 40,
   tierAMultiplier: 0.5,
   tierBMultiplier: 1.0,
   tierCMultiplier: 1.5,
   tierDMultiplier: 2.0
 },
 notifications: {
   emailEnabled: true,
   whatsappEnabled: true,
   smsEnabled: false,
   reminderFrequency: 3, // days
   maxReminders: 3
 }
};


export default function SettingsPage() {
 const [settings, setSettings] = useState(mockSettings);
 const [activeTab, setActiveTab] = useState('general');
 const [isSaving, setIsSaving] = useState(false);
 const [saveSuccess, setSaveSuccess] = useState(false);
  // Handle settings change
 const handleSettingChange = (category: string, setting: string, value: any) => {
   setSettings({
     ...settings,
     [category]: {
       ...settings[category as keyof typeof settings],
       [setting]: value
     }
   });
  
   // Reset save status
   setSaveSuccess(false);
 };
  // Handle form submission
 const handleSave = () => {
   setIsSaving(true);
  
   // Simulate API call
   setTimeout(() => {
     setIsSaving(false);
     setSaveSuccess(true);
    
     // Reset success message after 3 seconds
     setTimeout(() => {
       setSaveSuccess(false);
     }, 3000);
   }, 1000);
 };


 return (
   <div className="space-y-6">
     <div className="flex items-center justify-between">
       <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
       <div className="flex items-center gap-2">
         {saveSuccess && (
           <div className="flex items-center text-green-500 text-sm">
             <CheckCircle className="h-4 w-4 mr-1" />
             Settings saved successfully
           </div>
         )}
         <Button
           variant="default"
           className="flex items-center gap-2"
           onClick={handleSave}
           disabled={isSaving}
         >
           {isSaving ? (
             <RefreshCw className="h-4 w-4 animate-spin" />
           ) : (
             <Save className="h-4 w-4" />
           )}
           Save Changes
         </Button>
       </div>
     </div>
    
     <Tabs defaultValue="general" className="space-y-4" onValueChange={setActiveTab}>
       <TabsList>
         <TabsTrigger value="general">General</TabsTrigger>
         <TabsTrigger value="security">Security</TabsTrigger>
         <TabsTrigger value="risk-tier">Risk Tier</TabsTrigger>
         <TabsTrigger value="trrf">TRRF Fund</TabsTrigger>
         <TabsTrigger value="notifications">Notifications</TabsTrigger>
       </TabsList>
      
       <TabsContent value="general" className="space-y-4">
         <Card>
           <CardHeader>
             <CardTitle>General Settings</CardTitle>
             <CardDescription>
               Configure basic platform settings
             </CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
               <div className="space-y-2">
                 <Label htmlFor="platformName">Platform Name</Label>
                 <Input
                   id="platformName"
                   value={settings.general.platformName}
                   onChange={(e) => handleSettingChange('general', 'platformName', e.target.value)}
                 />
               </div>
              
               <div className="space-y-2">
                 <Label htmlFor="supportEmail">Support Email</Label>
                 <Input
                   id="supportEmail"
                   type="email"
                   value={settings.general.supportEmail}
                   onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)}
                 />
               </div>
              
               <div className="space-y-2">
                 <Label htmlFor="supportPhone">Support Phone</Label>
                 <Input
                   id="supportPhone"
                   value={settings.general.supportPhone}
                   onChange={(e) => handleSettingChange('general', 'supportPhone', e.target.value)}
                 />
               </div>
              
               <div className="flex items-center space-x-2">
                 <input
                   type="checkbox"
                   id="maintenanceMode"
                   className="h-4 w-4 rounded border-gray-300"
                   checked={settings.general.maintenanceMode}
                   onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
                 />
                 <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
               </div>
             </div>
           </CardContent>
         </Card>
       </TabsContent>
      
       <TabsContent value="security" className="space-y-4">
         <Card>
           <CardHeader>
             <CardTitle>Security Settings</CardTitle>
             <CardDescription>
               Configure security and authentication settings
             </CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
               <div className="space-y-2">
                 <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                 <Input
                   id="passwordMinLength"
                   type="number"
                   min="6"
                   max="20"
                   value={settings.security.passwordMinLength}
                   onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                 />
               </div>
              
               <div className="space-y-2">
                 <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                 <Input
                   id="sessionTimeout"
                   type="number"
                   min="5"
                   max="120"
                   value={settings.security.sessionTimeout}
                   onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                 />
               </div>
              
               <div className="space-y-2">
                 <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                 <Input
                   id="maxLoginAttempts"
                   type="number"
                   min="3"
                   max="10"
                   value={settings.security.maxLoginAttempts}
                   onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                 />
               </div>
              
               <div className="space-y-4">
                 <div className="flex items-center space-x-2">
                   <input
                     type="checkbox"
                     id="passwordRequireSpecialChar"
                     className="h-4 w-4 rounded border-gray-300"
                     checked={settings.security.passwordRequireSpecialChar}
                     onChange={(e) => handleSettingChange('security', 'passwordRequireSpecialChar', e.target.checked)}
                   />
                   <Label htmlFor="passwordRequireSpecialChar">Require Special Character</Label>
                 </div>
                
                 <div className="flex items-center space-x-2">
                   <input
                     type="checkbox"
                     id="passwordRequireNumber"
                     className="h-4 w-4 rounded border-gray-300"
                     checked={settings.security.passwordRequireNumber}
                     onChange={(e) => handleSettingChange('security', 'passwordRequireNumber', e.target.checked)}
                   />
                   <Label htmlFor="passwordRequireNumber">Require Number</Label>
                 </div>
                
                 <div className="flex items-center space-x-2">
                   <input
                     type="checkbox"
                     id="passwordRequireUppercase"
                     className="h-4 w-4 rounded border-gray-300"
                     checked={settings.security.passwordRequireUppercase}
                     onChange={(e) => handleSettingChange('security', 'passwordRequireUppercase', e.target.checked)}
                   />
                   <Label htmlFor="passwordRequireUppercase">Require Uppercase</Label>
                 </div>
                
                 <div className="flex items-center space-x-2">
                   <input
                     type="checkbox"
                     id="twoFactorAuthRequired"
                     className="h-4 w-4 rounded border-gray-300"
                     checked={settings.security.twoFactorAuthRequired}
                     onChange={(e) => handleSettingChange('security', 'twoFactorAuthRequired', e.target.checked)}
                   />
                   <Label htmlFor="twoFactorAuthRequired">Require Two-Factor Authentication</Label>
                 </div>
               </div>
             </div>
           </CardContent>
         </Card>
       </TabsContent>
      
       <TabsContent value="risk-tier" className="space-y-4">
         <Card>
           <CardHeader>
             <CardTitle>Risk Tier Settings</CardTitle>
             <CardDescription>
               Configure risk tier calculation parameters
             </CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="space-y-4">
               <h3 className="text-sm font-medium">Tier Thresholds</h3>
               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 <div className="space-y-2">
                   <Label htmlFor="tierAThreshold">Tier A Threshold (Score ≥)</Label>
                   <Input
                     id="tierAThreshold"
                     type="number"
                     min="0"
                     max="100"
                     value={settings.riskTier.tierAThreshold}
                     onChange={(e) => handleSettingChange('riskTier', 'tierAThreshold', parseInt(e.target.value))}
                   />
                 </div>
                
                 <div className="space-y-2">
                   <Label htmlFor="tierBThreshold">Tier B Threshold (Score ≥)</Label>
                   <Input
                     id="tierBThreshold"
                     type="number"
                     min="0"
                     max="100"
                     value={settings.riskTier.tierBThreshold}
                     onChange={(e) => handleSettingChange('riskTier', 'tierBThreshold', parseInt(e.target.value))}
                   />
                 </div>
                
                 <div className="space-y-2">
                   <Label htmlFor="tierCThreshold">Tier C Threshold (Score ≥)</Label>
                   <Input
                     id="tierCThreshold"
                     type="number"
                     min="0"
                     max="100"
                     value={settings.riskTier.tierCThreshold}
                     onChange={(e) => handleSettingChange('riskTier', 'tierCThreshold', parseInt(e.target.value))}
                   />
                 </div>
                
                 <div className="space-y-2">
                   <Label htmlFor="tierDThreshold">Tier D Threshold (Score ≥)</Label>
                   <Input
                     id="tierDThreshold"
                     type="number"
                     min="0"
                     max="100"
                     value={settings.riskTier.tierDThreshold}
                     onChange={(e) => handleSettingChange('riskTier', 'tierDThreshold', parseInt(e.target.value))}
                   />
                 </div>
               </div>
              
               <Separator />
              
               <h3 className="text-sm font-medium">Scoring Weights (Total: 100%)</h3>
               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 <div className="space-y-2">
                   <Label htmlFor="gstVerificationWeight">GST Verification Weight (%)</Label>
                   <Input
                     id="gstVerificationWeight"
                     type="number"
                     min="0"
                     max="100"
                     value={settings.riskTier.gstVerificationWeight}
                     onChange={(e) => handleSettingChange('riskTier', 'gstVerificationWeight', parseInt(e.target.value))}
                   />
                 </div>
                
                 <div className="space-y-2">
                   <Label htmlFor="buyerHistoryWeight">Buyer History Weight (%)</Label>
                   <Input
                     id="buyerHistoryWeight"
                     type="number"
                     min="0"
                     max="100"
                     value={settings.riskTier.buyerHistoryWeight}
                     onChange={(e) => handleSettingChange('riskTier', 'buyerHistoryWeight', parseInt(e.target.value))}
                   />
                 </div>
                
                 <div className="space-y-2">
                   <Label htmlFor="sellerHistoryWeight">Seller History Weight (%)</Label>
                   <Input
                     id="sellerHistoryWeight"
                     type="number"
                     min="0"
                     max="100"
                     value={settings.riskTier.sellerHistoryWeight}
                     onChange={(e) => handleSettingChange('riskTier', 'sellerHistoryWeight', parseInt(e.target.value))}
                   />
                 </div>
                
                 <div className="space-y-2">
                   <Label htmlFor="documentQualityWeight">Document Quality Weight (%)</Label>
                   <Input
                     id="documentQualityWeight"
                     type="number"
                     min="0"
                     max="100"
                     value={settings.riskTier.documentQualityWeight}
                     onChange={(e) => handleSettingChange('riskTier', 'documentQualityWeight', parseInt(e.target.value))}
                   />
                 </div>
               </div>
              
               <div className="text-sm text-muted-foreground">
                 Total Weight: {
                   settings.riskTier.gstVerificationWeight +
                   settings.riskTier.buyerHistoryWeight +
                   settings.riskTier.sellerHistoryWeight +
                   settings.riskTier.documentQualityWeight
                 }% {
                   (settings.riskTier.gstVerificationWeight +
                   settings.riskTier.buyerHistoryWeight +
                   settings.riskTier.sellerHistoryWeight +
                   settings.riskTier.documentQualityWeight) !== 100 && (
                     <span className="text-red-500 ml-2">
                       (Should equal 100%)
                     </span>
                   )
                 }
               </div>
             </div>
           </CardContent>
         </Card>
       </TabsContent>
      
       <TabsContent value="trrf" className="space-y-4">
         <Card>
           <CardHeader>
             <CardTitle>TRRF Fund Settings</CardTitle>
             <CardDescription>
               Configure Trade Receivables Risk Fund parameters
             </CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
               <div className="space-y-2">
                 <Label htmlFor="defaultCoveragePercent">Default Coverage Percentage</Label>
                 <Input
                   id="defaultCoveragePercent"
                   type="number"
                   min="0"
                   max="100"
                   value={settings.trrf.defaultCoveragePercent}
                   onChange={(e) => handleSettingChange('trrf', 'defaultCoveragePercent', parseInt(e.target.value))}
                 />
                 <p className="text-xs text-muted-foreground">
                   Default percentage of invoice amount covered by TRRF
                 </p>
               </div>
              
               <div className="space-y-2">
                 <Label htmlFor="maxCoveragePercent">Maximum Coverage Percentage</Label>
                 <Input
                   id="maxCoveragePercent"
                   type="number"
                   min="0"
                   max="100"
                   value={settings.trrf.maxCoveragePercent}
                   onChange={(e) => handleSettingChange('trrf', 'maxCoveragePercent', parseInt(e.target.value))}
                 />
                 <p className="text-xs text-muted-foreground">
                   Maximum percentage of invoice amount that can be covered by TRRF
                 </p>
               </div>
              
               <div className="space-y-2">
                 <Label htmlFor="tierAMultiplier">Tier A Risk Multiplier</Label>
                 <Input
                   id="tierAMultiplier"
                   type="number"
                   min="0"
                   step="0.1"
                   value={settings.trrf.tierAMultiplier}
                   onChange={(e) => handleSettingChange('trrf', 'tierAMultiplier', parseFloat(e.target.value))}
                 />
                 <p className="text-xs text-muted-foreground">
                   Multiplier for Tier A risk invoices (lower is better)
                 </p>
               </div>
              
               <div className="space-y-2">
                 <Label htmlFor="tierBMultiplier">Tier B Risk Multiplier</Label>
                 <Input
                   id="tierBMultiplier"
                   type="number"
                   min="0"
                   step="0.1"
                   value={settings.trrf.tierBMultiplier}
                   onChange={(e) => handleSettingChange('trrf', 'tierBMultiplier', parseFloat(e.target.value))}
                 />
                 <p className="text-xs text-muted-foreground">
                   Multiplier for Tier B risk invoices
                 </p>
               </div>
              
               <div className="space-y-2">
                 <Label htmlFor="tierCMultiplier">Tier C Risk Multiplier</Label>
                 <Input
                   id="tierCMultiplier"
                   type="number"
                   min="0"
                   step="0.1"
                   value={settings.trrf.tierCMultiplier}
                   onChange={(e) => handleSettingChange('trrf', 'tierCMultiplier', parseFloat(e.target.value))}
                 />
                 <p className="text-xs text-muted-foreground">
                   Multiplier for Tier C risk invoices
                 </p>
               </div>
              
               <div className="space-y-2">
                 <Label htmlFor="tierDMultiplier">Tier D Risk Multiplier</Label>
                 <Input
                   id="tierDMultiplier"
                   type="number"
                   min="0"
                   step="0.1"
                   value={settings.trrf.tierDMultiplier}
                   onChange={(e) => handleSettingChange('trrf', 'tierDMultiplier', parseFloat(e.target.value))}
                 />
                 <p className="text-xs text-muted-foreground">
                   Multiplier for Tier D risk invoices (higher is riskier)
                 </p>
               </div>
             </div>
           </CardContent>
         </Card>
       </TabsContent>
      
       <TabsContent value="notifications" className="space-y-4">
         <Card>
           <CardHeader>
             <CardTitle>Notification Settings</CardTitle>
             <CardDescription>
               Configure notification channels and preferences
             </CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
               <div className="space-y-4">
                 <h3 className="text-sm font-medium">Notification Channels</h3>
                
                 <div className="flex items-center space-x-2">
                   <input
                     type="checkbox"
                     id="emailEnabled"
                     className="h-4 w-4 rounded border-gray-300"
                     checked={settings.notifications.emailEnabled}
                     onChange={(e) => handleSettingChange('notifications', 'emailEnabled', e.target.checked)}
                   />
                   <Label htmlFor="emailEnabled">Email Notifications</Label>
                 </div>
                
                 <div className="flex items-center space-x-2">
                   <input
                     type="checkbox"
                     id="whatsappEnabled"
                     className="h-4 w-4 rounded border-gray-300"
                     checked={settings.notifications.whatsappEnabled}
                     onChange={(e) => handleSettingChange('notifications', 'whatsappEnabled', e.target.checked)}
                   />
                   <Label htmlFor="whatsappEnabled">WhatsApp Notifications</Label>
                 </div>
                
                 <div className="flex items-center space-x-2">
                   <input
                     type="checkbox"
                     id="smsEnabled"
                     className="h-4 w-4 rounded border-gray-300"
                     checked={settings.notifications.smsEnabled}
                     onChange={(e) => handleSettingChange('notifications', 'smsEnabled', e.target.checked)}
                   />
                   <Label htmlFor="smsEnabled">SMS Notifications</Label>
                 </div>
               </div>
              
               <div className="space-y-4">
                 <h3 className="text-sm font-medium">Reminder Settings</h3>
                
                 <div className="space-y-2">
                   <Label htmlFor="reminderFrequency">Reminder Frequency (days)</Label>
                   <Input
                     id="reminderFrequency"
                     type="number"
                     min="1"
                     max="14"
                     value={settings.notifications.reminderFrequency}
                     onChange={(e) => handleSettingChange('notifications', 'reminderFrequency', parseInt(e.target.value))}
                   />
                   <p className="text-xs text-muted-foreground">
                     How often to send reminders for pending actions
                   </p>
                 </div>
                
                 <div className="space-y-2">
                   <Label htmlFor="maxReminders">Maximum Reminders</Label>
                   <Input
                     id="maxReminders"
                     type="number"
                     min="1"
                     max="10"
                     value={settings.notifications.maxReminders}
                     onChange={(e) => handleSettingChange('notifications', 'maxReminders', parseInt(e.target.value))}
                   />
                   <p className="text-xs text-muted-foreground">
                     Maximum number of reminders to send before escalation
                   </p>
                 </div>
               </div>
             </div>
           </CardContent>
         </Card>
       </TabsContent>
     </Tabs>
    
     <div className="flex justify-end">
       <Button
         variant="default"
         className="flex items-center gap-2"
         onClick={handleSave}
         disabled={isSaving}
       >
         {isSaving ? (
           <RefreshCw className="h-4 w-4 animate-spin" />
         ) : (
           <Save className="h-4 w-4" />
         )}
         Save Changes
       </Button>
     </div>
   </div>
 );
}


// Made with Bob





