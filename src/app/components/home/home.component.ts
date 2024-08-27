import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms'; // Importe FormBuilder e FormGroup
import { get, post, del } from 'aws-amplify/api';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  form: FormGroup; // Defina uma variável para o FormGroup
  resp: any;

  constructor(private fb: FormBuilder) { // Injete o FormBuilder no construtor
    this.form = this.fb.group({
      inputNome: ['', Validators.required],
      inputDescricao: ['', Validators.required]
    });
  }

 async ngOnInit() {
    await this.getTodo();
  }

  onSubmit() {
    const id = uuidv4(); // Gera um UUID
    const nome = this.form.get('inputNome')?.value; // Obtém o valor do campo inputData
    const descricao = this.form.get('inputDescricao')?.value; // Obtém o valor do campo inputData
    this.post(id, nome,descricao);
  }

  async post(id: string, nome: string,descricao: string) {
    try {
      const restOperation = post({
        apiName: 'api314e2654',
        path: '/items',
        options: {
          body: { id, nome,descricao }
        }
      });
      const response = await restOperation.response;
      console.log('POST call succeeded: ', await response.body.json());
      await this.getTodo()
    } catch (e: any) {
      console.log('POST call failed: ', JSON.parse(e.response.body));
    }
  }

  async getTodo() {
    try {
      const restOperation = get({
        apiName: 'api314e2654',
        path: '/items'
      });
      const response = await restOperation.response;
      const data = await response.body.json();
      this.resp = data;
      console.log('GET call succeeded: ', this.resp);
    } catch (e: any) {
      console.log('GET call failed: ', JSON.parse(e.response.body));
    }
  }

  async getOneTodo(id: string) {
    try {
      const restOperation = get({
        apiName: 'api314e2654',
        path: `/items/${id}`
      });
      const response = await restOperation.response;
      const data = await response.body.json();
      this.resp = data;
      console.log('GET ONE call succeeded: ', this.resp);
    } catch (e: any) {
      console.log('GET call failed: ', JSON.parse(e.response.body));
    }
  }

  async deleteItem(id: string) {
    try {
      const restOperation = del({
        apiName: 'api314e2654',
        path: `/items/${id}`
      });
      await restOperation.response;
      console.log('DELETE call succeeded for id: ', id);
      this.getTodo(); // Atualiza a lista após a exclusão do item
    } catch (e: any) {
      console.log('DELETE call failed: ', JSON.parse(e.response.body));
    }
  }
}
