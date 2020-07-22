import axios from 'axios';

//Define a URL base da origem para consumo do servico
//https://grades-api-erbano.herokuapp.com/
//'http://localhost:8000/

export default axios.create({
  baseURL: 'https://perfinper-api.herokuapp.com/',
  headers: {
    'Content-type': 'application/json',
  },
});
