import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

function Profile() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your store and account details.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-1" title="Store Snapshot">
          <div className="space-y-3 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">Store Name:</span> Northline Retail
            </p>
            <p>
              <span className="font-semibold text-slate-900">Seller ID:</span> RET-7781
            </p>
            <p>
              <span className="font-semibold text-slate-900">Region:</span> United States
            </p>
            <p>
              <span className="font-semibold text-slate-900">Member Since:</span> March 2022
            </p>
          </div>
        </Card>

        <Card className="xl:col-span-2" title="Business Information" subtitle="Static profile form UI.">
          <form className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Owner Name</label>
              <input type="text" defaultValue="Rohan Khanna" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Business Email</label>
              <input
                type="email"
                defaultValue="owner@northlineretail.com"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Phone</label>
              <input type="text" defaultValue="+1 555 239 1001" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Address</label>
              <input type="text" defaultValue="145 Market Street, Austin" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
            </div>

            <div className="flex gap-3 md:col-span-2">
              <Button type="button">Save Changes</Button>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default Profile;
