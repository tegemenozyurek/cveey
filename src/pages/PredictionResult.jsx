import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { predictGlucose } from '../services/gemini'
import { useLocalStorage } from '../hooks/useLocalStorage'
import PredictionChart from '../components/PredictionChart'

function extractPredictedMgDl(text, fallback) {
	const match = text.match(/(~?\s*\b(\d{2,3})\s*mg\/dL)/i)
	if (match && match[2]) {
		return parseInt(match[2], 10)
	}
	// try another pattern like "to 120"
	const m2 = text.match(/\bto\s+(\d{2,3})\b/i)
	if (m2 && m2[1]) return parseInt(m2[1], 10)
	return fallback
}

export default function PredictionResult() {
	const { state } = useLocation()
	const navigate = useNavigate()
	const [history, setHistory] = useLocalStorage('glucosense_history', [])
	const [status, setStatus] = useState({ loading: true, error: '', text: '' })

	const baseline = useMemo(() => Number(state?.lastGlucoseMgDl || 100), [state])

	useEffect(() => {
		if (!state) {
			navigate('/')
			return
		}
		let isMounted = true
		async function run() {
			setStatus({ loading: true, error: '', text: '' })
			try {
				const { text } = await predictGlucose(state)
				if (!isMounted) return
				setStatus({ loading: false, error: '', text })
				const predicted = extractPredictedMgDl(text, baseline)
				const entry = {
					timestamp: Date.now(),
					input: state,
					responseText: text,
					baseline,
					predicted,
				}
				setHistory(prev => [entry, ...prev].slice(0, 50))
			} catch (e) {
				if (!isMounted) return
				setStatus({ loading: false, error: e.message || 'Prediction failed', text: '' })
			}
		}
		run()
		return () => { isMounted = false }
	}, [state, navigate, setHistory, baseline])

	if (!state) return null

	const predicted = extractPredictedMgDl(status.text, baseline)

	return (
		<div className="grid gap-6">
			<section className="bg-white shadow-sm border rounded-xl p-4 sm:p-6">
				<h2 className="text-base font-semibold mb-2">Prediction</h2>
				{status.loading && <p className="text-slate-600">Predicting with AI…</p>}
				{status.error && <p className="text-rose-700">{status.error}</p>}
				{!status.loading && !status.error && (
					<div className="space-y-2">
						<p className="text-slate-800">{status.text}</p>
						<p className="text-xs text-slate-500">This is not medical advice.</p>
					</div>
				)}
			</section>

			<section className="bg-white shadow-sm border rounded-xl p-4 sm:p-6">
				<h3 className="text-sm font-medium mb-3">Approximate curve</h3>
				<PredictionChart baseline={baseline} predicted={predicted} />
			</section>

			<section className="bg-white shadow-sm border rounded-xl p-4 sm:p-6">
				<h3 className="text-sm font-medium mb-3">Details</h3>
				<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
					<div className="p-3 border rounded-lg">
						<div className="text-slate-500">Age</div>
						<div className="font-medium">{state.age}</div>
					</div>
					<div className="p-3 border rounded-lg">
						<div className="text-slate-500">Height</div>
						<div className="font-medium">{state.heightCm} cm</div>
					</div>
					<div className="p-3 border rounded-lg">
						<div className="text-slate-500">Weight</div>
						<div className="font-medium">{state.weightKg} kg</div>
					</div>
					<div className="p-3 border rounded-lg">
						<div className="text-slate-500">Last glucose</div>
						<div className="font-medium">{state.lastGlucoseMgDl} mg/dL</div>
					</div>
					<div className="p-3 border rounded-lg">
						<div className="text-slate-500">Food</div>
						<div className="font-medium">{state.foodName}</div>
					</div>
					<div className="p-3 border rounded-lg">
						<div className="text-slate-500">Amount</div>
						<div className="font-medium">{state.foodAmount}</div>
					</div>
				</div>
			</section>
		</div>
	)
}


