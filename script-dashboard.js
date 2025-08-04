import { logoutProfile, isEmailConfirmed } from './auth.js'

async function init() {
  // 1. Check login
  const user = JSON.parse(localStorage.getItem('sb_user'))
  if (!user) return window.location.href = 'index.html'

  // 2. Email confirmation
  try {
    const confirmed = await isEmailConfirmed()
    if (!confirmed) {
      alert('Please confirm your email first.')
      return window.location.href = 'index.html'
    }
  } catch (err) {
    console.error(err)
  }

  document.getElementById('welcome').innerText = `Hello, ${user.email}!`

  // 3. Logout
  document.getElementById('btnLogout').onclick = async () => {
    try {
      await logoutProfile()
      localStorage.removeItem('sb_user')
      window.location.href = 'index.html'
    } catch (err) {
      alert(err.message)
    }
  }
}

init()
