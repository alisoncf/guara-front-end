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
$pastaFiles = __DIR__ . '/arquivos/primeira/';
$pastaLogs = __DIR__ . '/arquivos/log/';
$sqlGeral = '';
$start = Util::getStartExecutionTime();
echo "Inicio: " . date('d-m-Y H:i:s', $start);
echo "\n";

$sql = "
select grande_area, nome_coordenador, nome_academico,modalidade_exec_final, id_bolsista,id_coordenador,modalidade_vigente_final_exec_id, modalidade, modalidade_id, modalidade_vigente_final_id, modalidade_final
from
	public._bolsistas_2020
	where id_coordenador in (2381,2483,2567,3860,3938,6512,38127,39120,41450,3748,42869,39794,41514,36786,4046,4166,1838203,39149,2472,6853,39160,3893,32909,41453,35464,52022,4444,2462,36415,38485,37820,2386,41428,3936,38208,2542,38778,38132,39787,39595,4116,1957153,3876,1855700,41496,3877,42862,41163,4410,39626,37715,2469,2080600,1923650,42856,41440,37716,41539,36051,4193,2425,42815,3904,26976,4032,36406,11827,17828,5108,39185,24748,4199,1865155,38071,38077,36918,39572,39613,5413,2360,58299,21476,62697,36438,53935,38246,2545,41434,37947,1829736,39610,41445,4097,4602,41467,38223,42853,41509,4921)
	and modalidade_vigente_final_exec_id not in (56,57,58)
order by 
	grande_area,
	ordem,
	tipo_resultado,
	pontuacao_final desc,
	media_global_historico desc,
	dt_nascimento asc
	";


$bolsistas2020 = TDG::getInstance()->genericQuery($sql);

$orientadores = [];
$bolsas[0] = ['PBIC','PBIT'];
$countPbic = 0;
$countPtic = 0;
$sqlAjusteBolsa = '';

/**
 * PBIC = 190
 * PBIT = 25
 */
for ($index = 0; $index < count($bolsistas2020); $index++) {
	$bolsista = $bolsistas2020[$index];
	if(isset($orientadores[$bolsista['id_coordenador']])){ //dos orientadores candidatos somente uma bolsa para cada um
		continue;
	}
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
	if($idBolsaVigenteExec == 0 || $idBolsaVigente == 0){
		continue;
	}
	if($idBolsaVigenteExec == TipoBolsa::PBIC_UEG){
		$countPbic += 1;
	}
	if($idBolsaVigenteExec == TipoBolsa::PBIT_UEG){
		$countPtic += 1;
	}
	$sqlAjusteBolsa .= "update athena.bolsista set fk_modalidade_bolsa_vigente_final = $idBolsaVigente, fk_modalidade_bolsa_vigente_em_exec = $idBolsaVigenteExec where id = $idBolsista; \n";
}
try {
	$bolsas[1] = [$countPbic, $countPtic];
	criarArquivoCSV($pastaFiles.'bolsas_distribuidas_primeiro_processamento.csv', $bolsas);
	//Persistir no banco de dados:
	TDG::getInstance()->genericQuery($sqlAjusteBolsa);
} catch (Exception $exc) {
	Util::shellDebug($exc);
}

//Criar o arquivo com o comando SQL:
//criarArquivo($pastaFiles.'sqlAjuste.sql', $sqlAjusteBolsa);
$fim = Util::getElapsedExecutionTime($start);
echo "Fim:    " . date('d-m-Y H:i:s', $start + $fim);
echo "\n";


