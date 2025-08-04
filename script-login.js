import { loginProfile } from './auth.js'

document.getElementById('btnLogin').onclick = async () => {
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value

  try {
    const user = await loginProfile(email, password)
    // Save session info in localStorage
    localStorage.setItem('sb_user', JSON.stringify(user))
    window.location.href = 'dashboard.html'
  } catch (err) {
    alert('Login failed: ' + err.message)
  }
}
