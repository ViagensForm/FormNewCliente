window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formulario');
  const qtdInput = document.getElementById('qtd-passageiros');
  const anexosContainer = document.getElementById('anexos-passageiros');

  // Máscaras de telefone e CEP (inalteradas)
  const telefoneInput = document.getElementById('telefone');
  const cepInput      = document.getElementById('cep');

  telefoneInput.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').slice(0,11);
    if (v.length > 10) {
      v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    } else if (v.length > 5) {
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    } else if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else {
      v = v.replace(/^(\d*)/, '($1');
    }
    e.target.value = v;
  });

  cepInput.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '').slice(0,8);
    if (v.length > 5) {
      v = v.replace(/^(\d{5})(\d{1,3}).*/, '$1-$2');
    }
    e.target.value = v;
  });

  // Cria dinamicamente campos de upload, agora usando attachments[] para permitir múltiplos
  function criarCamposArquivos(qtd) {
    anexosContainer.innerHTML = '';
    for (let i = 1; i <= qtd; i++) {
      let storedFiles = [];
      const label = document.createElement('label');
      label.textContent = `Passageiro ${i}:`;

      const uploadDiv = document.createElement('div');
      uploadDiv.className = 'upload-area';

      const inputFile = document.createElement('input');
      inputFile.type = 'file';
      inputFile.multiple = true;
      inputFile.name = 'attachments[]';            // <- array de arquivos
      inputFile.accept = 'image/*,application/pdf';
      inputFile.style.display = 'none';

      const filePreview = document.createElement('div');
      filePreview.className = 'file-preview';

      const uploadText = document.createElement('div');
      uploadText.textContent = 'Arraste ou clique para anexar arquivos';

      uploadDiv.append(uploadText, inputFile, filePreview);

      // Interações de clique / drag & drop
      uploadDiv.addEventListener('click', () => inputFile.click());
      uploadDiv.addEventListener('dragover', e => {
        e.preventDefault();
        uploadDiv.classList.add('dragover');
      });
      uploadDiv.addEventListener('dragleave', () => {
        uploadDiv.classList.remove('dragover');
      });
      uploadDiv.addEventListener('drop', e => {
        e.preventDefault();
        uploadDiv.classList.remove('dragover');
        [...e.dataTransfer.files].forEach(f => {
          if (!storedFiles.some(sf => sf.name === f.name && sf.size === f.size)) {
            storedFiles.push(f);
          }
        });
        updateInputFiles();
      });
      inputFile.addEventListener('change', () => {
        [...inputFile.files].forEach(f => {
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
              storedFiles = storedFiles.filter(sf =>
                !(sf.name === file.name && sf.size === file.size)
              );
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

  criarCamposArquivos(1);
  qtdInput.addEventListener('change', () => {
    let v = parseInt(qtdInput.value, 10);
    if (isNaN(v) || v < 1) v = 1;
    if (v > 30) v = 30;
    qtdInput.value = v;
    criarCamposArquivos(v);
  });

  // Intercepta o submit, envia por fetch e mostra só um alert (sem redirecionar)
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const fd = new FormData(form);

    fetch(form.action, {
      method: 'POST',
      body: fd,
      // por padrão o fetch segue redirect, mas não muda a URL da página
    })
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then(() => {
      alert('Formulário enviado com sucesso!');
      form.reset();
      criarCamposArquivos(1);
    })
    .catch(err => {
      console.error(err);
      alert('Falha ao enviar: ' + err.message);
    });
  });
});
