import { signUpProfile } from './auth.js'

document.getElementById('btnSignup').onclick = async () => {
  const email = document.getElementById('email').value
  const password = document.getElementById('password').value
  const referredBy = document.getElementById('referral').value || null

  try {
    const { uid, referralCode } = await signUpProfile(email, password, referredBy)
    alert(`Signed up! Your code: ${referralCode}`)
    window.location.href = 'index.html'
  } catch (err) {
    alert('Error: ' + err.message)
  }
}
