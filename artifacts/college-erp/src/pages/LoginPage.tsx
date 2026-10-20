import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Loader2, UserCheck, GraduationCap, LogIn, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: any, token: string) => void;
}

const QUICK_ACCOUNTS = [
  { label: 'Owner', email: 'owner@gmail.com', password: 'Owner123' },
  { label: 'Admin', email: 'admin@college.edu', password: 'Admin@123' },
  { label: 'Student', email: 'aarav@student.edu', password: 'Student@123' },
  { label: 'Teacher', email: 'priya.sharma@college.edu', password: 'Teacher@123' },
  { label: 'Administrator', email: 'administrator@biet.edu', password: 'Admin@123' },
  { label: 'HOD', email: 'hod@biet.edu', password: 'Hod@123' },
  { label: 'Principal', email: 'principal@biet.edu', password: 'Principal@123' },
  { label: 'Parent', email: 'parent@biet.edu', password: 'Parent@123' },
];

const DEPARTMENTS = [
  { code: 'CSE', name: 'Computer Science & Engineering' },
  { code: 'ISE', name: 'Information Science & Engineering' },
  { code: 'AIML', name: 'AI & Machine Learning' },
  { code: 'AIDS', name: 'AI & Data Science' },
  { code: 'ECE', name: 'Electronics & Communication' },
  { code: 'EEE', name: 'Electrical & Electronics' },
  { code: 'Civil', name: 'Civil Engineering' },
  { code: 'Mechanical', name: 'Mechanical Engineering' },
];

const ACADEMIC_YEARS = [
  { value: 1, label: '1st Year (Freshman - Sem 1/2)' },
  { value: 2, label: '2nd Year (Sophomore - Sem 3/4)' },
  { value: 3, label: '3rd Year (Junior - Sem 5/6)' },
  { value: 4, label: '4th Year (Senior - Sem 7/8)' },
];

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  
  // Sign In State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Student Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRollNumber, setRegRollNumber] = useState('');
  const [regDepartment, setRegDepartment] = useState('CSE');
  const [regYear, setRegYear] = useState(1);
  const [regPhone, setRegPhone] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      onLogin(data.user, data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (account: typeof QUICK_ACCOUNTS[0]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: account.email, password: account.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onLogin(data.user, data.token);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('Please fill in your name, email, and password.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim().toLowerCase(),
          password: regPassword,
          rollNumber: regRollNumber.trim(),
          department: regDepartment,
          year: Number(regYear),
          phone: regPhone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      setSuccessMsg('Account created successfully! Logging you in...');
      setTimeout(() => {
        onLogin(data.user, data.token);
      }, 700);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-slate-700/50 flex items-center justify-center mb-3 bg-white/10 p-1">
          <img src="/download.jpg" alt="BIET ERP Logo" className="w-full h-full object-contain rounded-xl" />
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-white">
          BIET ERP
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400 font-medium tracking-wide uppercase">
          Bansal Institute of Engineering & Technology
        </p>

        {/* Tab Switcher */}
        <div className="mt-6 inline-flex p-1 bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Student Sign Up
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900 py-8 px-4 shadow-xl shadow-black/50 sm:rounded-xl sm:px-8 border border-slate-800/60">
          
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <span className="text-xs font-bold border border-red-500/40 rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">!</span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm px-4 py-3 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'signin' ? (
            /* ──────────────── SIGN IN FORM ──────────────── */
            <>
              <form className="space-y-5" onSubmit={handleLogin}>
                <div>
                  <Label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</Label>
                  <Input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border-slate-800 focus:ring-indigo-500 text-white placeholder:text-slate-600 h-11"
                    placeholder="student@gmail.com or staff@biet.edu"
                    required
                  />
                </div>

                <div>
                  <Label className="block text-sm font-medium text-slate-300 mb-1.5">Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border-slate-800 focus:ring-indigo-500 text-white placeholder:text-slate-600 pr-10 h-11"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-colors h-11"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in to Portal'}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1 font-medium"
                >
                  New student at BIET? <span className="underline">Create your account here</span> →
                </button>
              </div>

              {/* Staff notice */}
              <div className="mt-4 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400">
                <span className="text-slate-300 font-semibold">Faculty / Staff Note:</span> Staff accounts are predefined and managed by College Administration. Contact Admin or Owner if your password needs resetting.
              </div>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-slate-900 text-slate-500">Quick Access Demo Logins</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2">
                  {QUICK_ACCOUNTS.map((account) => (
                    <button
                      key={account.label}
                      onClick={() => handleQuickLogin(account)}
                      disabled={loading}
                      className="inline-flex justify-center py-1.5 px-2 border border-slate-800 rounded-lg shadow-sm bg-slate-950 text-[11px] font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors truncate"
                      title={account.email}
                    >
                      {account.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* ──────────────── STUDENT REGISTRATION FORM ──────────────── */
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2">
                <UserCheck className="w-4 h-4 flex-shrink-0 text-indigo-400" />
                <span>Students can register with their real email and roll number to access their portal.</span>
              </div>

              <div>
                <Label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Full Name *</Label>
                <Input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 h-10"
                  placeholder="e.g. Rahul Sharma"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Real Email Address *</Label>
                  <Input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 h-10"
                    placeholder="student@gmail.com"
                    required
                  />
                </div>
                <div>
                  <Label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Roll Number *</Label>
                  <Input
                    type="text"
                    value={regRollNumber}
                    onChange={(e) => setRegRollNumber(e.target.value)}
                    className="w-full bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 h-10"
                    placeholder="e.g. 1BI23CS045"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Branch / Department *</Label>
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-slate-950 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                    required
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Year of Study *</Label>
                  <select
                    value={regYear}
                    onChange={(e) => setRegYear(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-md bg-slate-950 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-indigo-500"
                    required
                  >
                    {ACADEMIC_YEARS.map(y => (
                      <option key={y.value} value={y.value}>{y.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Phone Number (Optional)</Label>
                <Input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 h-10"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Password *</Label>
                  <div className="relative">
                    <Input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 pr-9 h-10 text-sm"
                      placeholder="Min 6 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Confirm Password *</Label>
                  <Input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 h-10 text-sm"
                    placeholder="Re-enter password"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex justify-center py-2.5 px-4 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors h-11"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Registration & Sign In'}
              </Button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(''); }}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Already have an account? <span className="text-indigo-400 font-semibold underline">Sign In</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
