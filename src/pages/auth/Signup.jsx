import { useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Camera } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { uploadProfileImage, isFirebaseConfigured } from '@/lib/uploadProfileImage';

const Signup = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: searchParams.get('role') || 'customer',
    isPartOfOrganization: false,
    organizationName: '',
    organizationLocation: '',
    organizationContact: '',
  });
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [profileImageUploading, setProfileImageUploading] = useState(false);
  const profileInputRef = useRef(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const firebaseEnabled = isFirebaseConfigured();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const setOrgToggle = (value) => {
    setFormData(prev => ({
      ...prev,
      isPartOfOrganization: value,
      ...(value ? {} : { organizationName: '', organizationLocation: '', organizationContact: '' }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.role === 'photographer' && formData.isPartOfOrganization && !formData.organizationName?.trim()) {
      setError('Organization name is required when you are part of an organization');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone.replace(/\s/g, ''),
        password: formData.password,
        role: formData.role,
        is_part_of_organization: formData.role === 'photographer' && formData.isPartOfOrganization,
      };
      if (profileImageUrl) payload.profile_picture = profileImageUrl;
      if (formData.role === 'photographer' && formData.isPartOfOrganization) {
        payload.organization = {
          name: formData.organizationName.trim(),
          location: formData.organizationLocation?.trim() || undefined,
          contact_number: formData.organizationContact?.trim() || undefined,
        };
      }
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = typeof errorData.detail === 'string'
          ? errorData.detail
          : Array.isArray(errorData.detail)
            ? errorData.detail.map((e) => e.msg || e.loc?.join('.')).join(', ')
            : 'Signup failed';
        throw new Error(msg);
      }

      navigate('/login?signup=success');
    } catch (err) {
      setError(err.message || 'An error occurred during signup');
      console.error('Signup error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="container mx-auto px-6 md:px-10 py-12">
        <div className="max-w-md w-full mx-auto">
        <Card className="bg-zinc-900/80 backdrop-blur-sm border border-white/10 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-white text-center">
              Create an account
            </CardTitle>
            <CardDescription className="text-center text-zinc-400">
              Join BookMyShoot to book photographers or showcase your work
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-zinc-300">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-zinc-300">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              {firebaseEnabled && (
                <div className="space-y-2">
                  <Label className="text-zinc-300">Profile photo (optional)</Label>
                  <div className="flex items-center gap-4">
                    <div className="rounded-full h-16 w-16 flex items-center justify-center bg-zinc-700 border-2 border-zinc-600 overflow-hidden shrink-0">
                      {profileImageUrl ? (
                        <img src={profileImageUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Camera className="h-8 w-8 text-zinc-500" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <input
                        ref={profileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setProfileImageUploading(true);
                          setError('');
                          try {
                            const url = await uploadProfileImage(file, 'signup');
                            setProfileImageUrl(url);
                          } catch (err) {
                            setError(err.message || 'Photo upload failed');
                          } finally {
                            setProfileImageUploading(false);
                            e.target.value = '';
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-zinc-600 text-zinc-300 hover:bg-zinc-800"
                        disabled={profileImageUploading}
                        onClick={() => profileInputRef.current?.click()}
                      >
                        {profileImageUploading ? 'Uploading...' : profileImageUrl ? 'Change photo' : 'Add photo'}
                      </Button>
                      {profileImageUrl && (
                        <button
                          type="button"
                          onClick={() => setProfileImageUrl(null)}
                          className="text-xs text-zinc-500 hover:text-zinc-400"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-zinc-300">I am a</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value, isPartOfOrganization: value === 'customer' ? false : formData.isPartOfOrganization })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                    <SelectItem value="customer" className="hover:bg-zinc-700">Customer (I want to book a photographer)</SelectItem>
                    <SelectItem value="photographer" className="hover:bg-zinc-700">Photographer (I provide photography services)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === 'photographer' && (
                <div className="space-y-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 transition-all">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Are you part of an organization?</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isPartOfOrganization"
                          checked={!formData.isPartOfOrganization}
                          onChange={() => setOrgToggle(false)}
                          className="rounded-full border-zinc-600 bg-zinc-800 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-zinc-300">No</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isPartOfOrganization"
                          checked={formData.isPartOfOrganization}
                          onChange={() => setOrgToggle(true)}
                          className="rounded-full border-zinc-600 bg-zinc-800 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-zinc-300">Yes</span>
                      </label>
                    </div>
                  </div>
                  {formData.isPartOfOrganization && (
                    <div className="space-y-3 pt-2 border-t border-zinc-700">
                      <div className="space-y-2">
                        <Label htmlFor="organizationName" className="text-zinc-300">Organization Name <span className="text-red-400">*</span></Label>
                        <Input
                          id="organizationName"
                          name="organizationName"
                          type="text"
                          value={formData.organizationName}
                          onChange={handleChange}
                          placeholder="e.g. Dream Wedding Studio"
                          className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="organizationLocation" className="text-zinc-300">Location (optional)</Label>
                        <Input
                          id="organizationLocation"
                          name="organizationLocation"
                          type="text"
                          value={formData.organizationLocation}
                          onChange={handleChange}
                          placeholder="e.g. Bangalore"
                          className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="organizationContact" className="text-zinc-300">Contact Number (optional)</Label>
                        <Input
                          id="organizationContact"
                          name="organizationContact"
                          type="tel"
                          value={formData.organizationContact}
                          onChange={handleChange}
                          placeholder="e.g. +91XXXXXXXXXX"
                          className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-zinc-300">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-zinc-300">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 h-12 text-base"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <p className="text-sm text-center text-zinc-400">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Log in
              </Link>
            </p>
            <div className="text-xs text-center text-zinc-500">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </div>
          </CardFooter>
        </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
