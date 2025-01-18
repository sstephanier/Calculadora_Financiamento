document.getElementById("financingForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Previne o recarregamento da página

    // Captura os valores do formulário
    const propertyValue = document.getElementById("propertyValue").value;
    const downPayment = document.getElementById("downPayment").value;
    const system = document.getElementById("system").value;
    const installments = document.getElementById("installments").value;
    const rate = document.getElementById("rate").value;

    // Validação para campos vazios
    if (!propertyValue || !downPayment || !system || !installments || !rate) {
        alert("Por favor, preencha todos os campos antes de prosseguir.");
        return;
    }

    // Conversão dos valores para o tipo adequado
    const propertyValueFloat = parseFloat(propertyValue);
    const downPaymentFloat = parseFloat(downPayment);
    const installmentsInt = parseInt(installments);
    const rateFloat = parseFloat(rate) / 100;

    // Valida os dados do formulário
    if (
        propertyValueFloat <= 0 ||
        downPaymentFloat < 0 ||
        downPaymentFloat >= propertyValueFloat ||
        installmentsInt <= 0 ||
        rateFloat <= 0
    ) {
        alert("Por favor, insira valores válidos.");
        return;
    }

    const loanAmount = propertyValueFloat - downPaymentFloat; // Valor financiado
    let result = [];

    // Calcula o financiamento com base no sistema escolhido
    if (system === "SAC") {
        result = calculateSAC(loanAmount, installmentsInt, rateFloat);
    } else if (system === "Price") {
        result = calculatePrice(loanAmount, installmentsInt, rateFloat);
    } else if (system === "SAM") {
        result = calculateSAM(loanAmount, installmentsInt, rateFloat);
    } else {
        alert("Selecione um sistema de financiamento válido.");
        return;
    }

    // Salva os resultados no localStorage
    localStorage.setItem("financingResult", JSON.stringify(result));

    // Redireciona para a página de resultado
    window.location.href = "result.html";
});

// Cálculo do sistema SAC
function calculateSAC(loanAmount, installments, rate) {
    const amortization = loanAmount / installments;
    let balance = loanAmount;
    let result = [];

    for (let i = 1; i <= installments; i++) {
        const interest = balance * rate;
        const installment = amortization + interest;
        result.push({
            installmentNumber: i,
            amortization: amortization.toFixed(2),
            interest: interest.toFixed(2),
            installment: installment.toFixed(2),
            balance: (balance - amortization).toFixed(2)
        });
        balance -= amortization;
    }

    return result;
}

// Cálculo do sistema Price
function calculatePrice(loanAmount, installments, rate) {
    const factor = (rate * Math.pow(1 + rate, installments)) / (Math.pow(1 + rate, installments) - 1);
    const installment = loanAmount * factor;
    let balance = loanAmount;
    let result = [];

    for (let i = 1; i <= installments; i++) {
        const interest = balance * rate;
        const amortization = installment - interest;
        result.push({
            installmentNumber: i,
            amortization: amortization.toFixed(2),
            interest: interest.toFixed(2),
            installment: installment.toFixed(2),
            balance: (balance - amortization).toFixed(2)
        });
        balance -= amortization;
    }

    return result;
}

// Cálculo do sistema SAM (misto)
function calculateSAM(loanAmount, installments, rate) {
    const midPoint = Math.floor(installments / 2);
    const amortization = loanAmount / installments;
    let balance = loanAmount;
    let result = [];

    for (let i = 1; i <= installments; i++) {
        const interest = balance * rate;
        const installment = i <= midPoint ? amortization + interest : (amortization + interest) * 0.8;
        result.push({
            installmentNumber: i,
            amortization: amortization.toFixed(2),
            interest: interest.toFixed(2),
            installment: installment.toFixed(2),
            balance: (balance - amortization).toFixed(2)
        });
        balance -= amortization;
    }

    return result;
}
