#!/usr/bin/php
<?php
$loader['locais'][] = '';
$loader['dependencias'][] = '../../html/library/';
include("../../html/library/AutoLoader.php5");
AutoLoader::init();
include '../config/config_banco.php';
include './arquivos/functions.php';
include './arquivos/functions_importacao.php';

$tdg = TDG::getInstance();
$pastaFiles = __DIR__ . '/arquivos/';
$pastaLogs = __DIR__ . '/arquivos/log/';
$sqlGeral = '';
$start = Util::getStartExecutionTime();
echo "Inicio: " . date('d-m-Y H:i:s', $start);
echo "\n";

$sql = "
	select nome_coordenador, nome_academico,modalidade_exec_final, id_bolsista,id_coordenador,modalidade_vigente_final_exec_id, modalidade, modalidade_id
from
	public._bolsistas_2020
order by 
	grande_area,
	ordem,
	tipo_resultado,
	pontuacao_final desc,
	media_global_historico desc,
	dt_nascimento asc
	";


$bolsistas2020 = TDG::getInstance()->genericQuery($sql);

$docentesBolsitasProdutividade = TDG::getInstance()->genericQuery("
	select distinct docente.id
	from athena.item_produtividade ip
	join athena.tipo_item_produtividade tip on ip.fk_tipo_item_produtividade = tip.id 
	join athena.item_avaliado_produtividade iap on iap.fk_item_produtividade = ip.id
	join athena.produtividade p on iap.fk_produtividade = p.id
	join ueg.pessoas_fisicas docente on p.fk_pessoa_fisica = docente.id
	join athena.projeto p2 on docente.id = p2.fk_pessoa_fisica 
	join athena.edital_bolsista eb on tip.fk_edital_bolsista = eb.id 
	where ip.descricao ilike '%produtividade%'
	and eb.processo = '20201'
	and iap.pontuacao_item_valida > 0
	");

$docentesBolsitasProdutividadeFinal = [];
for ($index = 0; $index < count($docentesBolsitasProdutividade); $index++) {
	$docentesBolsitasProdutividadeFinal[] = $docentesBolsitasProdutividade[$index]['id'];
}
criarArquivoCSV($pastaFiles . 'bolsistas2020.csv', $bolsistas2020);

$orientadores = getOrientadoresSemAjudaCusta($bolsistas2020);
$orientadoresCandidatos = array_merge($docentesBolsitasProdutividadeFinal,$orientadores);

$id_coordenadores = implode(',', $orientadoresCandidatos);


$sql = "
	select nome_coordenador, nome_academico,modalidade_exec_final, id_bolsista,id_coordenador,modalidade_vigente_final_exec_id, modalidade, modalidade_id
from
	public._bolsistas_2020
	where id_coordenador in ($id_coordenadores)
order by 
	grande_area,
	ordem,
	tipo_resultado,
	pontuacao_final desc,
	media_global_historico desc,
	dt_nascimento asc
	";

Util::shellDebug($sql);
$bolsistasCandidatos2020 = TDG::getInstance()->genericQuery($sql);

Util::shellDebug(count($bolsistasCandidatos2020));



$fim = Util::getElapsedExecutionTime($start);
echo "Fim:    " . date('d-m-Y H:i:s', $start + $fim);
echo "\n";


