$(document).ready(() => {
    $('.tabela td > input').parent().addClass('bg-gray-700');
});

$('#populacao_quantidade').on('keyup', () => {
    definirNumeroIndividuos();
});

$('#limpar_campos_tabela').on('click', () => {
    $('#tbody_tabela > tr > td > input').val('');
});
$('#limpar_campos_tabela_individuos').on('click', () => {
    $('#tbody_tabela_individuos > tr > td > input').val('');
});
$('#limpar_restricao_taxa').on('click', () => {
    $('#peso_limite,#populacao_quantidade,#mutacao_taxa').val('');
});
$('#limpar_selecao_crossover').on('click', () => {
    $('#aleatorio_pai_melhor,#aleatorio_pai_pior').val('');
});
$('#limpar_crossover').on('click', () => {
    $('#aleatorio_crossover').val('');
});
$('#limpar_mutacao').on('click', () => {
    $('#aleatorio_mutara,#aleatorio_quem_mutara,#aleatorio_gene_mutara,#aleatorio_numero_gene').val('');
});
$('.modalResultado, .modalFilho').on('click', (e) => {
    if(e.target.id == 'modal'){
        $('.modalResultado').addClass('hidden');
        $('body').removeClass('overflow-y-hidden');
    }
});
$('#calcular').on('click', () => {
    montarResultadoFinal();
    $('.modalResultado').removeClass('hidden');
    $('body').addClass('overflow-y-hidden');
});


const parseNumberInt = (valor) => {
    return  valor == '' ? 0 : parseInt(valor);
};

const parseNumberFloat = (valor, porcentagem) => {
    if(porcentagem){
        valor = valor < 1 ? valor : valor / 100;
    }
    return  valor == '' ? 0.0 : parseFloat(valor);
};

const genePorProbabilidade = (genes, total, aleatorioEscolha) => {
    const objFinal = [];

    var totalPorcentagem = 0;

    for(i = 0; i < genes.length; i++){
        const valorPorcentagem = genes[i].valor / total;
        totalPorcentagem += parseFloat(valorPorcentagem.toFixed(2));
        objFinal.push(totalPorcentagem);
    };

    for(i = 0; i < objFinal.length; i++){
        if(aleatorioEscolha < objFinal[i]){
            return i;
        };
        if(i + 1 == objFinal.length){
            return i;
        };
    };
};

const itemPorProbabilidade = (qtdItens, aleatorio, itemInicial) => {
    var num     = aleatorio * qtdItens;

    var valSel      = Math.trunc(num);
    var isInt       = valSel == num;
    var isRdmZero   = aleatorio == 0.0;

    var escolhido;

    if (isInt && ! isRdmZero){
        escolhido = valSel - 1;
    }else{
        escolhido = valSel;
    };
    
    return escolhido + itemInicial;
};  

const pesoItem = () => {
    const pesoObj = {};
    for(i = 1; i < 4; i++){
        pesoObj[i] = parseNumberInt($('#p' + i).val());
    }
    return pesoObj;
};

const valorItem = () => {
    const valorObj = {};
    for(i = 1; i < 4; i++){
        valorObj[i] = parseNumberFloat($('#v' + i).val(), false);
    }
    return valorObj;
};

const qtdItem = () => {
    const qtdObj = {};
    for(i = 1; i < 4; i++){
        qtdObj[i] = parseNumberInt($('#qtd' + i).val());
    }
    return qtdObj;
};

const convergenciaPaiMelhorPior = () => {
    const media = parseInt(parseNumberInt($('#populacao_quantidade').val()) / 2);
    return media;
};

const definirNumeroIndividuos = () => {
    const qtdIndividuo = parseNumberInt($('#populacao_quantidade').val());

    const templateLinha = (id) => {
        return `
            <tr>
                <td>${id}</td>
                <td class="bg-gray-700"><input type="number" id="individuo${id}item1"></td>
                <td class="bg-gray-700"><input type="number" id="individuo${id}item2"></td>
                <td class="bg-gray-700"><input type="number" id="individuo${id}item3"></td>
            </tr>
        `;
    };

    $('#tbody_tabela_individuos').html('');

    for(i = 1; i < qtdIndividuo + 1; i++){
        $('#tbody_tabela_individuos').append(templateLinha(i));
    };
};

const montarResultadoFinal = () => {
    const individuos = mutacao();

    const individuosFinais = calculoPesoValorIndividuos();

    for(i = 0; i < individuos.executeFinal.length; i++){
        individuos.executeFinal[i].item.val(individuos.executeFinal[i].execucao);
    }

    const templateLinha = (id, itens, peso, valor) => {
        return `
            <tr>
                <td>${id}</td>
                <td class="bg-gray-700"><input type="text" id="individuo${id}item1" value="${itens[0]}" class="text-xs sm:text-base" disabled></td>
                <td class="bg-gray-700"><input type="text" id="individuo${id}item2" value="${itens[1]}" class="text-xs sm:text-base" disabled></td>
                <td class="bg-gray-700"><input type="text" id="individuo${id}item3" value="${itens[2]}" class="text-xs sm:text-base" disabled></td>
                <td class="bg-gray-700"><input type="text" id="individuo${id}itemPeso" value="${peso}" class="text-xs sm:text-base" disabled></td>
                <td class="bg-gray-700"><input type="text" id="individuo${id}itemValor" value="${valor}" class="text-xs sm:text-base" disabled></td>
            </tr>
        `;
    };

    $('#tbody_tabela_individuos_inicial, #tbody_tabela_individuos_crossover, #tbody_tabela_individuos_mutacao, #tbody_tabela_individuos_final').html('');

    Object.values(individuos.individuos).forEach((e) => {
        var id      = e.individuo_id;
        var itens   = e.genes;
        var peso    = e.peso;
        var valor   = e.valor;

        return $('#tbody_tabela_individuos_inicial').append(templateLinha(id, itens, peso, valor));
    });

    Object.values(individuos.individuosNovosCrossover).forEach((e) => {
        var id          = e.individuo_id;
        var itens       = e.genes;
        var peso        = e.peso;
        var valor       = e.valor;
        var classe      = '';
        var pesoCor     = '';
        var valorCor    = '';
        var alteracao   = false;

        if(individuos.crossOverVisualResultMelhor.id == id){
            individuos.individuosNovosCrossover[id].genes[individuos.crossOverVisualResultMelhor.gene - 1] = individuos.crossOverVisualResultMelhor.res;
            itens       = individuos.individuosNovosCrossover[id].genes;
            alteracao   = true;
        }

        if(individuos.crossOverVisualResultPior.id == id){
            individuos.individuosNovosCrossover[id].genes[individuos.crossOverVisualResultPior.gene - 1] = individuos.crossOverVisualResultPior.res;
            itens       = individuos.individuosNovosCrossover[id].genes;
            alteracao   = true;
        }

        if(alteracao){
            classe      = 'red';
            pesoCor     = 'red';
            valorCor    = 'red';
            peso        = `${individuos.individuos[id].peso} -> ${peso}`;
            valor       = `${individuos.individuos[id].valor} -> ${valor}`;
        }

        $('#tbody_tabela_individuos_crossover').append(templateLinha(id, itens, peso, valor));
        $(`#tbody_tabela_individuos_crossover > tr > td> #individuo${id}item${individuos.crossOverVisualResultPior.gene}`).addClass(classe);
        $(`#tbody_tabela_individuos_crossover > tr > td> #individuo${id}itemPeso`).addClass(pesoCor);
        $(`#tbody_tabela_individuos_crossover > tr > td> #individuo${id}itemValor`).addClass(valorCor);
    });

    if(parseNumberFloat($('#aleatorio_mutara').val(), true) > parseNumberFloat($('#mutacao_taxa').val(), true)){
        $('#mutacao').addClass('hidden');
    }else{
        $('#mutacao').removeClass('hidden');
    }

    Object.values(individuos.individuosNovosMutacao).forEach((e) => {
        var id          = e.individuo_id;
        var itens       = e.genes;
        var peso        = e.peso;
        var valor       = e.valor;
        var classe      = '';
        var pesoCor     = '';
        var valorCor    = '';

        if(individuos.mutacaoVisualResult.id == id){
            individuos.individuosNovosMutacao[id].genes[individuos.mutacaoVisualResult.gene - 1] = individuos.mutacaoVisualResult.res;
            itens       = individuos.individuosNovosMutacao[id].genes
            classe      = 'red';
            pesoCor     = 'red';
            valorCor    = 'red';
            peso        = `${individuos.individuosNovosCrossover[id].peso} -> ${peso}`;
            valor       = `${individuos.individuosNovosCrossover[id].valor} -> ${valor}`;
        }

        $('#tbody_tabela_individuos_mutacao').append(templateLinha(id, itens, peso, valor));
        $(`#tbody_tabela_individuos_mutacao > tr > td> #individuo${id}item${individuos.mutacaoVisualResult.gene}`).addClass(classe);
        $(`#tbody_tabela_individuos_mutacao > tr > td> #individuo${id}itemPeso`).addClass(pesoCor);
        $(`#tbody_tabela_individuos_mutacao > tr > td> #individuo${id}itemValor`).addClass(valorCor);
    });

    Object.values(individuosFinais).forEach((e) => {
        var id              = e.individuo_id;
        var itens           = e.genes;
        var peso            = e.peso;
        var valor           = e.valor;
        var itensIniciais   = individuos.individuos[id].genes;
        var alteracao       = false;
        var itensRedCor     = [];
        var classe          = '';
        var pesoCor         = '';
        var valorCor        = '';

        for(i = 0; i < itensIniciais.length; i++) {
            if(itensIniciais[i] != itens[i]) {
                itens[i] = `${itensIniciais[i]} -> ${itens[i]}`;
                itensRedCor.push(`#tbody_tabela_individuos_final > tr > td> #individuo${id}item${i + 1}`)
                alteracao   = true;
            }
        }

        if(alteracao){
            classe      = 'red';
            pesoCor     = 'red';
            valorCor    = 'red';
            peso        = `${individuos.individuos[id].peso} -> ${peso}`;
            valor       = `${individuos.individuos[id].valor} -> ${valor}`;
        }

        $('#tbody_tabela_individuos_final').append(templateLinha(id, itens, peso, valor));
        $(`${itensRedCor.length == 0 ? '1': itensRedCor.join(',')}`).addClass(classe);
        $(`#tbody_tabela_individuos_final > tr > td> #individuo${id}itemPeso`).addClass(pesoCor);
        $(`#tbody_tabela_individuos_final > tr > td> #individuo${id}itemValor`).addClass(valorCor);
    });
};

const calculoPesoValorIndividuos = () => {
    const pesos         = pesoItem();
    const valores       = valorItem();
    const qtdIndividuo  = parseNumberInt($('#populacao_quantidade').val());
    const individuoObj  = {};

    for(i = 1; i < qtdIndividuo + 1; i++){
        const qtdItem1 = parseNumberInt($(`#individuo${i}item1`).val());
        const qtdItem2 = parseNumberInt($(`#individuo${i}item2`).val());
        const qtdItem3 = parseNumberInt($(`#individuo${i}item3`).val());

        individuoObj[i] = {
            peso            : qtdItem1 * pesos[1] + qtdItem2 * pesos[2] + qtdItem3 * pesos[3],
            valor           : qtdItem1 * valores[1] + qtdItem2 * valores[2] + qtdItem3 * valores[3],
            individuo_id    : i,
            genes           : [qtdItem1, qtdItem2, qtdItem3]
        };
    };
    return individuoObj;
};

const selecaoPaiMelhorPior = () => {
    const qtdIndividuo          = parseNumberInt($('#populacao_quantidade').val());
    const pesoLimite            = parseNumberFloat($('#peso_limite').val(), false);
    const pesoValorIndividuo    = calculoPesoValorIndividuos();
    const media                 = convergenciaPaiMelhorPior();
    
    const listaPesos    = [];
    const melhores      = [];
    const piores        = [];
    const ordemMelhor   = [];
    const ordemPior     = [];

    for(i = 1; i < qtdIndividuo + 1; i++){
        listaPesos[i] = Math.abs(pesoLimite - pesoValorIndividuo[i].peso);
    };

    const itemMelhorPior = Object.keys(listaPesos).sort(function(a,b){return listaPesos[a]-listaPesos[b]});

    for(i = 0; i < itemMelhorPior.length; i++){
        if(i < media){
            melhores.push(pesoValorIndividuo[itemMelhorPior[i]]);
            ordemMelhor.push(itemMelhorPior[i]);
        }else{
            piores.push(pesoValorIndividuo[itemMelhorPior[i]]);
            ordemPior.push(itemMelhorPior[i]);
        }
    };

    return {
        melhor      : melhores,
        pior        : piores,
        ordemMelhor : ordemMelhor,
        ordemPior   : ordemPior,
        individuos  : pesoValorIndividuo
    };
};

const selecaoParaCrossover = () => {
    const aleatorioPaiMelhor    = parseNumberFloat($('#aleatorio_pai_melhor').val(), true);
    const aleatorioPaiPior      = parseNumberFloat($('#aleatorio_pai_pior').val(), true);
    const individuosMelhorPior  = selecaoPaiMelhorPior();

    var somaMelhor    = 0;
    var somaPior      = 0;

    for(i = 0; i < individuosMelhorPior.melhor.length; i++){
        somaMelhor += individuosMelhorPior.melhor[i].valor;
    };

    for(i = 0; i < individuosMelhorPior.pior.length; i++){
        somaPior += individuosMelhorPior.pior[i].valor;
    };

    const geneEscolhaMelhor = genePorProbabilidade(individuosMelhorPior.melhor, somaMelhor, aleatorioPaiMelhor);
    const geneEscolhaPior   = genePorProbabilidade(individuosMelhorPior.pior, somaPior, aleatorioPaiPior);

    individuosMelhorPior.crossOver = [individuosMelhorPior.ordemMelhor[geneEscolhaMelhor], individuosMelhorPior.ordemPior[geneEscolhaPior]];

    return individuosMelhorPior;
};

const crossOver = () => {
    const aleatorioCrossover    = parseNumberFloat($('#aleatorio_crossover').val(), true);
    const selecaoCrossover      = selecaoParaCrossover();
    const geneCrossover         = itemPorProbabilidade(3, aleatorioCrossover, 1);

    const valorItemMelhor = $(`#individuo${selecaoCrossover.crossOver[0]}item${geneCrossover}`).val();
    const valorItemPior = $(`#individuo${selecaoCrossover.crossOver[1]}item${geneCrossover}`).val();

    $(`#individuo${selecaoCrossover.crossOver[0]}item${geneCrossover}`).val(valorItemPior);
    $(`#individuo${selecaoCrossover.crossOver[1]}item${geneCrossover}`).val(valorItemMelhor);

    selecaoCrossover.individuosNovosCrossover = calculoPesoValorIndividuos();

    selecaoCrossover.crossOverVisualResultMelhor = {
        id      : selecaoCrossover.crossOver[0], 
        gene    : geneCrossover,
        res     : `${valorItemMelhor} -> ${valorItemPior}`
    }
    selecaoCrossover.crossOverVisualResultPior = {
        id      : selecaoCrossover.crossOver[1], 
        gene    : geneCrossover,
        res     : `${valorItemPior} -> ${valorItemMelhor}`
    }

    selecaoCrossover.executeFinal = [];
    selecaoCrossover.executeFinal.push({
        item        : $(`#individuo${selecaoCrossover.crossOver[0]}item${geneCrossover}`),
        execucao    : valorItemMelhor
    });
    selecaoCrossover.executeFinal.push({
        item        : $(`#individuo${selecaoCrossover.crossOver[1]}item${geneCrossover}`),
        execucao    : valorItemPior
    });

    return selecaoCrossover;
};

const mutacao = () => {
    const individuos            = crossOver();
    const aleatorioQuemMutara   = parseNumberFloat($('#aleatorio_quem_mutara').val(), true);
    const aleatorioGeneMutara   = parseNumberFloat($('#aleatorio_gene_mutara').val(), true);
    const aleatorionumeroGene   = parseNumberFloat($('#aleatorio_numero_gene').val(), true);
    const individuoMutacao      = itemPorProbabilidade(2, aleatorioQuemMutara, 1);
    const geneMutacao           = itemPorProbabilidade(3, aleatorioGeneMutara, 1);

    const quantidadeLimiteGene  = parseNumberInt($(`#qtd${geneMutacao}`).val());
    const numeroNovoGene        = itemPorProbabilidade(quantidadeLimiteGene + 1, aleatorionumeroGene, 0);

    console.log(quantidadeLimiteGene, aleatorionumeroGene, 0);

    const numeroAntigoGene       = $(`#individuo${individuos.crossOver[individuoMutacao - 1]}item${geneMutacao}`).val();

    $(`#individuo${individuos.crossOver[individuoMutacao - 1]}item${geneMutacao}`).val(numeroNovoGene);

    individuos.individuosNovosMutacao = calculoPesoValorIndividuos();

    individuos.mutacaoVisualResult = {
        id      : individuos.crossOver[individuoMutacao - 1],
        gene    : geneMutacao,
        res     : `${numeroAntigoGene} -> ${numeroNovoGene}`
    }

    individuos.executeFinal.push({
        item        : $(`#individuo${individuos.crossOver[individuoMutacao - 1]}item${geneMutacao}`),
        execucao    : numeroAntigoGene
    });

    return individuos;
}