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

    localStorage.setItem("resultadoFinanciamento", JSON.stringify(resultado));

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
    const meioPonto = Math.floor(parcelas / 2);
    const amortizacao = valorFinanciado / parcelas;
    let saldo = valorFinanciado;
    let resultado = [];

    for (let i = 1; i <= parcelas; i++) {
        const juros = saldo * taxa;
        const parcela = i <= meioPonto ? amortizacao + juros : (amortizacao + juros) * 0.8;
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
