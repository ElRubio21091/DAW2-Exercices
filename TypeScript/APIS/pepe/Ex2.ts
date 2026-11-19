// 1. Obtener las referencias del DOM (con su tipado)
const divOrigen = document.getElementById('origen') as HTMLDivElement;
const btnCopiar = document.getElementById('btnCopiar') as HTMLButtonElement;
const btnPegar = document.getElementById('btnPegar') as HTMLButtonElement;
const txtDestino = document.getElementById('destino') as HTMLTextAreaElement;

// 2. Lógica para COPIAR
btnCopiar.addEventListener('click', async () => {
    try {
        // Extraemos solo el texto del div
        const textoACopiar = divOrigen.innerText;
        
        // Escribimos en el portapapeles
        await navigator.clipboard.writeText(textoACopiar);
        
        // Verificación visual o por consola
        btnCopiar.innerText = "¡Copiado!";
        setTimeout(() => btnCopiar.innerText = "Copiar contenido", 2000);
    } catch (err) {
        console.error('Error al intentar copiar:', err);
    }
});

// 3. Lógica para PEGAR
btnPegar.addEventListener('click', async () => {
    try {
        // Leemos lo que haya en el portapapeles del sistema
        const textoPegado = await navigator.clipboard.readText();
        
        // Lo insertamos en el textarea
        txtDestino.value = textoPegado;
        
    } catch (err) {
        console.error('Error al intentar pegar (quizás faltan permisos):', err);
    }
});