var form = document.getElementById('form-tarefas');
var campo = document.getElementById('campo');

//forca um carregamento das tarefas ao iniciar a janela
window.onload = loadTasks;

//EventListener para inserir a tarefa ao enviar o formulario
document.querySelector("form").addEventListener("submit", e => {
  //prevent default impede que o formulario seja enviado, a intencao eh impedir o reload da pagina
  e.preventDefault();
  addTask();
});

/* FUNCAO PARA CARREGAR AS TAREFAS, CASO EXISTA UMA TAREFA NO ARMAZENAMENTO INTERNO DO NAVEGADOR*/
function loadTasks() {
  //Fazemos primeiro uma verificação para entender se existem tarefas criadas no localStorage
  //Se nao houver tarefas, terminamos a execucao da rotina
  if (localStorage.getItem("tasks") == null) return;

  // Se existe pelo menos uma tarefa, buscamos a informacao no Local Storage e atribuimos este ou mais valores ao array
  let tasks = Array.from(JSON.parse(localStorage.getItem("tasks")));

  //varremoos o array que foi criado com infos vindo do LocalStorage e adicionamos os elementos a lista
  tasks.forEach(task => {
    const list = document.querySelector("ul");
    const li = document.createElement("li");
    li.innerHTML = `<input type="checkbox" onclick="taskComplete(this)" class="check" ${task.completed ? 'checked' : ''}>
      <input type="text" value="${task.task}" class="task ${task.completed ? 'completed' : ''}" onfocus="getCurrentTask(this)" onblur="editTask(this)">
      <i class="fa fa-trash" onclick="removeTask(this)"></i>`;
    list.insertBefore(li, list.children[0]);
  });
}

/* FUNCAO PARA ADICIONAR UMA TAREFA*/
function addTask() {
  const task = document.querySelector("form input");
  const list = document.querySelector("ul");
  //Teste para previnir a criacao de tarefas com campo vazio
  if (task.value === "") {
    Swal.fire({
      title: "<i>Opss... &#128027;</i>", 
      html: "Erro ao criar tarefa: <b>O campo estava vazio!</b>",  
      confirmButtonText: "Ok", 
    });
    return false;
  }
  //Verificacao simples para previnir tarefas duplicadas
  if (document.querySelector(`input[value="${task.value}"]`)) {
    Swal.fire({
      title: "<i>Uhmm... </i>&#129320;", 
      html: "Erro ao criar tarefa: <b>Parece que essa tarefa já existe!</b>",  
      confirmButtonText: "Ok", 
    });
    task.value = "";
    return false;
  }

  //Ao passar pelos testes, temos um dado integro para armazenarmos no Local Storage, a linha abaixo realiza esta operacao 
  localStorage.setItem("tasks", JSON.stringify([...JSON.parse(localStorage.getItem("tasks") || "[]"), { task: task.value, completed: false }]));

  //Estrutura para inserir a tarefa na lista de tarefas, alem de vincular este novo elemento ao <ul> e operar o "DOM" com o InnerHTML
  const li = document.createElement("li");
  li.innerHTML = `<input type="checkbox" onclick="taskComplete(this)" class="check">
  <input type="text" value="${task.value}" class="task" onfocus="getCurrentTask(this)" onblur="editTask(this)">
  <i class="fa fa-trash" onclick="removeTask(this)"></i>`;
  list.insertBefore(li, list.children[0]);
  //Por fim, ao criar a tarefa, limpamos o campo para nao confundir o usuario
  task.value = "";
}

/* FUNCAO PARA MARCAR UMA TAREFA COMO CONCLUIDA, E MANTER ESTE ESTADO NO LOCAL STORAGE*/
function taskComplete(event) {
  let tasks = Array.from(JSON.parse(localStorage.getItem("tasks")));
  tasks.forEach(task => {
    if (task.task === event.nextElementSibling.value) {
      task.completed = !task.completed;
    }
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
  event.nextElementSibling.classList.toggle("completed");
}

/* FUNCAO PARA REMOVER UMA TAREFA CONCLUIDA OU NAO, E REMOVER TAMBEM DO LOCAL STORAGE*/
function removeTask(event) {
  let tasks = Array.from(JSON.parse(localStorage.getItem("tasks")));
  tasks.forEach(task => {
    if (task.task === event.parentNode.children[1].value) {
      /*DELETE DA TAREFA -> [O metodo *splice* permite que um elemento seja removido ou substituido em um array, 
      * aqui foi escolhido o elemento com o indice no primeiro parametro(x) .splice(x, y), e a quantidade de elementos a serem
      * removidos apos ele no segundo parametro(y), que no nosso caso eh apenas um elemento, ele mesmo, mas poderia ser outro valor
      * o elemento eh removido e eh gerado um "novo" array, puxando os demais elementos do array para "cima"] */
      tasks.splice(tasks.indexOf(task), 1);
    }
  });
  //as linhas abaixo selecionam o item e o removem do local storage
  localStorage.setItem("tasks", JSON.stringify(tasks));
  event.parentElement.remove();
}

//Armazena a tarefa atual para rastrear as mudanças
var currentTask = null;

//FUNCAO PARA OBTER A TAREFA DO CONTEXTO ATUAL (contexto, leia-se, o item que o usuario esta apontando)
function getCurrentTask(event) {
  currentTask = event.value;
}

//FUNCAO PARA EDITAR A TAREFA E MANTER AS MUDANCAS NO LOCAL STORAGE
function editTask(event) {
  let tasks = Array.from(JSON.parse(localStorage.getItem("tasks")));
  //Protecao para nao permitir que a tarefa fique com rotulo vazio
  if (event.value === "") {
    Swal.fire({
      title: "<i>Erro</i> &#129417", 
      html: "Falha ao editar tarefa: <b>O rótulo não deve ficar vazio.</b>",  
      confirmButtonText: "Ok", 
    });
    event.value = currentTask;
    return;
  }
  
  //Verificacao simples para previnir tarefas duplicadas
  if (document.querySelector(`input[value="${task.value}"]`)) {
    Swal.fire({
      title: "<i>Uhmm... </i>&#129320;", 
      html: "Erro ao editar tarefa: <b>Parece que essa tarefa já existe!</b>",  
      confirmButtonText: "Ok", 
    });
    task.value = "";
    return false;
  }
  
  //Retorno ao editar a tarefa mantendo o mesmo rótulo...
  tasks.forEach(task => {
    if (task.task === event.value) {
      Swal.fire({
        title: "<i>Cri, cri...</i> &#129431", 
        html: "Inalterado: <b>Não foram feitas alterações.</b>",  
        confirmButtonText: "Ok", 
      });
      event.value = currentTask;
      return;
    }
  });
  //Aqui atualizamos as tarefas modificadas, para que o array esteja sempre atualizado com as ultimas mudancas
  tasks.forEach(task => {
    if (task.task === currentTask) {
      task.task = event.value;
    }
  });
  //Apos todas as verificacoes, temos um dado integro para atualizar nosso armazenamento local
  localStorage.setItem("tasks", JSON.stringify(tasks));
}
