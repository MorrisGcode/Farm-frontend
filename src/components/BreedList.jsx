import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BreedList = () => {
  const [breeds, setBreeds] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBreeds();
  }, []);

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

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:8000/api/breeds/', { name, description }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setName('');
      setDescription('');
      fetchBreeds();
    } catch {
      setError('Failed to add breed');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-4">Breed Management</h2>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Breed Name"
          required
          className="border p-2 rounded flex-1"
        />
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Description"
          className="border p-2 rounded flex-1"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Add</button>
      </form>
      <ul>
        {breeds.map(breed => (
          <li key={breed.id} className="border-b py-2">
            <span className="font-semibold">{breed.name}</span>
            {breed.description && <span className="text-gray-600"> - {breed.description}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BreedList;