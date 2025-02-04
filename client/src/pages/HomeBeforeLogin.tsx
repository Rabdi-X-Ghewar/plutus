import ExploreSection from "../components/ExploreSection"
import Features from "../components/Features"
import FloatingIcons from "../components/FloatingIcons"
import Navbar from "../components/Navbar"

const HomeBeforeLogin = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-cream">
            <Navbar />
            <main>
                <div className="container mx-auto px-4">
                    <ExploreSection />
                </div>
                <FloatingIcons />
                <Features />
            </main>
        </div>
    )
}

export default HomeBeforeLogin