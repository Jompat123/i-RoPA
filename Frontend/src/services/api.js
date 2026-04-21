const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const api = {
  async login(email, password) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async getUsers(token) {
    const res = await fetch(`${API_URL}/api/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async getDepartments(token) {
    const res = await fetch(`${API_URL}/api/departments`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async getRopa(token, filter = '') {
    const res = await fetch(`${API_URL}/api/ropa${filter}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async getRopaById(token, id) {
    const res = await fetch(`${API_URL}/api/ropa/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async createRopa(token, data) {
    const res = await fetch(`${API_URL}/api/ropa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateRopa(token, id, data) {
    const res = await fetch(`${API_URL}/api/ropa/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteRopa(token, id) {
    const res = await fetch(`${API_URL}/api/ropa/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async getDashboard(token) {
    const res = await fetch(`${API_URL}/api/dashboard/summary`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async createUser(token, data) {
    const res = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async createDepartment(token, data) {
    const res = await fetch(`${API_URL}/api/departments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};