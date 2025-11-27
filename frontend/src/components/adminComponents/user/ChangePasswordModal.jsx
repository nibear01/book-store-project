import React from "react";

const ChangePasswordModal = ({ changingPwUser, setChangingPwUser, newPassword, setNewPassword, confirmPassword, setConfirmPassword, adminUsersAPI }) => {
  return (
    <div>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="change-pw-backdrop">
        <div className="bg-white p-4 sm:p-6 rounded-md w-full max-w-md" data-testid="change-pw-modal" name="change-pw-modal">
          <h3 className="text-lg font-bold mb-4" data-testid="change-pw-title" name="change-pw-title">Change Password</h3>
          <p className="text-sm text-gray-600 mb-3">
            User: {changingPwUser?.email || changingPwUser?._id}
          </p>

          <label className="block mb-2 text-sm">Previous Password</label>
          <input
            type="text"
            className="border p-2 rounded-md w-full mb-3 bg-gray-100"
            value={changingPwUser?.password || ""}
            readOnly
            data-testid="change-pw-prev"
            name="change-pw-prev"
          />

          <label className="block mb-2 text-sm">New Password</label>
          <input
            type="password"
            className="border p-2 rounded-md w-full mb-3"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
            data-testid="change-pw-new"
            name="change-pw-new"
          />

          <label className="block mb-2 text-sm">Confirm Password</label>
          <input
            type="password"
            className="border p-2 rounded-md w-full mb-4"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            data-testid="change-pw-confirm"
            name="change-pw-confirm"
          />

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button
              onClick={() => setChangingPwUser(null)}
              className="px-3 py-2 rounded-md bg-gray-200 mt-2 sm:mt-0"
              data-testid="change-pw-cancel"
              name="change-pw-cancel"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                try {
                  if (!newPassword || newPassword.length < 8) {
                    alert("Password must be at least 8 characters");
                    return;
                  }
                  if (newPassword !== confirmPassword) {
                    alert("Passwords do not match");
                    return;
                  }
                  await adminUsersAPI.changePassword(
                    changingPwUser._id,
                    newPassword
                  );
                  setChangingPwUser(null);
                  setNewPassword("");
                  setConfirmPassword("");
                  // alert("✅ Password updated");
                } catch (e) {
                  alert(e.message || "Failed to update password");
                }
              }}
              className="px-3 py-2 rounded-md bg-black text-white"
              data-testid="change-pw-submit"
              name="change-pw-submit"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
