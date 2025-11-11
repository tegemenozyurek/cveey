import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function PredictionChart({ baseline, predicted }) {
	const data = [
		{ t: 'Now', glucose: baseline },
		{ t: '30m', glucose: Math.round((baseline + predicted) / 2) },
		{ t: '60m', glucose: predicted },
		{ t: '120m', glucose: Math.round(baseline + (predicted - baseline) * 0.4) },
	]

	return (
		<div className="w-full h-64">
			<ResponsiveContainer width="100%" height="100%">
				<LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="t" />
					<YAxis domain={['auto', 'auto']} />
					<Tooltip />
					<Line type="monotone" dataKey="glucose" stroke="#0891b2" strokeWidth={2} dot />
				</LineChart>
			</ResponsiveContainer>
		</div>
	)
}


