import axios from 'axios';

//Define a URL base da origem para consumo do servico
// 'https://grades-api-erbano.herokuapp.com/'
// 'http://localhost:8000/'
// 'https://perfinper-api.herokuapp.com/'

export default axios.create({
  baseURL: 'http://localhost:3001/',
  headers: {
    'Content-type': 'application/json',
  },
});
