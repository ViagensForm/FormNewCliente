// script.js

window.addEventListener('DOMContentLoaded', () => {
  const form            = document.getElementById('formulario');
  const loader          = document.getElementById('loader-overlay');
  const modal           = document.getElementById('modal');
  const okBtn           = document.getElementById('modal-ok');
  const qtdInput        = document.getElementById('qtd-passageiros');
  const anexosContainer = document.getElementById('anexos-passageiros');
  const telefoneInput   = document.getElementById('telefone');
  const cepInput        = document.getElementById('cep');

  // garante que loader e modal comecem ocultos
  loader.style.display = 'none';
  modal.style.display  = 'none';

  // máscara de telefone
  telefoneInput.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 11);
    if      (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    else if (v.length >  5) v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    else if (v.length >  2) v = v.replace(/^(\d{2})(\d{0,5})/,           '($1) $2');
    else                     v = v.replace(/^(\d*)/,                    '($1');
    e.target.value = v;
  });

  // máscara de CEP
  cepInput.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').slice(0, 8);
    if (v.length > 5) v = v.replace(/^(\d{5})(\d{1,3}).*/, '$1-$2');
    e.target.value = v;
  });

  // gera dinamicamente os campos de upload (com preview, drag/drop etc.)
  function criarCamposArquivos(qtd) {
    anexosContainer.innerHTML = '';
    for (let i = 1; i <= qtd; i++) {
      let storedFiles = [];
      const label     = document.createElement('label');
      label.textContent = `Passageiro ${i}:`;

      const uploadDiv = document.createElement('div');
      uploadDiv.className = 'upload-area';

      const inputFile = document.createElement('input');
      inputFile.type     = 'file';
      inputFile.multiple = true;
      inputFile.accept   = 'image/*,application/pdf';
      inputFile.style.display = 'none';

      const filePreview = document.createElement('div');
      filePreview.className = 'file-preview';

      const uploadText = document.createElement('div');
      uploadText.textContent = 'Arraste ou clique para anexar arquivos';

      uploadDiv.append(uploadText, inputFile, filePreview);

      // abrir seletor
      uploadDiv.addEventListener('click', () => inputFile.click());

      // drag & drop
      uploadDiv.addEventListener('dragover', e => { 
        e.preventDefault(); 
        uploadDiv.classList.add('dragover'); 
      });
      uploadDiv.addEventListener('dragleave', () => uploadDiv.classList.remove('dragover'));
      uploadDiv.addEventListener('drop', e => {
        e.preventDefault();
        uploadDiv.classList.remove('dragover');
        Array.from(e.dataTransfer.files).forEach(f => {
          if (!storedFiles.some(sf => sf.name === f.name && sf.size === f.size)) {
            storedFiles.push(f);
          }
        });
        updateInputFiles();
      });

      // ao selecionar pelo input
      inputFile.addEventListener('change', () => {
        Array.from(inputFile.files).forEach(f => {
          if (!storedFiles.some(sf => sf.name === f.name && sf.size === f.size)) {
            storedFiles.push(f);
          }
        });
        updateInputFiles();
      });

      function updateInputFiles() {
        const dt = new DataTransfer();
        storedFiles.forEach(f => dt.items.add(f));
        inputFile.files = dt.files;
        filePreview.innerHTML = '';

        if (storedFiles.length === 0) {
          uploadText.style.display = 'block';
        } else {
          uploadText.style.display = 'none';
          storedFiles.forEach(file => {
            const item = document.createElement('div');
            item.className = 'file-item';

            if (file.type.startsWith('image/')) {
              const img = document.createElement('img');
              img.src = URL.createObjectURL(file);
              item.appendChild(img);
            } else {
              item.textContent = file.name;
            }

            const btn = document.createElement('button');
            btn.innerHTML = '×';
            btn.onclick = e => {
              e.stopPropagation();
              storedFiles = storedFiles.filter(sf => !(sf.name === file.name && sf.size === file.size));
              updateInputFiles();
            };

            item.appendChild(btn);
            filePreview.appendChild(item);
          });
        }
      }

      anexosContainer.append(label, uploadDiv);
    }
  }

  // inicializa 1 campo
  criarCamposArquivos(1);

  // se mudar quantidade, recria
  qtdInput.addEventListener('change', () => {
    let v = parseInt(qtdInput.value) || 1;
    if (v < 1) v = 1;
    if (v > 30) v = 30;
    qtdInput.value = v;
    criarCamposArquivos(v);
  });

  // intercepta submit para exibir loader e modal
  form.addEventListener('submit', async e => {
    e.preventDefault();
    loader.style.display = 'flex';
    try {
      const res = await fetch(form.action, {
        method: form.method,
        body: new FormData(form)
      });
      loader.style.display = 'none';
      if (!res.ok) throw new Error('Erro no envio');
      modal.style.display = 'flex';
      form.reset();
      criarCamposArquivos(1);
    } catch (err) {
      loader.style.display = 'none';
      alert('Falha ao enviar: ' + err.message);
    }
  });

  // fecha o modal ao clicar OK
  okBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });
});
