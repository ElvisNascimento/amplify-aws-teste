import { Component } from '@angular/core';
import { post,get } from 'aws-amplify/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app-amplify';
}

async function postTodo() {
  try {
    const restOperation = post({
      apiName: 'todoApi',
      path: '/todo',
      options: {
        body: {
          message: 'Mow the lawn'
        }
      }
    });

    const { body } = await restOperation.response;
    const response = await body.json();

    console.log('POST call succeeded');
    console.log(response);
  } catch (e:any) {
    console.log('POST call failed: ', JSON.parse(e.response.body));
  }
}
async function getTodo() {
  try {
    const restOperation = get({ 
      apiName: 'todo-api',
      path: '/todo' 
    });
    const response = await restOperation.response;
    console.log('GET call succeeded: ', response);
  } catch (e:any) {
    console.log('GET call failed: ', JSON.parse(e.response.body));
  }
}
