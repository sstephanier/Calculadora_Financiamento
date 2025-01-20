// Adiciona um ouvinte de evento para quando o formulário for enviado
document.getElementById("formularioFinanciamento").addEventListener("submit", function (evento) {
    evento.preventDefault(); // Previne o recarregamento da página ao enviar o formulário

    // Obtém os valores inseridos nos campos do formulário
    const valorImovel = document.getElementById("valorImovel").value;
    const valorEntrada = document.getElementById("valorEntrada").value;
    const sistema = document.getElementById("sistema").value;
    const parcelas = document.getElementById("parcelas").value;
    const taxa = document.getElementById("taxa").value;

    // Verifica se todos os campos foram preenchidos
    if (!valorImovel || !valorEntrada || !sistema || !parcelas || !taxa) {
        alert("Por favor, preencha todos os campos antes de prosseguir.");
        return; // Interrompe a execução se algum campo não for preenchido
    }

    // Converte os valores de string para os tipos adequados para cálculos
    const valorImovelFloat = parseFloat(valorImovel);
    const valorEntradaFloat = parseFloat(valorEntrada);
    const parcelasInt = parseInt(parcelas);
    const taxaFloat = parseFloat(taxa) / 100; // Converte a taxa para valor decimal

    // Valida se os valores são positivos e dentro dos limites
    if (
        valorImovelFloat <= 0 ||
        valorEntradaFloat < 0 ||
        valorEntradaFloat >= valorImovelFloat ||
        parcelasInt <= 0 ||
        taxaFloat <= 0
    ) {
        alert("Por favor, insira valores válidos.");
        return; // Interrompe a execução se algum valor for inválido
    }

    // Calcula o valor financiado, subtraindo a entrada do valor do imóvel
    const valorFinanciado = valorImovelFloat - valorEntradaFloat;
    let resultado = [];

    // Chama a função de cálculo de acordo com o sistema de financiamento selecionado
    if (sistema === "SAC") {
        resultado = calcularSAC(valorFinanciado, parcelasInt, taxaFloat);
    } else if (sistema === "Price") {
        resultado = calcularPrice(valorFinanciado, parcelasInt, taxaFloat);
    } else if (sistema === "SAM") {
        resultado = calcularSAM(valorFinanciado, parcelasInt, taxaFloat);
    } else {
        alert("Selecione um sistema de financiamento válido.");
        return; // Interrompe se o sistema não for válido
    }

    // Salva o valor financiado e o resultado do financiamento no localStorage
    localStorage.setItem("valorFinanciado", valorFinanciado.toFixed(2));
    localStorage.setItem("resultadoFinanciamento", JSON.stringify(resultado));

    // Redireciona o usuário para a página de resultados
    window.location.href = "result.html";
});

// Função que calcula o financiamento utilizando o Sistema de Amortização Constante (SAC)
function calcularSAC(valorFinanciado, parcelas, taxa) {
    const amortizacao = valorFinanciado / parcelas; // Amortização constante
    let saldo = valorFinanciado;
    let resultado = [];

    // Loop para calcular os valores de cada parcela
    for (let i = 1; i <= parcelas; i++) {
        const juros = saldo * taxa; // Juros da parcela
        const parcela = amortizacao + juros; // Parcela total (amortização + juros)
        resultado.push({
            numeroParcela: i,
            amortizacao: amortizacao.toFixed(2),
            juros: juros.toFixed(2),
            parcela: parcela.toFixed(2),
            saldo: (saldo - amortizacao).toFixed(2) // Saldo devedor após a amortização
        });
        saldo -= amortizacao; // Atualiza o saldo devedor
    }

    return resultado; // Retorna o resultado do financiamento
}

// Função que calcula o financiamento utilizando o Sistema Price
function calcularPrice(valorFinanciado, parcelas, taxa) {
    const fator = (taxa * Math.pow(1 + taxa, parcelas)) / (Math.pow(1 + taxa, parcelas) - 1); // Fator de cálculo do valor da parcela
    const parcela = valorFinanciado * fator; // Valor fixo da parcela
    let saldo = valorFinanciado;
    let resultado = [];

    // Loop para calcular os valores de cada parcela
    for (let i = 1; i <= parcelas; i++) {
        const juros = saldo * taxa; // Juros da parcela
        const amortizacao = parcela - juros; // Amortização (parte da parcela que vai para o saldo devedor)
        resultado.push({
            numeroParcela: i,
            amortizacao: amortizacao.toFixed(2),
            juros: juros.toFixed(2),
            parcela: parcela.toFixed(2),
            saldo: (saldo - amortizacao).toFixed(2) // Saldo devedor após amortização
        });
        saldo -= amortizacao; // Atualiza o saldo devedor
    }

    return resultado; // Retorna o resultado do financiamento
}

// Função que calcula o financiamento utilizando o Sistema de Amortização Mista (SAM)
function calcularSAM(valorFinanciado, parcelas, taxa) {
    // Calcula os valores utilizando os sistemas SAC e Price
    const resultadoSAC = calcularSAC(valorFinanciado, parcelas, taxa);
    const resultadoPrice = calcularPrice(valorFinanciado, parcelas, taxa);

    let resultadoSAM = [];

    // Loop para calcular a média de cada valor entre SAC e Price
    for (let i = 0; i < parcelas; i++) {
        const amortizacaoMedia =
            (parseFloat(resultadoSAC[i].amortizacao) + parseFloat(resultadoPrice[i].amortizacao)) / 2;
        const jurosMedia =
            (parseFloat(resultadoSAC[i].juros) + parseFloat(resultadoPrice[i].juros)) / 2;
        const parcelaMedia =
            (parseFloat(resultadoSAC[i].parcela) + parseFloat(resultadoPrice[i].parcela)) / 2;

        // Calcula o saldo devedor
        const saldo = i === 0
            ? valorFinanciado - amortizacaoMedia
            : resultadoSAM[i - 1].saldo - amortizacaoMedia;

        resultadoSAM.push({
            numeroParcela: i + 1,
            amortizacao: amortizacaoMedia.toFixed(2),
            juros: jurosMedia.toFixed(2),
            parcela: parcelaMedia.toFixed(2),
            saldo: saldo.toFixed(2)
        });
    }

    return resultadoSAM; // Retorna o resultado do financiamento
}
