import http from 'k6/http';
import {sleep} from 'k6';


export const options = {
    VUS: 10,
    duration: '10s'
}

export default function(){
    const url = 'https://reqres.in/api/users';
    const payload = JSON.stringify({
        name: "morpheus",
        job: "leader"
    })

    const params = {
        headers: {
            'Content-Type': 'application/json'
        }
    }
    let response = http.post('https://reqres.in/api/users', payload, params)
}