import Button from "../components/ui/Button";

function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">Retailer Access</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Sign In</h1>
          <p className="mt-2 text-sm text-slate-500">Manage products, track orders, and monitor your seller performance.</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
            <input
              type="email"
              placeholder="retailer@store.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400"
            />
          </div>

          <Button type="button" className="w-full">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Login;
