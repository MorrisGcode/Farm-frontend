import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CalfManagement = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [calves, setCalves] = useState([]);
  const [form, setForm] = useState({
    ear_tag_number: '',
    date_of_birth: '',
    gender: '',
    weight_at_birth: '',
    dam: '',
    sire: '',
    is_weaned: false,
    notes: ''
  });
  const [cows, setCows] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Fetch cows and calves
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const cowsRes = await axios.get('http://127.0.0.1:8000/api/cows/', config);
        setCows(cowsRes.data);
        const calvesRes = await axios.get('http://127.0.0.1:8000/api/calves/', config);
        console.log(calvesRes.data);
        setCalves(calvesRes.data);
      } catch {
        setError('Failed to load data');
      }
    };
    fetchData();
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setForm({
      ear_tag_number: '',
      date_of_birth: '',
      gender: '',
      weight_at_birth: '',
      dam: '',
      sire: '',
      is_weaned: false,
      notes: ''
    });
    setEditingId(null);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (editingId) {
        await axios.put(`http://127.0.0.1:8000/api/calves/${editingId}/`, form, config);
        setSuccess('Calf record updated!');
      } else {
        console.log(form);
        await axios.post('http://127.0.0.1:8000/api/calves/', form, config);
        setSuccess('Calf record added!');
      }
      resetForm();
      // Refresh calves
      const calvesRes = await axios.get('http://127.0.0.1:8000/api/calves/', config);
      setCalves(calvesRes.data);
    } catch {
      setError('Failed to submit calf record');
    }
  };

  const handleEdit = calf => {
    setEditingId(calf.id);
    setForm({
      ear_tag_number: calf.ear_tag_number,
      date_of_birth: calf.date_of_birth,
      gender: calf.gender,
      weight_at_birth: calf.weight_at_birth || '',
      dam: calf.dam || '',
      sire: calf.sire || '',
      is_weaned: calf.is_weaned,
      notes: calf.notes || ''
    });
    setError('');
    setSuccess('');
  };

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this calf record?')) return;
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://127.0.0.1:8000/api/calves/${id}/`, config);
      setSuccess('Calf record deleted!');
      // Refresh calves
      const calvesRes = await axios.get('http://127.0.0.1:8000/api/calves/', config);
      setCalves(calvesRes.data);
      if (editingId === id) resetForm();
    } catch {
      setError('Failed to delete calf record');
    }
  };

  if (user.role !== 'MANAGER') {
    return (
      <div className="text-center text-red-600 mt-8">
        You do not have permission to manage calves.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">{editingId ? 'Edit Calf Record' : 'Add New Calf'}</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}

      {/* Add/Edit Calf Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Ear Tag Number</label>
          <input
            type="text"
            name="ear_tag_number"
            value={form.ear_tag_number}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
            placeholder="Calf ear tag number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <input
            type="date"
            name="date_of_birth"
            value={form.date_of_birth}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          >
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Weight at Birth</label>
          <input
            type="number"
            name="weight_at_birth"
            value={form.weight_at_birth}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
            placeholder="Weight in kg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Dam (Mother Cow)</label>
          <select
            name="dam"
            value={form.dam}
            onChange={handleChange}
            required
            className="border p-2 rounded w-full"
          >
            <option value="">Select Dam</option>
            {cows.map(cow => (
              <option key={cow.id} value={cow.id}>{cow.name} ({cow.ear_tag_number})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Sire (Father Bull)</label>
          <input
            type="text"
            name="sire"
            value={form.sire}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            placeholder="Sire name or tag"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_weaned"
            checked={form.is_weaned}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700">
            Is Weaned
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="border p-2 rounded w-full"
            rows={2}
            placeholder="Any additional notes"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editingId ? 'Update Calf' : 'Add Calf'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Calves Table */}
      <h3 className="text-xl font-bold mb-3 mt-8">Existing Calves</h3>
      {calves.length === 0 ? (
        <p>No calves found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4 border-b">Ear Tag Number</th>
                <th className="py-2 px-4 border-b">Date of Birth</th>
                <th className="py-2 px-4 border-b">Gender</th>
                <th className="py-2 px-4 border-b">Weight at Birth</th>
                <th className="py-2 px-4 border-b">Dam</th>
                <th className="py-2 px-4 border-b">Sire</th>
                <th className="py-2 px-4 border-b">Is Weaned</th>
                <th className="py-2 px-4 border-b">Notes</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {calves.map(calf => (
                <tr key={calf.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-4">{calf.ear_tag_number}</td>
                  <td className="py-2 px-4">{calf.date_of_birth}</td>
                  <td className="py-2 px-4">{calf.gender}</td>
                  <td className="py-2 px-4">{calf.weight_at_birth} kg</td>
                  <td className="py-2 px-4">{calf.dam_name || calf.dam}</td>
                  <td className="py-2 px-4">{calf.sire_name || calf.sire}</td>
                  <td className="py-2 px-4 text-center">
                    {calf.is_weaned ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-red-600">No</span>
                    )}
                  </td>
                  <td className="py-2 px-4">{calf.notes || 'N/A'}</td>
                  <td className="py-2 px-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(calf)}
                      className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(calf.id)}
                      className="px-3 py-1 text-xs font-medium text-red-600 bg-red-100 rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CalfManagement;