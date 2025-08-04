import { resetPasswordRequest } from './auth.js'

document.getElementById('btnReset').onclick = async () => {
  const email = document.getElementById('email').value
  try {
    await resetPasswordRequest(email)
    alert('Reset email sent. Check your inbox.')
    window.location.href = 'index.html'
  } catch (err) {
    alert('Error: ' + err.message)
  }
}
import { resetPasswordConfirm } from './auth.js'

async function confirmReset() {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('access_token')
  const newPassword = document.getElementById('newPassword').value

  try {
    await resetPasswordConfirm(token, newPassword)
    alert('Password reset! You can now log in.')
    window.location.href = 'index.html'
  } catch (err) {
    alert('Error: ' + err.message)
  }
}

document.getElementById('btnConfirm').onclick = confirmReset
