import axios from 'axios';

const clientService = axios.create({
  baseURL: '/api'
})

export default clientService;
