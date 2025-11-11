import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useState } from 'react'

export default function HomePage() {
	const navigate = useNavigate()
	const [profile, setProfile] = useLocalStorage('glucosense_profile', {
		age: '',
		heightCm: '',
		weightKg: '',
		lastGlucoseMgDl: '',
	})
	const [food, setFood] = useLocalStorage('glucosense_food', {
		foodName: '',
		foodAmount: '',
	})
	const [errors, setErrors] = useState({})

	function handleChangeProfile(e) {
		const { name, value } = e.target
		setProfile(prev => ({ ...prev, [name]: value }))
	}

	function handleChangeFood(e) {
		const { name, value } = e.target
		setFood(prev => ({ ...prev, [name]: value }))
	}

	function validate() {
		const next = {}
		if (!profile.age) next.age = 'Required'
		if (!profile.heightCm) next.heightCm = 'Required'
		if (!profile.weightKg) next.weightKg = 'Required'
		if (!profile.lastGlucoseMgDl) next.lastGlucoseMgDl = 'Required'
		if (!food.foodName) next.foodName = 'Required'
		if (!food.foodAmount) next.foodAmount = 'Required'
		setErrors(next)
		return Object.keys(next).length === 0
	}

	function onPredict(e) {
		e.preventDefault()
		if (!validate()) return
		navigate('/result', { state: { ...profile, ...food } })
	}

	return (
		<div className="grid gap-6">
			<section className="bg-white shadow-sm border rounded-xl p-4 sm:p-6">
				<h2 className="text-base font-semibold mb-4">Your Info</h2>
				<form className="grid sm:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm text-slate-600 mb-1">Age</label>
						<input name="age" type="number" min="1" value={profile.age} onChange={handleChangeProfile} className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-600" placeholder="e.g., 34" />
						{errors.age && <p className="text-xs text-rose-600 mt-1">{errors.age}</p>}
					</div>
					<div>
						<label className="block text-sm text-slate-600 mb-1">Height (cm)</label>
						<input name="heightCm" type="number" min="50" value={profile.heightCm} onChange={handleChangeProfile} className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-600" placeholder="e.g., 175" />
						{errors.heightCm && <p className="text-xs text-rose-600 mt-1">{errors.heightCm}</p>}
					</div>
					<div>
						<label className="block text-sm text-slate-600 mb-1">Weight (kg)</label>
						<input name="weightKg" type="number" min="20" value={profile.weightKg} onChange={handleChangeProfile} className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-600" placeholder="e.g., 70" />
						{errors.weightKg && <p className="text-xs text-rose-600 mt-1">{errors.weightKg}</p>}
					</div>
					<div>
						<label className="block text-sm text-slate-600 mb-1">Last glucose (mg/dL)</label>
						<input name="lastGlucoseMgDl" type="number" min="20" value={profile.lastGlucoseMgDl} onChange={handleChangeProfile} className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-600" placeholder="e.g., 98" />
						{errors.lastGlucoseMgDl && <p className="text-xs text-rose-600 mt-1">{errors.lastGlucoseMgDl}</p>}
					</div>
				</form>
			</section>
			<section className="bg-white shadow-sm border rounded-xl p-4 sm:p-6">
				<h2 className="text-base font-semibold mb-4">Meal</h2>
				<form className="grid sm:grid-cols-2 gap-4" onSubmit={onPredict}>
					<div className="sm:col-span-1">
						<label className="block text-sm text-slate-600 mb-1">Food name</label>
						<input name="foodName" value={food.foodName} onChange={handleChangeFood} className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-600" placeholder='e.g., "grapes"' />
						{errors.foodName && <p className="text-xs text-rose-600 mt-1">{errors.foodName}</p>}
					</div>
					<div className="sm:col-span-1">
						<label className="block text-sm text-slate-600 mb-1">Amount</label>
						<input name="foodAmount" value={food.foodAmount} onChange={handleChangeFood} className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-600" placeholder='e.g., "100g"' />
						{errors.foodAmount && <p className="text-xs text-rose-600 mt-1">{errors.foodAmount}</p>}
					</div>
					<div className="sm:col-span-2">
						<button type="submit" className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-cyan-700 text-white px-4 py-2 hover:bg-cyan-800">
							Predict
						</button>
					</div>
				</form>
			</section>
		</div>
	)
}


