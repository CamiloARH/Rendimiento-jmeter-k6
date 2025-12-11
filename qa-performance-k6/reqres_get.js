import http from 'k6/http';
import {sleep} from 'k6';
import {stagesLoad} from './stages.js';


export const options={
    stages: stagesLoad
};


export default function(){
    let response = http.get('https://reqres.in/api/users?page=2');
    sleep(1); 
}