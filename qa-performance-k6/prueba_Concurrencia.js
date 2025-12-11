import http from 'k6/http';
import {sleep, check} from 'k6';
import {stagesConcurrencia} from './stages.js';

export const options={
    stages: stagesConcurrencia,

    thresholds: {
        http_req_duration: ['p(95)<500'], // El 95% de las peticiones deben ser mas rápidas que 500ms
        http_req_failed: ['rate<0.01'],   // Menos del 1% de errores permitidos
  },
};

export function setup(){
    const url = 'https://restful-booker.herokuapp.com/auth';
    const payload = JSON.stringify({
        username: 'admin',
        password: 'password123',
    })

    const params = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    let response = http.post(url, payload, params)
    if (response.status !== 200) {
        throw new Error('Error en el Login del Setup');
      }

      const token = response.json().token;
      console.log("/////////////////////////////////////////////////");
      console.log(`Token de autenticación obtenido: ${token}`);
      console.log("/////////////////////////////////////////////////");

      return { authToken: token };
}

export default function (data) {

  let urlPatch = 'https://restful-booker.herokuapp.com/booking/1';

  const payload = JSON.stringify({
        firstname : "James007",
        lastname : "Bond"
    });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cookie': `token=${data.authToken}`,
    },
  };

  let res = http.patch(urlPatch, payload, params);

  check(res, {
    'Status es 200': (r) => r.status === 200,
  });

  sleep(1);
}