export default function BannerAd({ imageSrc, href, position = "left", width = 200, height = 600, children }) {
	const content = imageSrc ? (
		<a href={href || "#"} target={href ? "_blank" : "_self"} rel="noopener noreferrer" className="block">
			<img
				src={imageSrc}
				alt="Advertisement"
				width={width}
				height={height}
				className="w-full h-auto rounded border border-slate-200 shadow-sm"
			/>
		</a>
	) : (
		<div
			className="w-full h-full rounded border border-dashed border-slate-300 text-slate-500 flex items-center justify-center text-sm bg-slate-50"
			style={{ minHeight: `${height}px` }}
		>
			{children || "Banner Ad"}
		</div>
	)

	return (
		<aside
			aria-label={`Banner ad ${position}`}
			className="sticky top-20"
			style={{ width }}
		>
			{content}
		</aside>
	)
}


