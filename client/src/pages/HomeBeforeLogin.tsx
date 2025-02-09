import { usePrivy } from "@privy-io/react-auth"
import ExploreSection from "../components/ExploreSection"
import Features from "../components/Features"
import FloatingIcons from "../components/FloatingIcons"
import Navbar from "../components/Navbar"

const HomeBeforeLogin = () => {
    const {authenticated} = usePrivy();
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
            <Navbar />
            <main>
                <div className="container mx-auto px-4">
                    <ExploreSection />
                </div>
                <Features />
            </main>
        </div>
    )
}

export default HomeBeforeLogin