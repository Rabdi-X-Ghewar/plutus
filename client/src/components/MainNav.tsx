import { Link } from "react-router"
import { cn } from "../lib/utils"

const items = [
    { title: "All", href: "#" },
    { title: "Theatre", href: "#" },
    { title: "Bars", href: "#" },
    { title: "Clubs", href: "#" },
    { title: "Fishing", href: "#" },
    { title: "Sea & Beach", href: "#" },
    { title: "Sports", href: "#" },
]

export function MainNav() {
    return (
        <nav className="flex items-center space-x-6">
            {items.map((item) => (
                <Link
                    key={item.title}
                    to={item.href}
                    className={cn(
                        "text-sm font-medium transition-colors hover:text-primary",
                        item.title === "All" ? "text-primary" : "text-muted-foreground",
                    )}
                >
                    {item.title}
                </Link>
            ))}
        </nav>
    )
}

