document.getElementById("formularioFinanciamento").addEventListener("submit", function (evento) {
    evento.preventDefault(); // Previne o recarregamento da página

    const valorImovel = document.getElementById("valorImovel").value;
    const valorEntrada = document.getElementById("valorEntrada").value;
    const sistema = document.getElementById("sistema").value;
    const parcelas = document.getElementById("parcelas").value;
    const taxa = document.getElementById("taxa").value;

    if (!valorImovel || !valorEntrada || !sistema || !parcelas || !taxa) {
        alert("Por favor, preencha todos os campos antes de prosseguir.");
        return;
    }

    const valorImovelFloat = parseFloat(valorImovel);
    const valorEntradaFloat = parseFloat(valorEntrada);
    const parcelasInt = parseInt(parcelas);
    const taxaFloat = parseFloat(taxa) / 100;

    if (
        valorImovelFloat <= 0 ||
        valorEntradaFloat < 0 ||
        valorEntradaFloat >= valorImovelFloat ||
        parcelasInt <= 0 ||
        taxaFloat <= 0
    ) {
        alert("Por favor, insira valores válidos.");
        return;
    }

    const valorFinanciado = valorImovelFloat - valorEntradaFloat;
    let resultado = [];

    if (sistema === "SAC") {
        resultado = calcularSAC(valorFinanciado, parcelasInt, taxaFloat);
    } else if (sistema === "Price") {
        resultado = calcularPrice(valorFinanciado, parcelasInt, taxaFloat);
    } else if (sistema === "SAM") {
        resultado = calcularSAM(valorFinanciado, parcelasInt, taxaFloat);
    } else {
        alert("Selecione um sistema de financiamento válido.");
        return;
    }

    // Salvar o valor financiado no localStorage
    localStorage.setItem("valorFinanciado", valorFinanciado.toFixed(2));

    // Salvar o resultado do financiamento no localStorage
    localStorage.setItem("resultadoFinanciamento", JSON.stringify(resultado));

    // Redirecionar para a página de resultados
    window.location.href = "result.html";
});

function calcularSAC(valorFinanciado, parcelas, taxa) {
    const amortizacao = valorFinanciado / parcelas;
    let saldo = valorFinanciado;
    let resultado = [];

    for (let i = 1; i <= parcelas; i++) {
        const juros = saldo * taxa;
        const parcela = amortizacao + juros;
        resultado.push({
            numeroParcela: i,
            amortizacao: amortizacao.toFixed(2),
            juros: juros.toFixed(2),
            parcela: parcela.toFixed(2),
            saldo: (saldo - amortizacao).toFixed(2)
        });
        saldo -= amortizacao;
    }

    return resultado;
}

function calcularPrice(valorFinanciado, parcelas, taxa) {
    const fator = (taxa * Math.pow(1 + taxa, parcelas)) / (Math.pow(1 + taxa, parcelas) - 1);
    const parcela = valorFinanciado * fator;
    let saldo = valorFinanciado;
    let resultado = [];

    for (let i = 1; i <= parcelas; i++) {
        const juros = saldo * taxa;
        const amortizacao = parcela - juros;
        resultado.push({
            numeroParcela: i,
            amortizacao: amortizacao.toFixed(2),
            juros: juros.toFixed(2),
            parcela: parcela.toFixed(2),
            saldo: (saldo - amortizacao).toFixed(2)
        });
        saldo -= amortizacao;
    }

    return resultado;
}

function calcularSAM(valorFinanciado, parcelas, taxa) {
    // Calcula os valores usando os sistemas SAC e Price
    const resultadoSAC = calcularSAC(valorFinanciado, parcelas, taxa);
    const resultadoPrice = calcularPrice(valorFinanciado, parcelas, taxa);

    let resultadoSAM = [];

    for (let i = 0; i < parcelas; i++) {
        const amortizacaoMedia =
            (parseFloat(resultadoSAC[i].amortizacao) + parseFloat(resultadoPrice[i].amortizacao)) / 2;
        const jurosMedia =
            (parseFloat(resultadoSAC[i].juros) + parseFloat(resultadoPrice[i].juros)) / 2;
        const parcelaMedia =
            (parseFloat(resultadoSAC[i].parcela) + parseFloat(resultadoPrice[i].parcela)) / 2;

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

    return resultadoSAM;
}