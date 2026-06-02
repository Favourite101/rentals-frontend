import * as React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Modal } from '@/components/ui/Modal';
import { Loader } from '@/components/ui/Loader';
import { Badge } from '@/components/ui/Badge';
import { authApi } from '@/lib/api/auth';
import { getCurrentUser, updateUserData, clearAuthData } from '@/lib/hooks/useAuth';
import { showToast } from '@/lib/hooks/useToast';
import { handleApiError } from '@/lib/api/axios';
import { ROUTES } from '@/constants';
import {
  User, Mail, Calendar, Shield, Pencil, Lock, Trash2, AlertTriangle,
  Phone, MapPin, Camera, Building2, CreditCard, CheckCircle2,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';


const LAGOS_LGAS = [
  'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa',
  'Badagry', 'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye',
  'Ikeja', 'Ikorodu', 'Kosofe', 'Lagos Island', 'Lagos Mainland',
  'Mushin', 'Ojo', 'Oshodi-Isolo', 'Somolu', 'Surulere',
];

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  whatsapp_number: z.string().optional(),
  location: z.string().optional(),
});

const bankSchema = z.object({
  bank_name: z.string().min(1, 'Bank name is required'),
  bank_code: z.string().min(1, 'Bank code is required'),
  account_number: z.string().length(10, 'Account number must be 10 digits').regex(/^\d+$/, 'Digits only'),
  account_name: z.string().min(1, 'Account name is required'),
});

const passwordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(6, 'New password must be at least 6 characters'),
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  confirmation: z.string().refine((val) => val === 'DELETE', {
    message: 'Type DELETE to confirm',
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type BankFormData = z.infer<typeof bankSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;
type DeleteAccountFormData = z.infer<typeof deleteAccountSchema>;

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const { data: banks = [] } = useQuery({
    queryKey: ['banks'],
    queryFn: authApi.listBanks,
    staleTime: 24 * 60 * 60 * 1000,
  });

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = React.useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isResolvingAccount, setIsResolvingAccount] = React.useState(false);
  const [nameMatchError, setNameMatchError] = React.useState<string | null>(null);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      whatsapp_number: user?.whatsapp_number || '',
      location: user?.location || '',
    },
  });

  const {
    register: registerBank,
    handleSubmit: handleBankSubmit,
    reset: resetBank,
    watch: bankWatch,
    setValue: setBankValue,
    formState: { errors: bankErrors },
  } = useForm<BankFormData>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      bank_name: user?.bank_name || '',
      bank_code: user?.bank_code || '',
      account_number: user?.account_number || '',
      account_name: user?.account_name || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({ resolver: zodResolver(passwordSchema) });

  const {
    register: registerDelete,
    handleSubmit: handleDeleteSubmit,
    reset: resetDelete,
    formState: { errors: deleteErrors },
  } = useForm<DeleteAccountFormData>({ resolver: zodResolver(deleteAccountSchema) });

  React.useEffect(() => {
    if (isEditModalOpen && user) {
      resetProfile({
        name: user.name,
        whatsapp_number: user.whatsapp_number || '',
        location: user.location || '',
      });
    }
  }, [isEditModalOpen, user, resetProfile]);

  React.useEffect(() => {
    if (isBankModalOpen && user) {
      resetBank({
        bank_name: user.bank_name || '',
        bank_code: user.bank_code || '',
        account_number: user.account_number || '',
        account_name: user.account_name || '',
      });
      setNameMatchError(null);
    }
  }, [isBankModalOpen, user, resetBank]);

  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (updatedUser) => {
      updateUserData(updatedUser);
      showToast('Profile updated successfully!', 'success');
      setIsEditModalOpen(false);
    },
    onError: (error) => showToast(handleApiError(error), 'error'),
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => authApi.uploadAvatar(file),
    onSuccess: (updatedUser) => {
      updateUserData(updatedUser);
      showToast('Avatar updated!', 'success');
    },
    onError: (error) => showToast(handleApiError(error), 'error'),
  });

  const updateBankMutation = useMutation({
    mutationFn: (data: BankFormData) => authApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      updateUserData(updatedUser);
      showToast('Bank details saved!', 'success');
      setIsBankModalOpen(false);
    },
    onError: (error) => showToast(handleApiError(error), 'error'),
  });

  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      showToast('Password changed successfully!', 'success');
      setIsPasswordModalOpen(false);
      resetPassword();
    },
    onError: (error) => showToast(handleApiError(error), 'error'),
  });

  const deleteAccountMutation = useMutation({
    mutationFn: authApi.deleteAccount,
    onSuccess: () => {
      clearAuthData();
      showToast("Account deleted. We're sorry to see you go.", 'success');
      navigate(ROUTES.HOME);
    },
    onError: (error) => showToast(handleApiError(error), 'error'),
  });

  const resendVerificationMutation = useMutation({
    mutationFn: authApi.resendVerification,
    onSuccess: () => showToast('Verification email sent! Check your inbox.', 'success'),
    onError: (error) => showToast(handleApiError(error), 'error'),
  });

  const handleResolveAccount = async () => {
    const accountNumber = bankWatch('account_number');
    const bankCode = bankWatch('bank_code');
    if (!accountNumber || accountNumber.length !== 10 || !bankCode) return;
    setIsResolvingAccount(true);
    try {
      const { account_name } = await authApi.resolveAccount(accountNumber, bankCode);
      setBankValue('account_name', account_name);
      const profileName = (user?.name || '').toLowerCase();
      const resolvedName = account_name.toLowerCase();
      const profileParts = new Set(profileName.split(/\s+/));
      const resolvedParts = new Set(resolvedName.split(/\s+/));
      const overlap = [...profileParts].filter(p => resolvedParts.has(p)).length;
      if (overlap < 2) {
        setNameMatchError(`Account name "${account_name}" doesn't match your profile name. Update your full name to match your bank account, then re-verify.`);
      } else {
        setNameMatchError(null);
        showToast(`Account verified: ${account_name}`, 'success');
      }
    } catch {
      showToast('Could not resolve account name. Check account number and bank name.', 'error');
    } finally {
      setIsResolvingAccount(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadAvatarMutation.mutate(file);
  };

  if (!user) {
    return (
      <Layout>
        <div className="container-custom py-12">
          <p>Please log in to view your profile.</p>
        </div>
      </Layout>
    );
  }

  const hasBankDetails = user.bank_name && user.account_number;

  return (
    <Layout>
      <div className="container-custom py-12">
        <BackButton label="Back" />
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        <div className="max-w-2xl space-y-6">
          {/* Profile Information Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Your personal details and account info</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar section */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="relative group">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={uploadAvatarMutation.isPending}
                    className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {uploadAvatarMutation.isPending ? (
                      <Loader size="sm" className="text-white" />
                    ) : (
                      <Camera className="h-5 w-5 text-white" />
                    )}
                  </button>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <p className="text-gray-500">@{user.username}</p>
                  <p className="text-xs text-gray-400 mt-1">Click avatar to change photo</p>
                </div>
                {user.role === 'admin' && (
                  <Badge className="bg-purple-100 text-purple-800 ml-auto">Administrator</Badge>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <label className="text-sm font-medium text-gray-500">Email Address</label>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-gray-900 break-all">{user.email}</p>
                      {user.email_verified ? (
                        <Badge className="bg-emerald-100 text-emerald-800 shrink-0 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 shrink-0">Unverified</Badge>
                      )}
                    </div>
                    {!user.email_verified && (
                      <button
                        onClick={() => resendVerificationMutation.mutate()}
                        disabled={resendVerificationMutation.isPending}
                        className="mt-1.5 text-xs text-primary hover:underline disabled:opacity-50"
                      >
                        {resendVerificationMutation.isPending ? 'Sending…' : 'Resend verification email'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Member Since</label>
                    <p className="text-gray-900">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Username</label>
                    <p className="text-gray-900">@{user.username}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">WhatsApp Number</label>
                    <p className="text-gray-900">
                      {user.whatsapp_number || <span className="text-gray-400 italic">Not set</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <label className="text-sm font-medium text-gray-500">Location</label>
                    <p className="text-gray-900">
                      {user.location ? `${user.location}, Lagos` : <span className="text-gray-400 italic">Not set</span>}
                    </p>
                  </div>
                </div>

                {user.role === 'admin' && (
                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Type</label>
                      <p className="text-gray-900 capitalize">{user.role}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bank Account Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Bank Account
                  </CardTitle>
                  <CardDescription>Required to receive payouts for your rental income</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setIsBankModalOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  {hasBankDetails ? 'Edit' : 'Add'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {hasBankDetails ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Bank Name</label>
                      <p className="text-gray-900">{user.bank_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <CreditCard className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Number</label>
                      <p className="text-gray-900">{user.account_number}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 border rounded-lg md:col-span-2">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Name</label>
                      <p className="text-gray-900">{user.account_name}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 text-center">
                  No bank account added yet. Add your account to receive rental payouts.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your password and security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-gray-500">Keep your account secure</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setIsPasswordModalOpen(true)}>
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions for your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium text-red-700">Delete Account</p>
                    <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                  </div>
                </div>
                <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)}>
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Profile Modal */}
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Profile" size="md">
          <form onSubmit={handleProfileSubmit((data) => updateProfileMutation.mutate(data))} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...registerProfile('name')} placeholder="Your full name" />
              {profileErrors.name && <p className="text-sm text-red-600">{profileErrors.name.message}</p>}
              <p className="text-xs text-gray-500">Must match the name on your NIN and bank account.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
              <Input id="whatsapp_number" type="tel" {...registerProfile('whatsapp_number')} placeholder="+234 801 234 5678" />
              <p className="text-xs text-gray-500">Include country code. Lets renters contact you directly.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile_location">Your LGA in Lagos</Label>
              <select
                id="profile_location"
                {...registerProfile('location')}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">Select your LGA</option>
                {LAGOS_LGAS.map(lga => <option key={lga} value={lga}>{lga}</option>)}
              </select>
            </div>
            <p className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">Username cannot be changed.</p>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? <><Loader size="sm" className="mr-2" />Saving...</> : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Bank Account Modal */}
        <Modal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} title="Bank Account Details" size="md">
          <form onSubmit={handleBankSubmit((data) => updateBankMutation.mutate(data))} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bank_name">Bank</Label>
              <select
                id="bank_name"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={bankWatch('bank_name')}
                onChange={(e) => {
                  const selected = banks.find(b => b.name === e.target.value);
                  setBankValue('bank_name', e.target.value, { shouldValidate: true });
                  setBankValue('bank_code', selected?.code ?? '', { shouldValidate: true });
                  setNameMatchError(null);
                }}
              >
                <option value="">Select your bank</option>
                {banks.map(b => (
                  <option key={b.code} value={b.name}>{b.name}</option>
                ))}
              </select>
              {bankErrors.bank_name && <p className="text-sm text-red-600">{bankErrors.bank_name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number</Label>
              <div className="flex gap-2">
                <Input id="account_number" {...registerBank('account_number')} placeholder="10-digit account number" maxLength={10} className="flex-1" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResolveAccount}
                  disabled={isResolvingAccount}
                >
                  {isResolvingAccount ? <><Loader size="sm" className="mr-1" />Resolving...</> : 'Verify'}
                </Button>
              </div>
              {bankErrors.account_number && <p className="text-sm text-red-600">{bankErrors.account_number.message}</p>}
              <p className="text-xs text-gray-500">Select your bank and enter your account number, then click Verify to confirm your account name.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_name">Account Name <span className="text-xs text-gray-400">(auto-filled)</span></Label>
              <Input id="account_name" {...registerBank('account_name')} placeholder="Auto-filled after verification" readOnly className="bg-gray-50" />
              {bankErrors.account_name && <p className="text-sm text-red-600">{bankErrors.account_name.message}</p>}
              {nameMatchError && (
                <p className="text-sm text-red-600">{nameMatchError}</p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsBankModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateBankMutation.isPending || !!nameMatchError}>
                {updateBankMutation.isPending ? <><Loader size="sm" className="mr-2" />Saving...</> : 'Save Bank Details'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Change Password Modal */}
        <Modal
          isOpen={isPasswordModalOpen}
          onClose={() => { setIsPasswordModalOpen(false); resetPassword(); }}
          title="Change Password"
          size="md"
        >
          <form onSubmit={handlePasswordSubmit((data) => changePasswordMutation.mutate({ current_password: data.current_password, new_password: data.new_password }))} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password">Current Password</Label>
              <Input id="current_password" type="password" {...registerPassword('current_password')} placeholder="Current password" />
              {passwordErrors.current_password && <p className="text-sm text-red-600">{passwordErrors.current_password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new_password">New Password</Label>
              <Input id="new_password" type="password" {...registerPassword('new_password')} placeholder="New password" />
              {passwordErrors.new_password && <p className="text-sm text-red-600">{passwordErrors.new_password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm New Password</Label>
              <Input id="confirm_password" type="password" {...registerPassword('confirm_password')} placeholder="Confirm new password" />
              {passwordErrors.confirm_password && <p className="text-sm text-red-600">{passwordErrors.confirm_password.message}</p>}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { setIsPasswordModalOpen(false); resetPassword(); }}>Cancel</Button>
              <Button type="submit" disabled={changePasswordMutation.isPending}>
                {changePasswordMutation.isPending ? <><Loader size="sm" className="mr-2" />Changing...</> : 'Change Password'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete Account Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => { setIsDeleteModalOpen(false); resetDelete(); }}
          title="Delete Account"
          size="md"
        >
          <form onSubmit={handleDeleteSubmit((data) => deleteAccountMutation.mutate(data.password))} className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">This action is irreversible!</p>
                <ul className="text-sm text-red-700 list-disc list-inside mt-2 space-y-1">
                  <li>Remove your personal information</li>
                  <li>Cancel any pending bookings</li>
                  <li>Prevent access to your account forever</li>
                </ul>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete_password">Enter your password to confirm</Label>
              <Input id="delete_password" type="password" {...registerDelete('password')} placeholder="Your current password" />
              {deleteErrors.password && <p className="text-sm text-red-600">{deleteErrors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmation">
                Type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm
              </Label>
              <Input id="confirmation" {...registerDelete('confirmation')} placeholder="Type DELETE" className="font-mono" />
              {deleteErrors.confirmation && <p className="text-sm text-red-600">{deleteErrors.confirmation.message}</p>}
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { setIsDeleteModalOpen(false); resetDelete(); }}>Cancel</Button>
              <Button type="submit" variant="destructive" disabled={deleteAccountMutation.isPending}>
                {deleteAccountMutation.isPending ? <><Loader size="sm" className="mr-2" />Deleting...</> : 'Delete My Account'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};
