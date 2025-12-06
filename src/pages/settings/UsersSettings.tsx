import React, { useEffect, useState } from 'react';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import type { User } from '../../types';
import { Plus, Users, Trash2, RefreshCw, X, Mail, Phone, Calendar, Shield, Search, Edit } from 'lucide-react';

const UsersSettings: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    role: 'engineer' as 'engineer' | 'admin' | 'accountant' | 'reception' | 'super_admin',
    status: 'active' as 'active' | 'inactive' | 'suspended'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await userService.getAll({ role: 'engineer,admin,accountant,reception' });
      setUsers(res.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => {
    setEditingUser(null);
    setUserForm({ fullName: '', phone: '', email: '', password: '', role: 'engineer', status: 'active' });
    setShowModal(true);
  };

  const openEditModal = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setUserForm({
      fullName: userToEdit.fullName,
      phone: userToEdit.phone,
      email: userToEdit.email || '',
      password: '', // Don't populate password for security
      role: userToEdit.role,
      status: userToEdit.status
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setUserForm({ fullName: '', phone: '', email: '', password: '', role: 'engineer', status: 'active' });
  };

  const handleSaveUser = async () => {
    if (!userForm.fullName || !userForm.phone) {
      return alert('Full name and phone are required');
    }

    // Password is required only when creating a new user
    if (!editingUser && !userForm.password) {
      return alert('Password is required for new users');
    }

    setSaving(true);
    try {
      if (editingUser) {
        // Update existing user
        const updateData: any = {
          fullName: userForm.fullName,
          phone: userForm.phone,
          email: userForm.email,
          role: userForm.role,
          status: userForm.status
        };

        // Only include password if it was changed
        if (userForm.password) {
          updateData.password = userForm.password;
        }

        await userService.update(editingUser._id, updateData);
        alert('User updated successfully!');
      } else {
        // Create new user
        await userService.create({
          fullName: userForm.fullName,
          phone: userForm.phone,
          email: userForm.email,
          password: userForm.password,
          role: userForm.role,
          status: userForm.status
        } as any);
        alert('User created successfully!');
      }

      await fetchUsers();
      closeModal();
    } catch (error: any) {
      alert(error.response?.data?.message || `Error ${editingUser ? 'updating' : 'creating'} user`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await userService.delete(userId);
      await fetchUsers();
      alert('User deleted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error deleting user');
    }
  };

  // Check if current user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage system users and their roles</p>
        </div>
        {isAdmin && (
          <button onClick={openModal} className="btn-primary flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            Add User
          </button>
        )}
      </div>

      {/* Access Control Message */}
      {!isAdmin && (
        <div className="card bg-yellow-50 border-yellow-200">
          <p className="text-yellow-800 text-sm">
            <strong>Note:</strong> Only administrators can add or remove users.
          </p>
        </div>
      )}

      {/* Search */}
      <div className="card">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone or email..."
            className="input-field pl-12"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((userItem) => (
          <div key={userItem._id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-lg">
                  {userItem.fullName?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {userItem.fullName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`badge ${
                        userItem.role === 'admin' || userItem.role === 'super_admin' ? 'badge-pending' :
                        userItem.role === 'engineer' ? 'badge-in-progress' :
                        userItem.role === 'accountant' ? 'badge-completed' :
                        'badge-cancelled'
                      }`}>
                        <Shield className="w-3 h-3 mr-1" />
                        {userItem.role.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`badge ${userItem.status === 'active' ? 'badge-completed' : 'badge-cancelled'}`}>
                        {userItem.status}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(userItem)}
                        className="action-btn hover:text-blue-500 hover:bg-blue-50"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(userItem._id, userItem.fullName)}
                        className="action-btn hover:text-red-500 hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Contact Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{userItem.phone}</span>
                  </div>
                  {userItem.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{userItem.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Joined {new Date(userItem.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="card text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchQuery ? 'No users found matching your search' : 'No users found'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingUser ? 'Edit User' : 'Add User'}
              </h2>
              <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* User Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    value={userForm.fullName}
                    onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                    className="input-field"
                    placeholder="John Doe"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={userForm.phone}
                      onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                      className="input-field"
                      placeholder="9876543210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      className="input-field"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password {editingUser ? '(Leave blank to keep current)' : '*'}
                    </label>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      className="input-field"
                      placeholder={editingUser ? "Enter new password (optional)" : "Enter password"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value as any })}
                      className="input-field"
                    >
                      <option value="engineer">Engineer</option>
                      <option value="admin">Admin</option>
                      <option value="accountant">Accountant</option>
                      <option value="reception">Reception</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                </div>
                {editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                    <select
                      value={userForm.status}
                      onChange={(e) => setUserForm({ ...userForm, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                      className="input-field"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button onClick={closeModal} className="btn-secondary">Cancel</button>
              <button
                onClick={handleSaveUser}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {editingUser ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    {editingUser ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {editingUser ? 'Update User' : 'Add User'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersSettings;
