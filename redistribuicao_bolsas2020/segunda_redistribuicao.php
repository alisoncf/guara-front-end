#!/usr/bin/php
<?php
$loader['locais'][] = '';
$loader['dependencias'][] = '../../html/library/';
include("../../html/library/AutoLoader.php5");
AutoLoader::init();
include '../config/config_banco.php';
include './source/functions.php';
include './source/functions_importacao.php';

$tdg = TDG::getInstance();
$pastaFiles = __DIR__ . '/arquivos/segunda/';
$pastaLogs = __DIR__ . '/arquivos/log/';
$sqlGeral = '';
$start = Util::getStartExecutionTime();
echo "Inicio: " . date('d-m-Y H:i:s', $start);
echo "\n";

$sql = "
select grande_area, nome_coordenador, nome_academico,modalidade_exec_final, id_bolsista,id_coordenador,modalidade_vigente_final_exec_id, modalidade, modalidade_id, modalidade_vigente_final_id, modalidade_final
from
	public._bolsistas_2020
	where modalidade_vigente_final_exec_id not in (56,57,58)--CNPQ
	and modalidade_vigente_final_exec_id not in (62,63)--BOLSAS UEG
	and modalidade_vigente_final_exec_id not in (59)--BOLSAS EM
	and id_coordenador not in ( -- ja tem 2 bolsas de ajuda de custo
							select id_coordenador 
							from
								public._bolsistas_2020
								where modalidade_vigente_final_exec_id in (56,57,58)--CNPQ
								or modalidade_vigente_final_exec_id in (62,63)--BOLSAS UEG
							group by 1
							having count(*) > 1
							)
order by 
	grande_area,
	ordem,
	tipo_resultado,
	pontuacao_final desc,
	media_global_historico desc,
	dt_nascimento asc
	";


$bolsistasCandidatosSegundaDistribuicao2020 = TDG::getInstance()->genericQuery($sql);

$orientadores = [];
$bolsas[0] = ['PBIC', 'PBIT'];
$countPbic = 0;
$countPtic = 0;
/**
 * remanescentes da primeira distribuicao
 */
$maxPbic = 96;
$maxPtic = 19;
$sqlAjusteBolsa = '';

/**
 * PBIC = 190
 * PBIT = 25
 */
$countGeral = 0;
for ($index = 0; $index < count($bolsistasCandidatosSegundaDistribuicao2020); $index++) {
	$bolsista = $bolsistasCandidatosSegundaDistribuicao2020[$index];
	if (isset($orientadores[$bolsista['id_coordenador']])) { //dos orientadores candidatos somente uma bolsa para cada um
		continue;
	}
	++$countGeral;
	$orientadores[$bolsista['id_coordenador']] = $bolsista;
	$idBolsista = $bolsista['id_bolsista'];
	$idBolsaVigenteExec = 0;
	switch ($bolsista['modalidade_vigente_final_exec_id']) {
		case TipoBolsa::PVIC_UEG:
			$idBolsaVigenteExec = TipoBolsa::PBIC_UEG;
			break;
		case TipoBolsa::PVIT_UEG:
			$idBolsaVigenteExec = TipoBolsa::PBIT_UEG;
			break;
	}
	$idBolsaVigente = 0;
	switch ($bolsista['modalidade_vigente_final_id']) {
		case TipoBolsa::PVIC_UEG:
			$idBolsaVigente = TipoBolsa::PBIC_UEG;
			break;
		case TipoBolsa::PVIT_UEG:
			$idBolsaVigente = TipoBolsa::PBIT_UEG;
			break;
	}
	if ($idBolsaVigenteExec == 0 || $idBolsaVigente == 0) {
		continue;
	}
	if ($idBolsaVigenteExec == TipoBolsa::PBIC_UEG && (($countPbic + 1) <= $maxPbic)) {
		$countPbic += 1;
	}
	if ($idBolsaVigenteExec == TipoBolsa::PBIT_UEG && (($countPtic + 1) <= $maxPtic)) {
		$countPtic += 1;
	}
	$sqlAjusteBolsa .= "update athena.bolsista set fk_modalidade_bolsa_vigente_final = $idBolsaVigente, fk_modalidade_bolsa_vigente_em_exec = $idBolsaVigenteExec where id = $idBolsista; \n";
}
try {
	$bolsas[1] = [$countPbic, $countPtic];
	criarArquivoCSV($pastaFiles . 'bolsas_distribuidas_segundo_processamento.csv', $bolsas);
	//Persistir no banco de dados:
	criarArquivo($pastaFiles.'sql_segundo_ajuste.sql', $sqlAjusteBolsa);
	TDG::getInstance()->genericQuery($sqlAjusteBolsa);
} catch (Exception $exc) {
	Util::shellDebug($exc);
}

//Criar o arquivo com o comando SQL:
//criarArquivo($pastaFiles.'sqlAjuste.sql', $sqlAjusteBolsa);
$fim = Util::getElapsedExecutionTime($start);
echo "Fim:    " . date('d-m-Y H:i:s', $start + $fim);
echo "\n";


