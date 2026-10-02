import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  RotateCcw,
  Edit2,
  Trash2,
  X,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import SkeletonTable from '../components/SkeletonTable';
import Toast from '../components/Toast';
import CustomDropdown from '../components/CustomDropdown';
import AntDateRangePicker from '../components/AntDateRangePicker';
import ModalPortal from '../components/ModalPortal';
import PageHeaderCard from '../components/PageHeaderCard';

export default function UserManagementPage({ users, onUpdateUsers, roles = [] }) {
  const roleOptions =
    roles && roles.length > 0
      ? roles.map((r) => (typeof r === 'object' ? r.role : r))
      : ['Superadmin', 'Admin', 'Operator', 'Engineer'];
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Add / Edit User Form State
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('Admin');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Table Password Visibility
  const [visiblePasswordIds, setVisiblePasswordIds] = useState([]);
  const togglePasswordVisibility = (userId) => {
    setVisiblePasswordIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  // Reset Password Modal State
  const [showResetModal, setShowResetModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteId, setDeleteId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEntries = filteredUsers.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleOpenAdd = () => {
    setEditingUser(null);
    setUsername('');
    setRole('Admin');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowAddModal(true);
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setUsername(u.username);
    setRole(u.role);
    setPassword(u.password || '');
    setConfirmPassword(u.password || '');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowAddModal(true);
  };

  // Add / Edit User Save
  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setToast({ type: 'error', title: 'Error', message: 'Username is required.' });
      return;
    }
    if (!role) {
      setToast({ type: 'error', title: 'Error', message: 'Role is required.' });
      return;
    }
    if (!password) {
      setToast({ type: 'error', title: 'Error', message: 'Password is required.' });
      return;
    }
    if (password !== confirmPassword) {
      setToast({ type: 'error', title: 'Error', message: 'Password and Confirm Password do not match.' });
      return;
    }

    if (editingUser) {
      const updated = users.map((u) =>
        u.id === editingUser.id ? { ...u, username: username.trim(), role, password } : u
      );
      onUpdateUsers(updated);
      setToast({
        type: 'success',
        title: 'User Updated',
        message: `User ${username} has been successfully updated.`
      });
    } else {
      const newUser = {
        id: Date.now(),
        username: username.trim(),
        role,
        password,
        datetime: new Date().toLocaleDateString('en-GB') + ' 12:00'
      };
      onUpdateUsers([...users, newUser]);
      setToast({
        type: 'success',
        title: 'User Added Successfully',
        message: `User ${username} has been added to the system.`
      });
    }

    setShowAddModal(false);
    setEditingUser(null);
    setUsername('');
    setRole('Admin');
    setPassword('');
    setConfirmPassword('');
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      onUpdateUsers(users.filter((u) => u.id !== deleteId));
      setToast({ type: 'success', title: 'Deleted', message: 'User deleted successfully.' });
      setDeleteId(null);
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmNewPassword) {
      setToast({
        type: 'error',
        title: 'Error',
        message: 'New passwords must match and cannot be empty.'
      });
      return;
    }

    const updated = users.map((u) =>
      u.id === showResetModal.id ? { ...u, password: newPassword } : u
    );
    onUpdateUsers(updated);

    setToast({
      type: 'success',
      title: 'Password Reset Successful',
      message: `Password for ${showResetModal.username} has been reset.`
    });
    setShowResetModal(null);
    setNewPassword('');
    setConfirmNewPassword('');
    setShowResetPassword(false);
    setShowResetConfirmPassword(false);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Header matching Testing Process exactly */}
        <PageHeaderCard
          title="User Management"
          subtitle="View your user in this system"
        />

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-[#E4E7EC] p-4 shadow-sm space-y-5">
          {/* Filters and Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full pl-10 pr-9 py-2 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:border-emerald-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Ant Design DateRangePicker */}
              <AntDateRangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates)}
              />

              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-4 py-2 bg-[#00A854] hover:bg-[#008C45] text-white rounded-lg text-sm font-medium transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Data</span>
              </button>
            </div>
          </div>

          {/* Table / Skeleton */}
          {loading ? (
            <SkeletonTable rows={4} cols={6} />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[#D0D5DD]">
              <table className="w-full text-left border-collapse text-sm font-sans">
                <thead className="bg-[#F2F2F7] border-b border-[#D0D5DD]">
                  <tr className="text-[#23262B] font-semibold">
                    <th className="py-3.5 px-4 w-16">
                      <div className="flex items-center gap-1.5 cursor-pointer select-none">
                        <span>No</span>
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 cursor-pointer select-none">
                        <span>Username</span>
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 cursor-pointer select-none">
                        <span>Role</span>
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 cursor-pointer select-none">
                        <span>Password</span>
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 cursor-pointer select-none">
                        <span>Datetime</span>
                        <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E7EC] bg-white">
                  {paginatedUsers.map((u, index) => (
                    <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 text-gray-600 font-medium leading-5">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="py-3.5 px-4 text-gray-800 font-medium leading-5">
                        {u.username}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 leading-5">{u.role}</td>
                      <td className="py-3.5 px-4 text-gray-800 font-medium leading-5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs tracking-wider select-none text-gray-700">
                            {visiblePasswordIds.includes(u.id) ? (u.password || 'affan12345') : '**************'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(u.id)}
                            className="p-1 border border-blue-400 text-blue-500 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title={visiblePasswordIds.includes(u.id) ? "Hide Password" : "Show Password"}
                          >
                            {visiblePasswordIds.includes(u.id) ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowResetModal(u);
                              setNewPassword('');
                              setConfirmNewPassword('');
                            }}
                            className="p-1 border border-red-300 text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Reset Password"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 leading-5">{u.datetime}</td>
                      <td className="py-3.5 px-4 text-center leading-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 border border-amber-300 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit User"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(u.id)}
                            className="p-1.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-500">
            <div>
              Showing <span className="font-semibold text-gray-700">1</span> to{' '}
              <span className="font-semibold text-gray-700">
                {Math.min(itemsPerPage, totalEntries)}
              </span>{' '}
              of <span className="font-semibold text-gray-700">{totalEntries}</span>{' '}
              entries
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="w-7 h-7 flex items-center justify-center border border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold rounded-lg text-xs">
                  {currentPage}
                </span>
                <span>/ {totalPages}</span>

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span>Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-gray-200 rounded-lg bg-white text-gray-700 text-xs focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
                <span>entries</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Add / Edit User Modal using ModalPortal (Zero Gap Blur) */}
      <ModalPortal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
          <div className="flex items-start justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                {editingUser ? 'Edit User Management' : 'Add User Management'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                This field is for desc terms of service
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveUser} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Input Username"
                className="w-full h-11 px-3.5 bg-white border border-[#D0D5DD] rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#00A854]"
                required
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                Role
              </label>
              <CustomDropdown
                value={role}
                onChange={(val) => setRole(val)}
                options={roleOptions}
                placeholder="Select Role"
                buttonClassName="h-11 rounded-xl"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Input Password"
                  className="w-full h-11 pl-3.5 pr-10 bg-white border border-[#D0D5DD] rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#00A854]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Input Password"
                  className="w-full h-11 pl-3.5 pr-10 bg-white border border-[#D0D5DD] rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#00A854]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5 cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#00A854] hover:bg-[#008C45] text-white rounded-lg text-sm font-medium shadow-sm transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </ModalPortal>

      {/* Reset Password Modal */}
      {showResetModal && (
        <ModalPortal isOpen={!!showResetModal} onClose={() => setShowResetModal(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Reset Password ({showResetModal.username})
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  This field is for desc terms of service
                </p>
              </div>
              <button
                onClick={() => setShowResetModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Input New Password"
                    className="w-full h-11 pl-3.5 pr-10 bg-white border border-[#D0D5DD] rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#00A854]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5 cursor-pointer"
                  >
                    {showResetPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showResetConfirmPassword ? 'text' : 'password'}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Input Confirm Password"
                    className="w-full h-11 pl-3.5 pr-10 bg-white border border-[#D0D5DD] rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#00A854]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5 cursor-pointer"
                  >
                    {showResetConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowResetModal(null)}
                  className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#00A854] hover:bg-[#008C45] text-white rounded-lg text-sm font-medium shadow-sm transition-colors cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </ModalPortal>
      )}

      {/* Delete Confirmation Modal */}
      <ModalPortal isOpen={!!deleteId} onClose={() => setDeleteId(null)}>
        <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
          <h3 className="text-base font-bold text-gray-900">Delete User?</h3>
          <p className="text-xs text-gray-500">
            Are you sure you want to delete this user? This action cannot be undone.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setDeleteId(null)}
              className="px-5 py-2.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-6 py-2.5 bg-[#F04438] hover:bg-[#D92D20] text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </ModalPortal>

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
