import http from 'k6/http';
import { sleep, check } from 'k6';
import { SharedArray } from 'k6/data';
import { stagesConcurrencia } from './stages.js';

const datosCsv = new SharedArray('datos_usuarios', function () {
  const fileContent = open('C:/Estudio/GeneradorArchivos/datos_update.csv');

  return fileContent.split('\n').slice(1).map((line) => {
      if (line.trim() === '') return null;
      const parts = line.split(',');
      return {
          firstname: parts[0],
          lastname: parts[1]
      };
  }).filter(item => item !== null);
});

export const options = {
    stages: stagesConcurrencia,
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
  },
};

export function setup() {
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

    return { authToken: token };
}

export default function (data) {
  const usuarioActual = datosCsv[__ITER % datosCsv.length];

  let urlPatch = 'https://restful-booker.herokuapp.com/booking/2';

  const payload = JSON.stringify({
        firstname : usuarioActual.firstname,
        lastname : usuarioActual.lastname
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
//http://127.0.0.1:5665