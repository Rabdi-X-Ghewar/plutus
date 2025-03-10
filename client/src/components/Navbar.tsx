
import Login from './Login';
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

const Navbar = () => {
  const navigate = useNavigate()

  return (
    <motion.header
      className="sticky top-0 z-50 bg-background backdrop-blur-md"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        {/* Logo and Company Name */}
        <div 
          className="flex lg:flex-1 cursor-pointer items-center space-x-4"
          onClick={() => navigate('/')}
          role="button"
          tabIndex={0}
        >
          <img
            className="h-8 w-auto"
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/creative-SW6QDQbcVuwPgb6a2CYtYmRbsJa4k1.png"
            alt="Flowers & Saints Logo"
          />
          <span className="text-lg font-bold text-foreground">PLUTUS</span>
        </div>

        {/* External links */}
        <div className="flex gap-x-12">
          <a
            href="https://www.flowersandsaints.com.au"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
          >
            Features
          </a>
          <a
            href="https://www.flowersandsaints.com.au"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
          >
            Pricing
          </a>
          <a
            href="https://www.flowersandsaints.com.au"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
          >
            Contact
          </a>
        </div>

        {/* Login section */}
        <div className="flex flex-1 justify-end">
          <div className="flex items-center space-x-8">
            <Login />
          </div>
        </div>
      </nav>
    </motion.header>
  );
};

export default Navbar;