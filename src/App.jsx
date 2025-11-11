import { NavLink, Outlet } from 'react-router-dom'
import BannerAd from './components/BannerAd.jsx'

export default function App() {
	return (
		<div className="min-h-screen flex flex-col">
			<header className="border-b bg-white/80 backdrop-blur sticky top-0 z-10">
				<div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<div className="h-8 w-8 rounded bg-cyan-600" />
						<h1 className="text-lg font-semibold">GlucoSense</h1>
					</div>
					<nav className="flex items-center gap-4 text-sm">
						<NavLink to="/" className={({isActive}) => isActive ? "text-cyan-700 font-medium" : "text-slate-600 hover:text-slate-900"}>Home</NavLink>
						<NavLink to="/history" className={({isActive}) => isActive ? "text-cyan-700 font-medium" : "text-slate-600 hover:text-slate-900"}>History</NavLink>
					</nav>
				</div>
			</header>
			<main className="flex-1">
				<div className="mx-auto px-4 py-6 max-w-6xl">
					<div className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)_200px] gap-4">
						<div className="hidden md:block">
							<BannerAd
								position="left"
								imageSrc={import.meta.env.VITE_LEFT_BANNER_IMG}
								href={import.meta.env.VITE_LEFT_BANNER_LINK}
							/>
						</div>
						<div>
							<div className="max-w-3xl mx-auto">
								<Outlet />
							</div>
						</div>
						<div className="hidden md:block">
							<BannerAd
								position="right"
								imageSrc={import.meta.env.VITE_RIGHT_BANNER_IMG}
								href={import.meta.env.VITE_RIGHT_BANNER_LINK}
							/>
						</div>
					</div>
				</div>
			</main>
			<footer className="border-t bg-white">
				<div className="max-w-3xl mx-auto px-4 py-4 text-xs text-slate-500">
					No medical advice. For informational purposes only.
				</div>
			</footer>
		</div>
	)
}


