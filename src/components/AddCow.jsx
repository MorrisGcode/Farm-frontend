import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddCow = () => {
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    weight: '',
    health_status: 'HEALTHY'
  });
  const [breeds, setBreeds] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8000/api/breeds/', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setBreeds(res.data);
      } catch {
        setError('Failed to load breeds');
      }
    };
    fetchBreeds();
  }, []);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/api/cows/', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      navigate('/dashboard/cows');
    } catch {
      setError('Failed to add cow');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add Cow</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Cow Name"
          required
          className="border p-2 rounded w-full"
        />
        <select
          name="breed"
          value={formData.breed}
          onChange={handleChange}
          required
          className="border p-2 rounded w-full"
        >
          <option value="">Select Breed</option>
          {breeds.map(breed => (
            <option key={breed.id} value={breed.id}>{breed.name}</option>
          ))}
        </select>
        <input
          name="age"
          type="number"
          value={formData.age}
          onChange={handleChange}
          placeholder="Age"
          required
          className="border p-2 rounded w-full"
        />
        <input
          name="weight"
          type="number"
          value={formData.weight}
          onChange={handleChange}
          placeholder="Weight"
          required
          className="border p-2 rounded w-full"
        />
        <select
          name="health_status"
          value={formData.health_status}
          onChange={handleChange}
          required
          className="border p-2 rounded w-full"
        >
          <option value="HEALTHY">Healthy</option>
          <option value="SICK">Sick</option>
          <option value="TREATMENT">Under Treatment</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Cow
        </button>
      </form>
    </div>
  );
};

export default AddCow;