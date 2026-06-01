import React, { useState, useEffect } from 'react';
import { Search, Users, BarChart3, Mail, Trash2, Crown, Copy, ChevronDown } from 'lucide-react';
import {API_BASE} from "../environment.jsx"
import { useNavigate } from "react-router-dom";


export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [sentMessages, setSentMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [promoteEmail, setPromoteEmail] = useState('');
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [copiedId, setCopiedId] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [newRole, setNewRole] = useState('user');
  const [selectedUserIdForRole, setSelectedUserIdForRole] = useState('');
  const [messageForm, setMessageForm] = useState({ userId: '', subject: '', message: '', priority: 'normal' });
  const [inviteLink, setInviteLink] = useState('');

  const API_URL = API_BASE;
  const token = localStorage.getItem('token');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/statistics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      showMessage('error', 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAllUsers(data);
    } catch (err) {
      showMessage('error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchSentMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/messages/sent`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSentMessages(data);
    } catch (err) {
      showMessage('error', 'Failed to fetch messages');
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`${API_URL}/admin/users/search/${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSearchResults(data);
    } catch (err) {
      showMessage('error', 'Search failed');
    }
  };

  const handleCreateInvite = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/invite`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail || undefined })
      });
      const data = await res.json();
      setInviteLink(data.inviteLink);
      showMessage('success', 'Invite created');
      setInviteEmail('');
    } catch (err) {
      showMessage('error', 'Failed to create invite');
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteUser = async () => {
    if (!promoteEmail.trim()) {
      showMessage('error', 'Enter email');
      return;
    }
    try {
      setLoading(true);
      await fetch(`${API_URL}/admin/promote`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: promoteEmail })
      });
      showMessage('success', 'User promoted');
      setPromoteEmail('');
      fetchUsers();
    } catch (err) {
      showMessage('error', 'Failed to promote');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUserIdForRole) {
      showMessage('error', 'Select user');
      return;
    }
    try {
      setLoading(true);
      await fetch(`${API_URL}/admin/users/${selectedUserIdForRole}/role`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      showMessage('success', 'Role updated');
      setSelectedUserIdForRole('');
      fetchUsers();
    } catch (err) {
      showMessage('error', 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setLoading(true);
      await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showMessage('success', 'User deleted');
      setDeleteConfirm(null);
      setExpandedUserId(null);
      fetchUsers();
    } catch (err) {
      showMessage('error', 'Failed to delete');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (bulkDeleteIds.length === 0) {
      showMessage('error', 'Select users');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/admin/users/bulk-delete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: bulkDeleteIds })
      });
      const data = await res.json();
      showMessage('success', `${data.deletedCount} users deleted`);
      setBulkDeleteIds([]);
      fetchUsers();
    } catch (err) {
      showMessage('error', 'Bulk delete failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await fetch(`${API_URL}/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showMessage('success', 'Status updated');
      fetchUsers();
    } catch (err) {
      showMessage('error', 'Failed to update status');
    }
  };

  const handleSendMessage = async () => {
    if (!messageForm.userId || !messageForm.subject || !messageForm.message) {
      showMessage('error', 'Fill all fields');
      return;
    }
    try {
      setLoading(true);
      await fetch(`${API_URL}/admin/send-message`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(messageForm)
      });
      showMessage('success', 'Message sent');
      setMessageForm({ userId: '', subject: '', message: '', priority: 'normal' });
      fetchSentMessages();
    } catch (err) {
      showMessage('error', 'Failed to send');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await fetch(`${API_URL}/admin/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showMessage('success', 'Message deleted');
      fetchSentMessages();
    } catch (err) {
      showMessage('error', 'Failed to delete');
    }
  };



  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  useEffect(() => {
    if (activeTab === 'dashboard') fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'messages') fetchSentMessages();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            {/* <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Admin Dashboard</h1> */}
            <p className="relative text-1xl text-m text-slate-500">Manage users, invites, and communications</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            <button
                onClick={() => navigate("/messages")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg mr-10"
              >
                View Messages
              </button>
          </div>
        </div>
      </header>

      {message.text && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg text-white font-medium shadow-lg z-50 ${
          message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {message.text}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2 mb-8 bg-white rounded-lg p-2 shadow-sm border border-slate-200">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'users', label: 'Users' },
            { id: 'search', label: 'Search' },
            { id: 'invite', label: 'Invite' },
            { id: 'promote', label: 'Promote' },
            { id: 'role', label: 'Role' },
            { id: 'messages', label: 'Messages' },
            { id: 'send', label: 'Send Msg' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Dashboard Overview</h2>
            {stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard label="Total Users" value={stats.totalUsers} />
                <StatCard label="Active Users" value={stats.activeUsers} />
                <StatCard label="New Signups (7d)" value={stats.newSignups} />
                <StatCard label="Completed Profiles" value={stats.completedProfiles} />
                <StatCard label="Total Messages" value={stats.totalMessages} />
                <StatCard label="Profile Completion %" value={stats.profileCompletionRate} />
              </div>
            ) : (
              <div className="text-center py-12">Loading...</div>
            )}
          </div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
              {bulkDeleteIds.length > 0 && (
                <button onClick={handleBulkDelete} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
                  Delete {bulkDeleteIds.length}
                </button>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left"><input type="checkbox" onChange={(e) => setBulkDeleteIds(e.target.checked ? allUsers.map(u => u._id) : [])} className="cursor-pointer" /></th>
                    <th className="px-6 py-4 text-left font-bold text-slate-900">Name</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-900">Email</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-900">Phone</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-900">Role</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-900">Status</th>
                    <th className="px-6 py-4 text-left font-bold text-slate-900">Profile</th>
                    <th className="px-6 py-4 text-right font-bold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {allUsers.map(user => (
                    <React.Fragment key={user._id}>
                      <tr className="hover:bg-blue-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={bulkDeleteIds.includes(user._id)}
                            onChange={(e) => setBulkDeleteIds(e.target.checked ? [...bulkDeleteIds, user._id] : bulkDeleteIds.filter(id => id !== user._id))}
                            className="cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{user.phone}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.profileCompleted ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {user.profileCompleted ? 'Complete' : 'Incomplete'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => setExpandedUserId(expandedUserId === user._id ? null : user._id)} className="text-blue-600 hover:text-blue-800">
                            <ChevronDown className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                      {expandedUserId === user._id && (
                        <tr className="bg-blue-50">
                          <td colSpan="7" className="px-6 py-6">
                            <div className="space-y-3">
                              <p className="text-sm"><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                              {user.profile && <p className="text-sm"><strong>Location:</strong> {user.profile.city}, {user.profile.country}</p>}
                              {user.profile && <p className="text-sm"><strong>Skills:</strong> {user.profile.skills.join(", ") || 0}</p>}
                              {user?.profile?.experience?.length > 0 && (
                                <p className="text-sm">
                                  <strong>Experience:</strong>{" "}
                                  {user.profile.experience
                                    .map(exp => exp.title)
                                    .filter(Boolean)
                                    .join(", ")}
                                </p>
                              )}
                              <div className="flex gap-2 flex-wrap">
                                <button onClick={() => handleToggleStatus(user._id)} className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm">Toggle Status</button>
                                <button onClick={() => setDeleteConfirm(user._id)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">Delete</button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SEARCH */}
        {activeTab === 'search' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Search Users</h2>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-slate-200">
              <div className="relative">
                <Search className="absolute left-4 top-3 w-5 h-5 text-slate-400" />
                <input type="text" placeholder="Search by name or email..." value={searchQuery} onChange={handleSearch} className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map(user => (
                  <div key={user._id} className="bg-white rounded-lg shadow-lg p-6 border border-slate-200">
                    {user.profilePicture && <img src={user.profilePicture} alt={user.name} className="w-16 h-16 rounded-full mb-4 object-cover border-2 border-blue-500" />}
                    <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
                    <p className="text-sm text-slate-600">{user.email}</p>
                    <p className="text-sm text-slate-600 mt-2 italic">{user.headline || 'No headline'}</p>
                    <div className="mt-4 flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>{user.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* INVITE */}
        {activeTab === 'invite' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Create Admin Invite</h2>
            <div className="bg-white rounded-lg shadow-lg p-8 border border-slate-200 space-y-6">
              <input type="email" placeholder="Email (optional)" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              <button onClick={handleCreateInvite} disabled={loading} className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50">
                {loading ? 'Creating...' : 'Generate Link'}
              </button>
              {inviteLink && (
                <div className="mt-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200 space-y-4">
                  <h3 className="font-bold text-slate-900">Link Generated Successfully</h3>
                  <div className="flex items-center gap-2 bg-white p-3 rounded border border-slate-300">
                    <input type="text" value={inviteLink} readOnly className="flex-1 bg-transparent text-sm font-mono" />
                    <button onClick={() => copyToClipboard(inviteLink)} className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  {copiedId && <p className="text-xs text-green-600">✓ Copied to clipboard!</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROMOTE */}
        {activeTab === 'promote' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Promote User to Admin</h2>
            <div className="bg-white rounded-lg shadow-lg p-8 border border-slate-200 space-y-6">
              <input type="email" placeholder="User email" value={promoteEmail} onChange={(e) => setPromoteEmail(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
              <button onClick={handlePromoteUser} disabled={loading} className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold disabled:opacity-50">
                {loading ? 'Promoting...' : 'Promote to Admin'}
              </button>
            </div>
          </div>
        )}

        {/* ROLE */}
        {activeTab === 'role' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Update User Role</h2>
            <div className="bg-white rounded-lg shadow-lg p-8 border border-slate-200 space-y-6">
              <select value={selectedUserIdForRole} onChange={(e) => setSelectedUserIdForRole(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="">Choose user...</option>
                {allUsers.map(u => <option key={u._id} value={u._id}>{u.name} - {u.email}</option>)}
              </select>
              <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={handleUpdateRole} disabled={loading} className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold disabled:opacity-50">
                {loading ? 'Updating...' : 'Update Role'}
              </button>
            </div>
          </div>
        )}

        {/* MESSAGES */}
        {activeTab === 'messages' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Sent Messages</h2>
            <p className="text-1xl font-bold text-slate-900 mb-6">Deleting messages, will delete from user side also.</p>
            {sentMessages.length > 0 ? (
              <div className="space-y-4">
                {sentMessages.map(msg => (
                  <div key={msg._id} className="bg-white rounded-lg shadow p-6 border border-slate-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900">{msg.subject}</h3>
                        <p className="text-sm text-slate-600">To: {msg.recipient?.name || 'Unknown'}</p>
                        <p className="text-sm text-slate-700 mt-2">{msg.message.substring(0, 100)}...</p>
                        <p className="text-xs text-slate-500 mt-2">{new Date(msg.sentAt).toLocaleString()}</p>
                      </div>
                      <button onClick={() => handleDeleteMessage(msg._id)} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm whitespace-nowrap ml-2">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">No messages sent yet</div>
            )}
          </div>
        )}

        {/* SEND MESSAGE */}
        {activeTab === 'send' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Send Message to User</h2>
            <div className="bg-white rounded-lg shadow-lg p-8 border border-slate-200 space-y-6">
              <select value={messageForm.userId} onChange={(e) => setMessageForm({...messageForm, userId: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500">
                <option value="">Select user...</option>
                {allUsers.map(u => <option key={u._id} value={u._id}>{u.name} - {u.email}</option>)}
              </select>
              <input type="text" placeholder="Subject" value={messageForm.subject} onChange={(e) => setMessageForm({...messageForm, subject: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              <textarea placeholder="Message" rows="4" value={messageForm.message} onChange={(e) => setMessageForm({...messageForm, message: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500" />
              <select value={messageForm.priority} onChange={(e) => setMessageForm({...messageForm, priority: e.target.value})} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500">
                <option value="normal">Normal Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
              <button onClick={handleSendMessage} disabled={loading} className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Delete User?</h3>
            <p className="text-slate-600 mb-6">This action cannot be undone. All associated data will be deleted.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300">Cancel</button>
              <button onClick={() => handleDeleteUser(deleteConfirm)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200">
      <p className="text-slate-600 text-sm font-medium">{label}</p>
      <p className="text-4xl font-bold text-blue-600 mt-2">{value}</p>
    </div>
  );
}