export default function StatCard({ title, value, color }) {
  return (
    <div className={`rounded-xl p-6 text-white ${color}`}>
      <p className="text-sm">{title}</p>
            <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  )
}
