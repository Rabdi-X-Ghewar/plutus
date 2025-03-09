import ExploreSection from "../components/ExploreSection"
import Features from "../components/Features"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"


const HomeBeforeLogin = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
            <Navbar />
            <main>
                    <ExploreSection />
                
                <Features />
                <Footer />
            </main>
        </div>
    )
}

export default HomeBeforeLogin