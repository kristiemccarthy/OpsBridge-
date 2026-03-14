// Root page — immediately redirects to /login.
// The middleware.js file will then redirect to the correct dashboard
// if the user is already logged in.
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/login')
}
