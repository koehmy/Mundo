// File: components/Navbar.js
// Task: Sticky, session-aware navbar. Shows Login/Signup or avatar + Logout.
const Navbar = ({ session }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-emerald-900 rounded-full flex items-center justify-center text-white font-serif font-bold text-xl group-hover:bg-emerald-800 transition-colors">
              M
            </div>
            <span className="font-serif text-xl font-bold text-stone-900 tracking-tight">{t('brand')}</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink href="/listings" labelKey="explore" icon={Search} router={router} onClick={() => setIsMenuOpen(false)} />
            {session ? (
              <>
                <NavLink href="/create-listing" labelKey="list" icon={PlusCircle} router={router} onClick={() => setIsMenuOpen(false)} />
                <NavLink href="/profile" labelKey="profile" icon={User} router={router} onClick={() => setIsMenuOpen(false)} />
                <button 
                  onClick={handleLogout}
                  className="ml-4 px-4 py-2 border border-stone-200 rounded-full text-sm font-medium text-stone-600 hover:border-emerald-900 hover:text-emerald-900 transition-all"
                >
                  {t('signOut')}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="ml-4 px-5 py-2 bg-stone-900 text-stone-50 rounded-full text-sm font-medium hover:bg-emerald-900 transition-colors shadow-lg shadow-stone-200"
                >
                  {t('login')}
                </Link>
              </>
            )}
            <LanguageSwitcher />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-stone-800 p-2">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute w-full bg-white border-b border-stone-100 shadow-xl animate-in slide-in-from-top-2">
            <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
              <NavLink href="/listings" labelKey="exploreListings" icon={Search} router={router} onClick={() => setIsMenuOpen(false)} />
              {session ? (
                <>
                  <NavLink href="/create-listing" labelKey="createListing" icon={PlusCircle} router={router} onClick={() => setIsMenuOpen(false)} />
                  <NavLink href="/profile" labelKey="myProfile" icon={User} router={router} onClick={() => setIsMenuOpen(false)} />
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-3 text-stone-500 hover:text-red-600 flex items-center space-x-2"
                  >
                    <LogOut size={16} />
                    <span>{t('signOut')}</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full mt-4 block text-center bg-emerald-900 text-white py-3 rounded-lg font-medium"
                  >
                    {t('loginSignup')}
                  </Link>
                </>
              )}
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </div>
      {/* ...existing code... */}
    </nav>
  );
};

export default Navbar;