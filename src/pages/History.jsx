import { useLocalStorage } from '../hooks/useLocalStorage'

function formatDate(ts) {
	const d = new Date(ts)
	return d.toLocaleString()
}

export default function History() {
	const [history, setHistory] = useLocalStorage('glucosense_history', [])

	function clearHistory() {
		setHistory([])
	}

	return (
		<div className="grid gap-4">
			<div className="flex items-center justify-between">
				<h2 className="text-base font-semibold">History</h2>
				{history.length > 0 && (
					<button className="text-sm text-rose-700 hover:text-rose-800" onClick={clearHistory}>Clear</button>
				)}
			</div>
			{history.length === 0 && (
				<p className="text-slate-600">No predictions yet.</p>
			)}
			<ul className="grid gap-3">
				{history.map((h) => (
					<li key={h.timestamp} className="border rounded-lg p-3 bg-white">
						<div className="flex items-center justify-between text-xs text-slate-500 mb-2">
							<span>{formatDate(h.timestamp)}</span>
							<span>Baseline: {h.baseline} mg/dL → Predicted: {h.predicted} mg/dL</span>
						</div>
						<div className="text-sm">
							<div><span className="text-slate-500">Food:</span> {h.input.foodName} ({h.input.foodAmount})</div>
							<div className="mt-1 text-slate-700">{h.responseText}</div>
						</div>
					</li>
				))}
			</ul>
		</div>
	)
}


