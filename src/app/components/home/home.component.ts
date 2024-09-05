import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { get, post, del, patch } from 'aws-amplify/api';
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
      inputCor: ['', Validators.required],
      inputMarca: ['', Validators.required],
      inputNumero_Eixos: ['', Validators.required],
      inputPeso: ['', Validators.required],
      inputPreco: ['', Validators.required]
    });

    this.formEdit = this.fb.group({
      editNome: ['', Validators.required],
      editCor: ['', Validators.required],
      editMarca: ['', Validators.required],
      editNumero_Eixos: ['', Validators.required],
      editPeso: ['', Validators.required],
      editPreco: ['', Validators.required]
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
        editNome: this.selectedItem.nome,
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
    const cor = this.formAdd.get('inputCor')?.value;
    const estado = this.formAdd.get('inputEstado')?.value;
    const marca = this.formAdd.get('inputMarca')?.value;
    const numEixos = this.formAdd.get('inputNumEixos')?.value;
    const peso = this.formAdd.get('inputPeso')?.value;
    this.post(id, nome, cor,estado,marca,numEixos,peso);
  }

  async post(id: string, nome: string, cor: string, estado: string, marca: string, numEixos: string, peso: string) {
    try {
      const restOperation = post({
        apiName: 'apiatlanta',
        path: '/produtos',
        options: { body: { id, nome,cor,estado,marca,numEixos,peso } }
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
      // console.log("nome", this.formEdit.value.inputNome);
      // console.log("descricao", this.formEdit.value.inputDescricao);

      this.patch(this.selectedItem.id,
         this.formEdit.value.editNome,
         this.formEdit.value.editCor,
         this.formEdit.value.editEstado,
         this.formEdit.value.editMarca,
         this.formEdit.value.editNumero_de_Eixos,
         this.formEdit.value.editPeso,
         this.formEdit.value.editPreco
        )

      this.hideEditDialog();
    } else {
      console.error('Nenhum item selecionado para editar.');
    }
  }

  async patch(id: string, nome: string, cor: string,marca: string,estado: string,num_eixos: number,peso: number,preco: number) {
    try {
      const restOperation = patch({
        apiName: 'apiatlanta',
        path: `/produtos/${id}`,
        options: { body: { id, nome, cor,marca,estado,num_eixos,peso,preco } }
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
