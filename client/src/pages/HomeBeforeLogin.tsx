
import ExploreSection from "../components/ExploreSection"
import Features from "../components/Features"

import Navbar from "../components/Navbar"

const HomeBeforeLogin = () => {

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