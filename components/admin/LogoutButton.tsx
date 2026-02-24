'use client'

export function LogoutButton() {
  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        window.location.href = '/admin/login'
      }
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <form onSubmit={handleLogout}>
      <button
        type="submit"
        className="text-xs text-slate-500 hover:text-slate-700"
      >
        退出
      </button>
    </form>
  )
}
