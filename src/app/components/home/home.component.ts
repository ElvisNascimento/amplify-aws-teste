import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { get, post, del, put } from 'aws-amplify/api';
import { v4 as uuidv4 } from 'uuid';
import { DataStore } from '@aws-amplify/datastore';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  formAdd: FormGroup;
  formEdit: FormGroup;
  resp: any;
  filteredResp: any = [];
  displayAddDialog: boolean = false;
  displayEditDialog: boolean = false;
  currentItem: any;
  selectedItem: any;

  constructor(private fb: FormBuilder) {
    this.formAdd = this.fb.group({
      inputNome: ['', Validators.required],
      inputDescricao: ['', Validators.required]
    });

    this.formEdit = this.fb.group({
      inputNome: ['', Validators.required],
      inputDescricao: ['', Validators.required]
    });
  }

  async ngOnInit() {
    await this.getTodo();
  }

  showAddDialog() {
    this.formAdd.reset(); // Reseta o formulário de adição
    this.displayAddDialog = true;
  }

  hideAddDialog() {
    this.displayAddDialog = false;
  }

  showEditDialog(itemId: string) {
    // Verifica se filteredResp está definido e não é nulo
    if (!this.filteredResp) {
      console.error('filteredResp está indefinido');
      return;
    }

    // Encontra o item selecionado
    this.selectedItem = this.filteredResp.find((item: { id: string; }) => item.id === itemId);

    if (this.selectedItem) {
      // Atualiza o formulário de edição com os valores do item
      this.formEdit.patchValue({
        inputNome: this.selectedItem.nome,
        inputDescricao: this.selectedItem.descricao
      });
      this.displayEditDialog = true;
    } else {
      console.error('Item com o ID fornecido não foi encontrado.');
    }
  }

  hideEditDialog() {
    this.displayEditDialog = false;
  }

  addItem() {
    const id = uuidv4();
    const nome = this.formAdd.get('inputNome')?.value;
    const descricao = this.formAdd.get('inputDescricao')?.value;
    this.post(id, nome, descricao);
  }

  async post(id: string, nome: string, descricao: string) {
    try {
      const restOperation = post({
        apiName: 'apiatlanta',
        path: '/produtos',
        options: { body: { id, nome, descricao } }
      });
      const response = await restOperation.response;
      console.log('POST call succeeded: ', await response.body.json());
      await this.getTodo();
      this.hideAddDialog();
    } catch (e: any) {
      console.log('POST call failed: ', JSON.parse(e.response.body));
    }
  }

  editItem() {
    if (this.selectedItem) {

      const index = this.filteredResp.findIndex((item: { id: any; }) => item.id === this.selectedItem.id);
      if (index !== -1) {
        this.filteredResp[index] = { ...this.filteredResp[index], ...this.formEdit.value };
      }
      console.log("nome", this.formEdit.value.inputNome);
      console.log("descricao", this.formEdit.value.inputDescricao);

      this.put(this.selectedItem.id, this.formEdit.value.inputNome, this.formEdit.value.inputDescricao)

      this.hideEditDialog();
    } else {
      console.error('Nenhum item selecionado para editar.');
    }
  }

  async put(id: string, nome: string, descricao: string) {
    try {
      const restOperation = put({
        apiName: 'apiatlanta',
        path: `/produtos/${id}`,
        options: { body: { id, nome, descricao } }
      });

      const response = await restOperation.response;


      if (response.statusCode !== 200) {
        throw new Error(`Erro ao atualizar item: ${response.headers}`);
      }
      console.log('PUT call succeeded: ', await response.body.json());
      await this.getTodo();
      this.hideEditDialog();
    } catch (e: any) {
      console.log(e.response.statusCode);
      console.log('PUT call failed: ', e);
    }
  }

  async getTodo() {
    try {
      const restOperation = get({
        apiName: 'apiatlanta',
        path: '/produtos'
      });
      const response = await restOperation.response;
      const data = await response.body.json();
      this.resp = data;
      this.filteredResp = data;
      // console.log('GET call succeeded: ', this.resp);
    } catch (e: any) {
      console.log('GET call failed: ', JSON.parse(e.response.body));
    }
  }

  async deleteItem(id: string) {
    try {      
      const restOperation = del({
        apiName: 'apiatlanta',
        path: `/produtos/${id}`
      });
      await restOperation.response;

      await this.getTodo();

      console.log('DELETE call succeeded');
    } catch (e:any) {
      console.log('DELETE call failed: ', e.response.body);
    }
  }
  performSearch(event: any) {
    const searchValue = event.target.value.toLowerCase();
    this.filteredResp = this.resp.filter((item: any) => {
      return Object.values(item).some((val: any) => {
        return val !== null && val !== undefined && val.toString().toLowerCase().includes(searchValue);
      });
    });
  }  
}
