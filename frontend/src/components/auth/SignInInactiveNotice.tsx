type Props = {
  show: boolean;
};

export function SignInInactiveNotice({ show }: Props) {
  if (!show) return null;

  return (
    <div
      role="status"
      className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950"
    >
      You were signed out after a period of inactivity. Please sign in again.
    </div>
  );
}
